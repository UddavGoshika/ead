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
        isVideoMuted,
        callStatus,
        callDuration
    } = useCall();

    const { user } = useAuth();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    // Correctly identify the other person in the call
    const getPartner = () => {
        if (!activeCall || !user) return null;
        const currentUserId = String(user.id);
        const callerId = typeof activeCall.caller === 'object' ? String(activeCall.caller._id) : String(activeCall.caller);

        return currentUserId === callerId ? activeCall.receiver : activeCall.caller;
    };

    const partner = getPartner();
    const incomingPartner = incomingCall ? incomingCall.caller : null;

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callStatus]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callStatus]);

    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.muted = !isSpeakerOn;
        }
    }, [isSpeakerOn, remoteStream]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!activeCall && !incomingCall && !isCalling) return null;

    // INCOMING CALL UI
    if (incomingCall && !activeCall) {
        return (
            <div className={styles.overlay}>
                {/* Local Preview during incoming call */}
                {incomingCall.type === 'video' && !isVideoMuted && (
                    <div className={styles.previewContainer}>
                        <video ref={localVideoRef} autoPlay muted playsInline className={styles.previewVideo} />
                        <div className={styles.previewLabel}>Your Camera</div>
                    </div>
                )}

                <div className={styles.incomingPopup}>
                    <div className={styles.pulseWrapper}>
                        <img
                            src={incomingPartner?.image_url && incomingPartner.image_url !== '/default-avatar.png'
                                ? (incomingPartner.image_url.startsWith('http') ? incomingPartner.image_url : `${window.location.protocol}//${window.location.host}${incomingPartner.image_url}`)
                                : "/default-avatar.png"}
                            alt="Caller"
                            className={styles.callerAvatar}
                        />
                    </div>
                    <h2 className={styles.callTypeTitle}>{incomingCall.type === 'video' ? 'Video' : 'Voice'} Call</h2>
                    <p className={styles.callerName}>{incomingPartner?.name || 'Someone'}</p>
                    <p className={styles.callerId}>{incomingPartner?.unique_id}</p>

                    <div className={styles.actionButtons}>
                        <button className={styles.acceptBtn} onClick={acceptCall} title="Accept Call">
                            <Phone size={24} />
                        </button>
                        <button className={styles.rejectBtn} onClick={rejectCall} title="Reject Call">
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // OUTGOING CALL UI (Calling / Ringing)
    if (isCalling) {
        const outgoingPartner = activeCall?.receiver;
        const callType = activeCall?.type || 'audio';

        return (
            <div className={styles.overlay}>
                {/* Local Preview during outgoing call */}
                {callType === 'video' && !isVideoMuted && (
                    <div className={styles.previewContainer}>
                        <video ref={localVideoRef} autoPlay muted playsInline className={styles.previewVideo} />
                        <div className={styles.previewLabel}>Your Camera</div>
                    </div>
                )}

                <div className={styles.incomingPopup}>
                    <div className={styles.pulseWrapper}>
                        {outgoingPartner?.image_url ? (
                            <img
                                src={outgoingPartner.image_url.startsWith('http') ? outgoingPartner.image_url : `${window.location.origin}${outgoingPartner.image_url}`}
                                alt="Recipient"
                                className={styles.callerAvatar}
                            />
                        ) : (
                            <div className={styles.callingIcon}>
                                <Phone size={48} />
                            </div>
                        )}
                    </div>
                    <h2 className={styles.statusText}>
                        {callStatus === 'ringing' ? 'Ringing...' : 'Calling...'}
                    </h2>
                    <p className={styles.callerName}>{outgoingPartner?.name || 'Searching...'}</p>
                    <p className={styles.callerId}>{outgoingPartner?.unique_id || 'Connecting...'}</p>

                    <div className={styles.actionButtons}>
                        <button className={styles.rejectBtn} onClick={endCall} title="Cancel Call">
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
                    <div className={styles.partnerTopInfo}>
                        <div className={styles.partnerMiniInfo}>
                            <h2 className={styles.partnerName}>{partner?.name || 'Expert'}</h2>
                            <p className={styles.partnerId}>{partner?.unique_id || 'ID Verified'}</p>
                        </div>
                        <span className={styles.callTimer}>{formatTime(callDuration)}</span>
                    </div>
                </div>
            )}

            {/* REMOTE MEDIA */}
            <div className={styles.remoteVideoWrapper}>
                {activeCall?.type === 'video' ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className={styles.remoteVideo}
                    />
                ) : (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        style={{ display: 'none' }}
                    />
                )}

                {activeCall?.type === 'audio' && (
                    <div className={styles.audioOnlyOverlay}>
                        <div className={styles.audioAvatarWrapper}>
                            <img
                                src={partner?.image_url && partner.image_url !== '/default-avatar.png'
                                    ? (partner.image_url.startsWith('http') ? partner.image_url : `${window.location.protocol}//${window.location.host}${partner.image_url}`)
                                    : "/default-avatar.png"}
                                alt="User"
                                className={styles.audioAvatarLarge}
                            />
                        </div>
                        <div className={styles.audioStatusLine}>
                            <div className={styles.pulseDot}></div>
                            <span>Voice Call Connected</span>
                        </div>
                    </div>
                )}
            </div>

            {/* LOCAL PREVIEW (PiP) */}
            {activeCall?.type === 'video' && !isVideoMuted && (
                <div className={styles.localVideoWrapper}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={styles.localVideo}
                    />
                </div>
            )}

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
                    <PhoneOff size={24} />
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
