import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { callService, type Call } from '../services/callService';
import { useSocketStore } from '../store/useSocketStore';

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

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { socket: globalSocket } = useSocketStore();

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
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const iceCandidatesQueue = useRef<any[]>([]);
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

    // Socket Event Loop (Depends only on globalSocket and user)
    useEffect(() => {
        if (!globalSocket || !user) return;

        const socket = globalSocket;
        const userId = user.id || user._id;

        console.log('[CallContext] Subscribing to Call Events for user:', userId);

        const onIncomingCall = ({ from, offer, type, callerInfo }: any) => {
            console.log('[CallContext] SIGNAL: Incoming call from:', from);
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
        };

        const onCallAnswered = async ({ answer }: any) => {
            console.log('[CallContext] SIGNAL: Recipient answered. Connecting WebRTC...');
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = null;
            }
            setCallStatus('connected');
            setIsCalling(false);

            if (peerConnection.current) {
                try {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));

                    // Flush queued ICE candidates
                    while (iceCandidatesQueue.current.length > 0) {
                        const candidate = iceCandidatesQueue.current.shift();
                        if (candidate) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }

                    // Start duration timer
                    setCallDuration(0);
                    if (timerRef.current) clearInterval(timerRef.current);
                    timerRef.current = setInterval(() => {
                        setCallDuration(prev => prev + 1);
                    }, 1000);
                } catch (e) {
                    console.error('[CallContext] Connection Error:', e);
                }
            }
        };

        const onRinging = () => {
            console.log('[CallContext] SIGNAL: Recipient ringing');
            setCallStatus('ringing');
        };

        const onUserOffline = () => {
            console.warn('[CallContext] SIGNAL: Recipient is offline');
            alert('The user is currently offline or has disconnected.');
            cleanupCall();
        };

        const onIceCandidate = async ({ candidate }: any) => {
            if (peerConnection.current?.remoteDescription) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error('[CallContext] ICE Candidate Error:', e);
                }
            } else {
                iceCandidatesQueue.current.push(candidate);
            }
        };

        const onHangup = () => {
            console.log('[CallContext] SIGNAL: Hangup received');
            cleanupCall();
        };

        // Attach listeners
        socket.on('incoming-call', onIncomingCall);
        socket.on('call-answered', onCallAnswered);
        socket.on('ringing', onRinging);
        socket.on('user-offline', onUserOffline);
        socket.on('ice-candidate', onIceCandidate);
        socket.on('hangup', onHangup);

        return () => {
            console.log('[CallContext] Cleaning up Socket listeners (preserving state)');
            socket.off('incoming-call', onIncomingCall);
            socket.off('call-answered', onCallAnswered);
            socket.off('ringing', onRinging);
            socket.off('user-offline', onUserOffline);
            socket.off('ice-candidate', onIceCandidate);
            socket.off('hangup', onHangup);
            // NOTE: We DO NOT call cleanupCall() here anymore. 
            // This prevents calls from cutting when the socket briefly reconnects or user state updates.
        };
    }, [globalSocket, user?.id, user?._id]);

    const createPeerConnection = (targetUserId: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:stun.services.mozilla.com' },
                { urls: 'stun:stun.ekiga.net' },
                { urls: 'stun:stun.metered.ca:80' },
            ],
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && globalSocket) {
                globalSocket.emit('ice-candidate', { to: String(targetUserId), candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log('[CallContext] Received remote track:', event.track.kind);
            if (event.streams && event.streams[0]) {
                // Create a new MediaStream instance to force React state update if the object reference matters
                setRemoteStream(new MediaStream(event.streams[0].getTracks()));
            } else {
                setRemoteStream(prev => {
                    const stream = prev || new MediaStream();
                    stream.addTrack(event.track);
                    return new MediaStream(stream.getTracks());
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('[CallContext] PC State:', pc.connectionState);
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                console.warn('[CallContext] Connection lost or failed. Attempting to keep UI alive for 3s...');
                setCallStatus('failed');
                setTimeout(() => {
                    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                        cleanupCall();
                    }
                }, 3000);
            }
        };

        peerConnection.current = pc;
        return pc;
    };

    const initiateCall = async (receiverId: string, type: 'audio' | 'video') => {
        if (isCalling || activeCall || incomingCall || !globalSocket) return;

        try {
            console.log(`[CallContext] Starting ${type} call to ${receiverId}...`);
            setActiveCall(null);
            setIsCalling(true);
            setCallStatus('calling');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            });
            setLocalStream(stream);
            localStreamRef.current = stream;

            const call = await callService.initiateCall(String(user?.id), receiverId, type);
            setActiveCall(call);

            const pc = createPeerConnection(receiverId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: type === 'video' });
            await pc.setLocalDescription(offer);

            const currentUserId = user?.id || user?._id;
            const callerInfo = {
                _id: String(currentUserId),
                name: user?.name || 'User',
                image_url: user?.image_url || '/default-avatar.png',
                unique_id: user?.unique_id || 'UID',
                callId: call._id,
                roomName: call.roomName
            };

            globalSocket.emit('call-user', { to: receiverId, offer, from: String(currentUserId), type, callerInfo });

            callTimeoutRef.current = setTimeout(() => {
                if (callStatus !== 'connected') {
                    console.warn('[CallContext] Call timed out after 45s');
                    endCall();
                }
            }, 45000);

        } catch (err: any) {
            console.error('[CallContext] Call Error:', err);
            const msg = err.name === 'NotAllowedError'
                ? 'Camera/Microphone access denied. Please allow permissions in your browser to make calls.'
                : 'Could not start the call. Please check your hardware and try again.';
            alert(msg);
            cleanupCall();
        }
    };

    const acceptCall = async () => {
        if (!incomingCall || !incomingCall.offer || !globalSocket) return;

        try {
            console.log('[CallContext] Accepting call from:', incomingCall.caller.name);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: incomingCall.type === 'video'
            });
            setLocalStream(stream);
            localStreamRef.current = stream;

            const pc = createPeerConnection(String(incomingCall.caller._id));
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            globalSocket.emit('answer-call', { to: String(incomingCall.caller._id), answer });

            setCallStatus('connected');
            setActiveCall(incomingCall);
            setIncomingCall(null);

            setCallDuration(0);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);

            await callService.updateCallStatus(incomingCall._id, 'accepted').catch(() => { });

        } catch (err: any) {
            console.error('[CallContext] Accept Call Error:', err);
            const msg = err.name === 'NotAllowedError'
                ? 'Camera/Microphone access was denied. Please enable permissions in your browser.'
                : 'Could not connect to media devices. They might be in use by another app.';
            alert(msg);
            cleanupCall();
        }
    };

    const rejectCall = async () => {
        if (!incomingCall || !globalSocket) return;

        const targetId = incomingCall.caller?._id || incomingCall.caller;
        if (targetId) {
            console.log('[CallContext] Rejecting call. Notifying:', targetId);
            globalSocket.emit('hangup', { to: String(targetId) });
        }

        await callService.updateCallStatus(incomingCall._id, 'rejected').catch(() => { });
        cleanupCall();
    };

    const endCall = async () => {
        const currentUserId = user?.id || user?._id;
        console.log('[CallContext] Ending call. currentUserId:', currentUserId);

        let targetId: string | null = null;
        if (activeCall) {
            const callerId = activeCall.caller?._id || activeCall.caller;
            const receiverId = activeCall.receiver?._id || activeCall.receiver;
            targetId = String(currentUserId) === String(callerId) ? String(receiverId) : String(callerId);
        } else if (incomingCall) {
            targetId = String(incomingCall.caller?._id || incomingCall.caller);
        }

        if (targetId && globalSocket) {
            console.log('[CallContext] Sending hangup signal to:', targetId);
            globalSocket.emit('hangup', { to: targetId });
        }

        if (activeCall?._id) {
            await callService.updateCallStatus(activeCall._id, 'ended').catch(err => {
                console.error('[CallContext] Failed to update call status on server:', err);
            });
        }

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
                preHoldState.current = { audio: isAudioMuted, video: isVideoMuted };
                if (localStream) localStream.getAudioTracks().forEach(t => { t.enabled = false; });
                setIsAudioMuted(true);
                if (localStream) localStream.getVideoTracks().forEach(t => { t.enabled = false; });
                setIsVideoMuted(true);
            } else {
                const { audio, video } = preHoldState.current;
                if (!audio && localStream) { localStream.getAudioTracks().forEach(t => { t.enabled = true; }); setIsAudioMuted(false); }
                if (!video && localStream) { localStream.getVideoTracks().forEach(t => { t.enabled = true; }); setIsVideoMuted(false); }
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
