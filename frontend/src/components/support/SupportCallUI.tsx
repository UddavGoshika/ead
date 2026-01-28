import React, { useState } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, User, Activity, Shield, Pause, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './SupportUI.module.css';

interface SupportCallUIProps {
    user: { name: string; id: string; image?: string } | null;
    onClose: () => void;
    onComplete: () => void;
    isOnHold?: boolean;
    onHoldToggle?: () => void;
    callDuration?: number;
    isRecording?: boolean;
    onRecordingToggle?: () => void;
    isMuted?: boolean;
    onMuteToggle?: () => void;
    volume?: number;
    onVolumeChange?: (v: number) => void;
    isEncrypted?: boolean;
    onEncryptionToggle?: () => void;
}

const SupportCallUI: React.FC<SupportCallUIProps> = ({
    user, onClose, onComplete, isOnHold = false, onHoldToggle,
    callDuration = 0, isRecording = false, onRecordingToggle,
    isMuted: externalMute = false, onMuteToggle,
    volume = 80, onVolumeChange,
    isEncrypted = false, onEncryptionToggle
}) => {
    const [localMute, setLocalMute] = useState(false);
    const isMuted = onMuteToggle ? externalMute : localMute;

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMute = () => {
        if (onMuteToggle) {
            onMuteToggle();
        } else {
            setLocalMute(!localMute);
        }
    };

    return (
        <div className={styles.callContainer}>
            <header className={styles.uiHeader}>
                <div className={styles.sessionInfo}>
                    <Shield size={16} color="#3b82f6" />
                    <span>ENCRYPTED VOICE UPLINK</span>
                    {isRecording && (
                        <div className={styles.recordingBadge}>
                            <motion.div
                                className={styles.recDot}
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            REC
                        </div>
                    )}
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
            </header>

            <div className={styles.callBody}>
                <div className={styles.callMain}>
                    <div className={styles.largeAvatar}>
                        {user?.image ? <img src={user.image} alt="" /> : <User size={48} />}
                        <motion.div
                            className={styles.avatarPulse}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                    <div className={styles.callUserInfo}>
                        <h2>{user?.name}</h2>
                        <div className={styles.timer}>{formatTime(callDuration)}</div>
                        {onEncryptionToggle && (
                            <button
                                className={`${styles.callActionBtn} ${isEncrypted ? styles.active : ''}`}
                                onClick={onEncryptionToggle}
                                title={isEncrypted ? "Encryption Active" : "Enable Encryption"}
                            >
                                <Shield size={20} color={isEncrypted ? "#10b981" : "#6b7280"} />
                                <span className={styles.btnLabel}>Secure</span>
                            </button>
                        )}
                    </div>

                    <div className={styles.waveContainer}>
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={styles.waveBar}
                                animate={{ height: [10, Math.random() * 50 + 10, 10] }}
                                transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.callControls}>
                    <button
                        className={`${styles.controlBtn} ${isMuted ? styles.muted : ''}`}
                        onClick={handleMute}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <MicOff /> : <Mic />}
                    </button>
                    <button
                        className={`${styles.controlBtn} ${isOnHold ? styles.holdActive : ''}`}
                        onClick={onHoldToggle}
                        title={isOnHold ? 'Resume' : 'Hold'}
                    >
                        {isOnHold ? <Play /> : <Pause />}
                    </button>
                    {onRecordingToggle && (
                        <button
                            className={`${styles.controlBtn} ${isRecording ? styles.recordingActive : ''}`}
                            onClick={onRecordingToggle}
                            title={isRecording ? 'Stop Recording' : 'Start Recording'}
                        >
                            <Activity size={20} />
                        </button>
                    )}
                    <button className={styles.endCallBtn} onClick={onComplete} title="End Call">
                        <PhoneOff />
                    </button>
                    <div className={styles.volumeControl}>
                        <Volume2 size={18} />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => onVolumeChange?.(parseInt(e.target.value))}
                            className={styles.volumeSlider}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.callStatus}>
                <Activity size={14} /> BITRATE: 128KBPS | JITTER: 2MS | LATENCY: 15MS
            </div>
        </div>
    );
};

export default SupportCallUI;
