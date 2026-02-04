import React, { useEffect, useRef, useState } from 'react';
import styles from './CallWindow.module.css';
import { useCall } from '../../context/CallContext';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize, Minimize, X, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CallWindow: React.FC = () => {
    const {
        activeCall,
        incomingCall,
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
    } = useCall();

    const { user } = useAuth();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    const partner = activeCall ? (String(user?.id) === String(activeCall.caller._id) ? activeCall.receiver : activeCall.caller) : null;
    const incomingPartner = incomingCall ? incomingCall.caller : null;

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.muted = !isSpeakerOn;
        }
    }, [isSpeakerOn, remoteStream]);

    if (!activeCall && !incomingCall && !isCalling) return null;

    // INCOMING CALL UI
    if (incomingCall && !activeCall) {
        return (
            <div className={styles.overlay}>
                <div className={styles.incomingPopup}>
                    <div className={styles.pulseWrapper}>
                        <img
                            src={incomingPartner?.image_url || "/default-avatar.png"}
                            alt="Caller"
                            className={styles.callerAvatar}
                        />
                    </div>
                    <h2>{incomingCall.type === 'video' ? 'Video' : 'Voice'} Call</h2>
                    <p className={styles.callerName}>{incomingPartner?.name || 'Someone'}</p>
                    <p className={styles.callerId}>{incomingPartner?.unique_id}</p>
                    <div className={styles.actionButtons}>
                        <button className={styles.acceptBtn} onClick={acceptCall}>
                            <Phone size={24} />
                        </button>
                        <button className={styles.rejectBtn} onClick={rejectCall}>
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // OUTGOING CALL UI
    if (isCalling && !activeCall) {
        return (
            <div className={styles.overlay}>
                <div className={styles.incomingPopup}>
                    <div className={styles.pulseWrapper}>
                        <div className={styles.callingIcon}>
                            <Phone size={48} />
                        </div>
                    </div>
                    <h2>Calling...</h2>
                    <p>Wait for recipient to pick up</p>
                    <div className={styles.actionButtons}>
                        <button className={styles.rejectBtn} onClick={endCall}>
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ACTIVE P2P CALL UI
    return (
        <div className={`${styles.callContainer} ${isMinimized ? styles.minimized : ''}`}>
            {/* PARTNER OVERLAY (Top Center) */}
            {!isMinimized && (
                <div className={styles.partnerOverlay}>
                    <h2 className={styles.partnerName}>{partner?.name}</h2>
                    <p className={styles.partnerId}>{partner?.unique_id}</p>
                </div>
            )}

            {/* REMOTE MEDIA */}
            <div className={styles.remoteVideoWrapper}>
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className={styles.remoteVideo}
                    style={{ display: activeCall?.type === 'video' ? 'block' : 'none' }}
                />

                {activeCall?.type === 'audio' && (
                    <div className={styles.audioCallPlaceholder}>
                        <img
                            src={partner?.image_url || "/default-avatar.png"}
                            alt="User"
                            className={styles.audioAvatarLarge}
                        />
                        <div className={styles.audioStatusLine}>
                            <div className={styles.pulseDot}></div>
                            <span>Voice Call Connected</span>
                        </div>
                    </div>
                )}
            </div>

            {/* LOCAL PREVIEW (PiP) */}
            <div className={styles.localVideoWrapper} style={{ display: isVideoMuted ? 'none' : 'block' }}>
                <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={styles.localVideo}
                />
            </div>

            {/* CONTROLS */}
            <div className={styles.p2pControls}>
                <button
                    className={`${styles.controlBtn} ${isAudioMuted ? styles.muted : ''}`}
                    onClick={toggleAudio}
                    title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
                >
                    {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    className={`${styles.controlBtn} ${!isSpeakerOn ? styles.muted : ''}`}
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    title={isSpeakerOn ? "Speaker Off" : "Speaker On"}
                >
                    {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>

                <button className={styles.hangupBtn} onClick={endCall} title="End Call">
                    <Phone size={24} />
                </button>

                {activeCall?.type === 'video' && (
                    <button
                        className={`${styles.controlBtn} ${isVideoMuted ? styles.muted : ''}`}
                        onClick={toggleVideo}
                        title={isVideoMuted ? "Start Video" : "Stop Video"}
                    >
                        {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                )}

                <button
                    className={styles.minimizeBtn}
                    onClick={() => setIsMinimized(!isMinimized)}
                    title={isMinimized ? "Expand" : "Minimize"}
                >
                    {isMinimized ? <Maximize size={24} /> : <Minimize size={24} />}
                </button>
            </div>
        </div>
    );
};

export default CallWindow;
