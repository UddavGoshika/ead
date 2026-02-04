import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
    isAudioMuted: boolean;
    isVideoMuted: boolean;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [activeCall, setActiveCall] = useState<Call | null>(null);
    const [incomingCall, setIncomingCall] = useState<Call | null>(null);
    const [isCalling, setIsCalling] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    const socket = useRef<Socket | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

    useEffect(() => {
        if (user?.id) {
            socket.current = io(SOCKET_URL);
            socket.current.emit('register', String(user.id));

            socket.current.on('incoming-call', async ({ from, offer, type }) => {
                const response = await callService.getActiveCalls(String(user.id));
                if (response.incomingCall && String(response.incomingCall.caller._id) === String(from)) {
                    setIncomingCall({ ...response.incomingCall, offer });
                }
            });

            socket.current.on('call-answered', async ({ answer }) => {
                if (peerConnection.current) {
                    try {
                        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
                        processIceQueue();
                    } catch (e) {
                        console.error('Error setting remote description', e);
                    }
                }
            });

            socket.current.on('ice-candidate', async ({ candidate }) => {
                if (peerConnection.current?.remoteDescription) {
                    try {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error('Error adding received ice candidate', e);
                    }
                } else {
                    iceCandidatesQueue.current.push(candidate);
                }
            });

            socket.current.on('hangup', () => {
                cleanupCall();
            });

            return () => {
                socket.current?.disconnect();
            };
        }
    }, [user?.id]);

    const processIceQueue = () => {
        while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            if (candidate && peerConnection.current) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {
                    console.error("Delayed ICE candidate error", e);
                });
            }
        }
    };

    const createPeerConnection = (targetUserId: string) => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.current?.emit('ice-candidate', { to: String(targetUserId), candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            } else {
                // Fallback for some browsers
                const inboundStream = new MediaStream();
                inboundStream.addTrack(event.track);
                setRemoteStream(inboundStream);
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                cleanupCall();
            }
        };

        peerConnection.current = pc;
        return pc;
    };

    const initiateCall = async (receiverId: string, type: 'audio' | 'video') => {
        try {
            setIsCalling(true);
            const call = await callService.initiateCall(String(user?.id), receiverId, type);
            setActiveCall(call);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            });
            setLocalStream(stream);

            const pc = createPeerConnection(receiverId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: type === 'video'
            });
            await pc.setLocalDescription(offer);

            socket.current?.emit('call-user', {
                to: receiverId,
                offer,
                from: String(user?.id),
                type
            });

        } catch (err) {
            console.error('Failed to initiate call', err);
            cleanupCall();
        }
    };

    const acceptCall = async () => {
        if (!incomingCall || !user?.id) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: incomingCall.type === 'video'
            });
            setLocalStream(stream);
            setActiveCall(incomingCall);

            const callerId = String(incomingCall.caller._id);
            const callId = incomingCall._id;
            const callType = incomingCall.type;

            setIncomingCall(null);

            const pc = createPeerConnection(callerId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(((activeCall || incomingCall) as any).offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.current?.emit('answer-call', { to: callerId, answer });
            processIceQueue();

            await callService.updateCallStatus(callId, 'accepted');

        } catch (err) {
            console.error('Failed to accept call', err);
            cleanupCall();
        }
    };

    const rejectCall = async () => {
        if (!incomingCall) return;
        socket.current?.emit('hangup', { to: String(incomingCall.caller._id) });
        await callService.updateCallStatus(incomingCall._id, 'rejected');
        setIncomingCall(null);
    };

    const endCall = async () => {
        const targetId = activeCall ? (String(user?.id) === String(activeCall.caller._id) ? activeCall.receiver._id : activeCall.caller._id) : null;
        if (targetId) {
            socket.current?.emit('hangup', { to: String(targetId) });
        }
        if (activeCall) {
            await callService.updateCallStatus(activeCall._id, 'ended').catch(() => { });
        }
        cleanupCall();
    };

    const cleanupCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.onicecandidate = null;
            peerConnection.current.ontrack = null;
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
        setActiveCall(null);
        setIncomingCall(null);
        setIsCalling(false);
        iceCandidatesQueue.current = [];
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoMuted(!videoTrack.enabled);
            }
        }
    };

    return (
        <CallContext.Provider value={{
            activeCall,
            incomingCall,
            initiateCall,
            acceptCall,
            rejectCall,
            endCall,
            isCalling,
            localStream,
            remoteStream,
            toggleAudio,
            toggleVideo,
            isAudioMuted,
            isVideoMuted
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
