import React, { useEffect, useRef, useState } from 'react';
import styles from './CallWindow.module.css';
import { useCall } from '../../context/CallContext';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize, Minimize, X, Volume2, VolumeX, Star, Lock, Play, Pause } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PremiumTryonModal from '../../pages/dashboard/shared/PremiumTryonModal';
import { formatImageUrl } from '../../utils/imageHelper';

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
        toggleHold,
        isAudioMuted,
        isVideoMuted,
        isOnHold,
        callStatus,
        callDuration
    } = useCall();

    const { user } = useAuth();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const plan = (user?.plan || 'Free').toLowerCase();
    const isPremium = user?.isPremium || (plan !== 'free' && plan !== '');

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
            remoteVideoRef.current.muted = !isSpeakerOn;
        }
    }, [remoteStream, callStatus, isSpeakerOn]);

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
                            src={formatImageUrl(incomingPartner?.image_url)}
                            alt="Caller"
                            className={`${styles.callerAvatar} ${!isPremium ? styles.blurredAvatar : ''}`}
                        />
                        {!isPremium && <div className={styles.lockIconOverlay}><Lock size={32} /></div>}
                    </div>
                    <h2 className={styles.callTypeTitle}>{incomingCall.type === 'video' ? 'Video' : 'Voice'} Call</h2>
                    <p className={styles.callerName}>
                        {isPremium ? (incomingPartner?.name || 'Someone') : 'Incoming Premium Call'}
                    </p>
                    <p className={styles.callerId}>{isPremium ? incomingPartner?.unique_id : 'Experience HD calling'}</p>

                    <div className={styles.actionButtons}>
                        {isPremium ? (
                            <button className={styles.acceptBtn} onClick={acceptCall} title="Accept Call">
                                <Phone size={24} />
                            </button>
                        ) : (
                            <button className={styles.unlockCallBtn} onClick={() => setShowPremiumModal(true)}>
                                <Star size={20} fill="currentColor" /> Unlock Experience
                            </button>
                        )}
                        <button className={styles.rejectBtn} onClick={rejectCall} title="Reject Call">
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </div>
                {showPremiumModal && <PremiumTryonModal onClose={() => setShowPremiumModal(false)} />}
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
                        <img
                            src={formatImageUrl(outgoingPartner?.image_url)}
                            alt="Recipient"
                            className={styles.callerAvatar}
                        />
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
                        className={`${styles.remoteVideo} ${!isPremium ? styles.premiumBlur : ''}`}
                    />
                ) : (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        style={{ display: 'none' }}
                    />
                )}

                {!isPremium && callStatus === 'connected' && (
                    <div className={styles.premiumTeaseOverlay}>
                        <div className={styles.teaseContent}>
                            <div className={styles.teaseIcon}>
                                <Star size={48} className={styles.sparkle} />
                            </div>
                            <h3>Experience Clarity</h3>
                            <p>Premium users enjoy crystal clear video and high-fidelity audio.</p>
                            <button className={styles.upgradeTeaseBtn} onClick={() => setShowPremiumModal(true)}>
                                Upgrade to Unlock
                            </button>
                        </div>
                    </div>
                )}

                {activeCall?.type === 'audio' && (
                    <div className={`${styles.audioOnlyOverlay} ${!isPremium ? styles.premiumBlur : ''}`}>
                        <div className={styles.audioAvatarWrapper}>
                            <img
                                src={formatImageUrl(partner?.image_url)}
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

                <button
                    className={`${styles.controlBtn} ${isOnHold ? styles.muted : ''}`}
                    onClick={toggleHold}
                    title={isOnHold ? "Resume Call" : "Hold Call"}
                    style={{ background: isOnHold ? '#facc15' : undefined, color: isOnHold ? '#000' : undefined }}
                >
                    {isOnHold ? <Play size={24} fill="currentColor" /> : <Pause size={24} />}
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
            {showPremiumModal && <PremiumTryonModal onClose={() => setShowPremiumModal(false)} />}
        </div>
    );
};

export default CallWindow;
