import React from 'react';
import SupportChatUI from './SupportChatUI';
import type { ChatMessage } from './SupportChatUI';
import SupportCallUI from './SupportCallUI';
import styles from './SupportUI.module.css';

interface SupportMixedUIProps {
    user: { name: string; id: string; image?: string };
    onClose: () => void;
    onComplete: () => void;
    // Chat props
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    // Call props
    callDuration?: number;
    isRecording?: boolean;
    onRecordingToggle?: () => void;
    isEncrypted?: boolean;
    onEncryptionToggle?: () => void;
}

const SupportMixedUI: React.FC<SupportMixedUIProps> = ({
    user,
    onClose,
    onComplete,
    messages,
    onSendMessage,
    callDuration,
    isRecording,
    onRecordingToggle,
    isEncrypted,
    onEncryptionToggle
}) => {
    return (
        <div className={styles.mixedContainer}>
            <div className={styles.chatSection}>
                <SupportChatUI
                    user={user}
                    onClose={onClose}
                    onComplete={onComplete}
                    messages={messages}
                    onSendMessage={onSendMessage}
                />
            </div>
            <div className={styles.callSection}>
                <SupportCallUI
                    user={user}
                    onClose={onClose}
                    onComplete={onComplete}
                    callDuration={callDuration}
                    isRecording={isRecording}
                    onRecordingToggle={onRecordingToggle}
                    isEncrypted={isEncrypted}
                    onEncryptionToggle={onEncryptionToggle}
                />
            </div>
        </div>
    );
};

export default SupportMixedUI;
