import React from 'react';
import styles from './SocialShareModal.module.css';
import { X, Twitter, Link as LinkIcon } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin, FaSnapchatGhost, FaTelegramPlane } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';

interface SocialShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({ isOpen, onClose, url, title = 'Check this out!' }) => {
    if (!isOpen) return null;

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: <FaWhatsapp />,
            className: styles.whatsapp,
            action: () => window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, '_blank')
        },
        {
            name: 'Instagram',
            icon: <FaInstagram />,
            className: styles.instagram,
            action: () => {
                navigator.clipboard.writeText(url);
                alert('Link copied! Open Instagram to share.');
            }
        },
        {
            name: 'Threads',
            icon: <SiThreads />,
            className: styles.threads,
            action: () => window.open(`https://threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`, '_blank')
        },
        {
            name: 'Facebook',
            icon: <FaFacebook />,
            className: styles.facebook,
            action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')
        },
        {
            name: 'LinkedIn',
            icon: <FaLinkedin />,
            className: styles.linkedin,
            action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')
        },
        {
            name: 'Snapchat',
            icon: <FaSnapchatGhost />,
            className: styles.snapchat,
            action: () => {
                navigator.clipboard.writeText(url);
                alert('Link copied! Open Snapchat to share.');
            }
        },
        {
            name: 'X',
            icon: <Twitter size={20} fill="currentColor" strokeWidth={0} />, // Using Lucide because FaXTwitter might be missing in older react-icons
            className: styles.twitter,
            action: () => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank')
        },
        {
            // Telegram
            name: 'Telegram',
            icon: <FaTelegramPlane />,
            className: styles.telegram,
            action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank')
        }
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Share via</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.grid}>
                    {shareOptions.map((option) => (
                        <button key={option.name} className={styles.shareBtn} onClick={option.action}>
                            <div className={`${styles.iconWrapper} ${option.className}`}>
                                {option.icon}
                            </div>
                            <span className={styles.label}>{option.name}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.copySection}>
                    <LinkIcon size={16} color="#a1a1aa" />
                    <input type="text" readOnly value={url} className={styles.linkInput} />
                    <button className={styles.copyBtn} onClick={handleCopy}>Copy</button>
                </div>
            </div>
        </div>
    );
};

export default SocialShareModal;
