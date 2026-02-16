import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { callService, type Call } from '../services/callService';

interface CallContextType {
    activeCall: Call | null;
    incomingCall: Call | null;
    isCalling: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    initiateCall: (receiverId: string, type: 'audio' | 'video') => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => Promise<void>;
    endCall: () => Promise<void>;
    toggleAudio: () => void;
    toggleVideo: () => void;
    toggleHold: () => void;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    isOnHold: boolean;
    callDuration: number;
    callStatus: 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'failed';
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const getSocketUrl = () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl;

    const { hostname, protocol, origin } = window.location;

    // If we're on localhost or an IP address, the backend is likely on port 5000
    if (hostname === 'localhost' || /^(\d+\.){3}\d+$/.test(hostname)) {
        return `${protocol}//${hostname}:5000`;
    }

    return origin; // Fallback to current origin (Production)
};

const SOCKET_URL = getSocketUrl();

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    // State for UI
    const [activeCall, setActiveCall] = useState<Call | null>(null);
    const [incomingCall, setIncomingCall] = useState<Call | null>(null);
    const [isCalling, setIsCalling] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'failed'>('idle');

    // Refs for internal logic (Stable between renders)
    const socket = useRef<Socket | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);
    const timerRef = useRef<any>(null);
    const callTimeoutRef = useRef<any>(null);

    // Sync stream ref for the cleanup function to access it without being a dependency
    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    // STABLE CLEANUP FUNCTION
    const cleanupCall = useCallback(() => {
        console.log('[CallContext] Performing detailed cleanup...');

        if (timerRef.current) clearInterval(timerRef.current);
        if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

        // Stop all tracks using the ref (avoids dependency loop)
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log(`[CallContext] Logic: Stopped ${track.kind} track`);
            });
            localStreamRef.current = null;
        }

        if (peerConnection.current) {
            peerConnection.current.onicecandidate = null;
            peerConnection.current.ontrack = null;
            peerConnection.current.oniceconnectionstatechange = null;
            peerConnection.current.onconnectionstatechange = null;
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Reset state
        setLocalStream(null);
        setRemoteStream(null);
        setActiveCall(null);
        setIncomingCall(null);
        setIsCalling(false);
        setCallStatus('idle');
        setCallDuration(0);
        iceCandidatesQueue.current = [];
        setIsAudioMuted(false);
        setIsVideoMuted(false);
    }, []); // Zero dependencies = Stable reference

    // Socket Event Loop (Depends only on user ID and Stable cleanup)
    useEffect(() => {
        if (!user) return;
        const userId = user.id || user._id;
        if (!userId) return;

        console.log('[CallContext] Initializing Socket for user:', userId);
        socket.current = io(SOCKET_URL);
        socket.current.emit('register', String(userId));

        socket.current.on('incoming-call', ({ from, offer, type, callerInfo }) => {
            console.log('[CallContext] Incoming call event from:', from);
            if (callerInfo) {
                setIncomingCall({
                    _id: callerInfo.callId,
                    caller: callerInfo,
                    receiver: { _id: String(user.id || user._id), name: user.name, unique_id: user.unique_id },
                    type,
                    status: 'ringing',
                    offer,
                    roomName: callerInfo.roomName,
                    timestamp: new Date().toISOString()
                });
                setCallStatus('ringing');
            }
        });

        socket.current.on('call-answered', async ({ answer }) => {
            console.log('[CallContext] Recipient answered. Establishing connection...');
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = null;
            }
            setCallStatus('connected');
            setIsCalling(false);

            if (peerConnection.current) {
                try {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));

                    // Process ICE candidates
                    while (iceCandidatesQueue.current.length > 0) {
                        const candidate = iceCandidatesQueue.current.shift();
                        if (candidate) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }

                    // Connected timer
                    if (timerRef.current) clearInterval(timerRef.current);
                    setCallDuration(0);
                    timerRef.current = setInterval(() => {
                        setCallDuration(prev => prev + 1);
                    }, 1000);
                } catch (e) {
                    console.error('[CallContext] SDP Answer Error:', e);
                }
            }
        });

        socket.current.on('ringing', () => {
            console.log('[CallContext] Recipient reachable, status -> RINGING');
            setCallStatus('ringing');
        });

        socket.current.on('user-offline', () => {
            console.warn('[CallContext] Recipient is currently offline');
            alert('The user is currently offline.');
            cleanupCall();
        });

        socket.current.on('ice-candidate', async ({ candidate }) => {
            if (peerConnection.current?.remoteDescription) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error('[CallContext] ICE Candidate Error:', e);
                }
            } else {
                iceCandidatesQueue.current.push(candidate);
            }
        });

        socket.current.on('hangup', () => {
            console.log('[CallContext] Remote hangup signal received');
            cleanupCall();
        });

        socket.current.on('new-message', (data) => {
            console.log('[CallContext] Received real-time message:', data);
            window.dispatchEvent(new CustomEvent('socket-message', { detail: data }));
        });

        socket.current.on('new-notification', (data) => {
            console.log('[CallContext] Received real-time notification:', data);
            // Dispatch a custom event so dashboards can listen without depending on CallContext
            window.dispatchEvent(new CustomEvent('socket-notification', { detail: data }));
        });

        return () => {
            console.log('[CallContext] Cleaning up context effect...');
            cleanupCall();
            socket.current?.disconnect();
        };
    }, [user?.id, user?._id, cleanupCall]); // cleanupCall is stable now, no more loops!

    const createPeerConnection = (targetUserId: string) => {
        // Robust ICE Servers for Production
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                // Note: For 100% reliability in production (especially on mobile/corporate networks), 
                // you MUST include a TURN server here. Public STUN servers only handle basic NAT traversal.
            ],
            iceCandidatePoolSize: 10,
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.current?.emit('ice-candidate', { to: String(targetUserId), candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log('[CallContext] Received remote track:', event.track.kind);
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('[CallContext] PC State:', pc.connectionState);
            if (pc.connectionState === 'failed') cleanupCall();
        };

        peerConnection.current = pc;
        return pc;
    };

    const initiateCall = async (receiverId: string, type: 'audio' | 'video') => {
        if (isCalling || activeCall || incomingCall) return;

        try {
            console.log(`[CallContext] Starting ${type} call to ${receiverId}...`);
            setActiveCall(null);
            setIsCalling(true);
            setCallStatus('calling'); // Starts as CALLING (Dynamic)

            // 1. Media First (Verify hardware before signaling)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            });
            setLocalStream(stream);
            localStreamRef.current = stream;

            // 2. Open internal Call Record
            const call = await callService.initiateCall(String(user?.id), receiverId, type);
            setActiveCall(call);

            // 3. Signaling setup
            const pc = createPeerConnection(receiverId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: type === 'video' });
            await pc.setLocalDescription(offer);

            // 4. Send signal
            const currentUserId = user?.id || user?._id;
            const callerInfo = {
                _id: String(currentUserId),
                name: user?.name || 'User',
                image_url: user?.image_url || '/default-avatar.png',
                unique_id: user?.unique_id || 'UID',
                callId: call._id,
                roomName: call.roomName
            };

            socket.current?.emit('call-user', { to: receiverId, offer, from: String(currentUserId), type, callerInfo });

            // 5. Timeout
            callTimeoutRef.current = setTimeout(() => {
                if (callStatus !== 'connected') {
                    console.warn('[CallContext] Call timed out out after 45s');
                    endCall();
                }
            }, 45000);

        } catch (err: any) {
            console.error('[CallContext] Media Permission Error:', err);
            alert('Hardware access denied. Please allow camera/microphone permissions in your browser settings.');
            cleanupCall();
        }
    };

    const [isAccepting, setIsAccepting] = useState(false);

    const acceptCall = async () => {
        if (!incomingCall || !incomingCall.offer || isAccepting) return;

        try {
            setIsAccepting(true);
            console.log('[CallContext] Accepting call from:', incomingCall.caller.name);

            // 1. Media First
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: incomingCall.type === 'video'
            });
            setLocalStream(stream);
            localStreamRef.current = stream;

            // 2. Setup Peer
            const pc = createPeerConnection(String(incomingCall.caller._id));
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.current?.emit('answer-call', { to: String(incomingCall.caller._id), answer });

            // 3. Finalize Status
            setCallStatus('connected');
            setActiveCall(incomingCall);
            setIncomingCall(null);

            setCallDuration(0);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);

            await callService.updateCallStatus(incomingCall._id, 'accepted').catch(() => { });

        } catch (err) {
            console.error('[CallContext] Accept Call Error:', err);
            alert('Could not access microphone or camera. Hardware might be in use by another application.');
            cleanupCall();
        } finally {
            setIsAccepting(false);
        }
    };

    const rejectCall = async () => {
        if (!incomingCall) return;
        socket.current?.emit('hangup', { to: String(incomingCall.caller._id) });
        await callService.updateCallStatus(incomingCall._id, 'rejected').catch(() => { });
        cleanupCall();
    };

    const endCall = async () => {
        const currentUserId = user?.id || user?._id;
        let targetId = activeCall ? (String(currentUserId) === String(activeCall.caller._id) ? (activeCall.receiver._id || activeCall.receiver) : (activeCall.caller._id || activeCall.caller)) : incomingCall?.caller._id;

        if (targetId) socket.current?.emit('hangup', { to: String(targetId) });
        if (activeCall?._id) await callService.updateCallStatus(activeCall._id, 'ended').catch(() => { });

        cleanupCall();
    };

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; setIsAudioMuted(!t.enabled); });
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; setIsVideoMuted(!t.enabled); });
        }
    };

    const [isOnHold, setIsOnHold] = useState(false);
    const preHoldState = useRef({ audio: false, video: false });

    const toggleHold = () => {
        if (!activeCall) return;

        setIsOnHold(prev => {
            const newHoldState = !prev;

            if (newHoldState) {
                // ENTERING HOLD: Save state and mute everything
                preHoldState.current = { audio: isAudioMuted, video: isVideoMuted };

                // Mute Audio
                if (localStream) localStream.getAudioTracks().forEach(t => { t.enabled = false; });
                setIsAudioMuted(true);

                // Mute Video
                if (localStream) localStream.getVideoTracks().forEach(t => { t.enabled = false; });
                setIsVideoMuted(true);
            } else {
                // EXITING HOLD: Restore state
                const { audio, video } = preHoldState.current;

                // Restore Audio
                if (!audio && localStream) { // If it was NOT muted
                    localStream.getAudioTracks().forEach(t => { t.enabled = true; });
                    setIsAudioMuted(false);
                }

                // Restore Video
                if (!video && localStream) { // If it was NOT muted
                    localStream.getVideoTracks().forEach(t => { t.enabled = true; });
                    setIsVideoMuted(false);
                }
            }
            return newHoldState;
        });
    };

    return (
        <CallContext.Provider value={{
            activeCall, incomingCall, initiateCall, acceptCall, rejectCall, endCall,
            isCalling, localStream, remoteStream, toggleAudio, toggleVideo, toggleHold,
            isAudioMuted, isVideoMuted, isOnHold, callDuration, callStatus
        }}>
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within a CallProvider');
    return context;
};
