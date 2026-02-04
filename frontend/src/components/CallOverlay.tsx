import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { WebRTCService, useCallSignals } from '../services/WebRTCService';
import { Phone, PhoneOff, Video, Mic, MicOff, User } from 'lucide-react';
import styles from './CallOverlay.module.css';

const CallOverlay: React.FC = () => {
    const { user } = useAuth();
    const [incomingCall, setIncomingCall] = useState<any>(null);
    const [activeCall, setActiveCall] = useState<any>(null);
    const [isCalling, setIsCalling] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [duration, setDuration] = useState(0);

    const serviceRef = useRef<WebRTCService | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let interval: any;
        if (activeCall) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [activeCall]);

    useEffect(() => {
        if (!user?.id) return;

        const unsubscribe = useCallSignals(String(user.id), (callId, caller) => {
            setIncomingCall({ callId, ...caller });
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [localStream, remoteStream, activeCall]);

    const handleAccept = async () => {
        const service = new WebRTCService();
        serviceRef.current = service;

        const streams = await service.startLocalStream(incomingCall.callType === 'video');
        setLocalStream(streams.local);
        setRemoteStream(streams.remote);

        await service.answerCall(incomingCall.callId);
        setActiveCall(incomingCall);
        setIncomingCall(null);
    };

    const handleDecline = () => {
        setIncomingCall(null);
    };

    const handleHangup = async () => {
        if (serviceRef.current) {
            await serviceRef.current.hangup();
        }
        setActiveCall(null);
        setIsCalling(false);
        setLocalStream(null);
        setRemoteStream(null);
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const rs = s % 60;
        return `${m}:${rs < 10 ? '0' : ''}${rs}`;
    };

    if (!incomingCall && !activeCall) return null;

    return (
        <div className={styles.container}>
            {/* INCOMING CALL POPUP */}
            {incomingCall && (
                <div className={styles.incomingPopup}>
                    <div className={styles.callerInfo}>
                        <div className={styles.avatar}>
                            <User size={32} />
                        </div>
                        <div className={styles.textInfo}>
                            <h3>INCOMING {incomingCall.callType.toUpperCase()} CALL</h3>
                            <p>{incomingCall.callerName}</p>
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.acceptBtn} onClick={handleAccept}>
                            <Phone size={24} />
                        </button>
                        <button className={styles.declineBtn} onClick={handleDecline}>
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </div>
            )}

            {/* ACTIVE CALL VIEW */}
            {activeCall && (
                <div className={styles.callWindow}>
                    <div className={styles.videoGrid}>
                        <video ref={remoteVideoRef} autoPlay playsInline className={styles.remoteVideo} />
                        {activeCall.callType === 'video' && (
                            <video ref={localVideoRef} autoPlay playsInline muted className={styles.localVideo} />
                        )}
                        <div className={styles.topStatus}>
                            <div className={styles.recBadge}>
                                <div className={styles.recIcon} />
                                TRANSCRIBING LIVE
                            </div>
                        </div>
                    </div>

                    <div className={styles.callControls}>
                        <div className={styles.callStatus}>
                            <h4>{activeCall.callerName}</h4>
                            <div className={styles.timerDisplay}>{formatTime(duration)}</div>
                            <span>SECURE • END-TO-END ENCRYPTED</span>
                        </div>
                        <div className={styles.mainControls}>
                            <button className={styles.controlIcon}><MicOff size={20} /></button>
                            <button className={styles.hangupBtn} onClick={handleHangup}>
                                <PhoneOff size={28} />
                            </button>
                            <button className={styles.controlIcon}><Video size={20} /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallOverlay;
