import React, { useEffect, useState, useRef } from 'react';
import styles from './IntroAnimation.module.css';
import logoImg from '../../assets/image.png';

interface IntroAnimationProps {
    onFinish: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onFinish }) => {
    const [phase, setPhase] = useState<'logo' | 'video' | 'reveal' | 'finished'>('logo');
    const [typedText, setTypedText] = useState("");
    const videoRef = useRef<HTMLVideoElement>(null);
    const fullText = "e- Advocate Services";

    useEffect(() => {
        // Typing Effect
        let index = 0;
        const typingDelay = 1500; // Delay before typing starts
        const typingInterval = setInterval(() => {
            if (index < fullText.length) {
                setTypedText(fullText.substring(0, index + 1));
                index++;
            } else {
                clearInterval(typingInterval);
            }
        }, 100); // 100ms per character

        // Phase 1: Logo & Cinematic Text
        const videoTimeout = setTimeout(() => {
            setPhase('video');
        }, 6500); // Adjusted for typing duration

        return () => {
            clearInterval(typingInterval);
            clearTimeout(videoTimeout);
        };
    }, []);

    useEffect(() => {
        if (phase === 'video' && videoRef.current) {
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.muted = false; // Attempt to play with sound
                    videoRef.current.play().catch(err => {
                        console.warn("Autoplay with sound was blocked. Playing muted as fallback.", err);
                        if (videoRef.current) {
                            videoRef.current.muted = true;
                            videoRef.current.play();
                        }
                    });
                }
            }, 100);
        }
    }, [phase]);

    const handleVideoEnded = () => {
        setPhase('reveal');
        setTimeout(() => {
            setPhase('finished');
            onFinish();
        }, 3600); // 1.4s circle zoom + 2.2s portal spread
    };

    const handleSkip = () => {
        setPhase('reveal');
        setTimeout(() => {
            setPhase('finished');
            onFinish();
        }, 3600);
    };

    if (phase === 'finished') return null;

    return (
        <div className={`${styles.introOverlay} ${phase === 'reveal' ? `revealing ${styles.revealSpread}` : ''}`}>
            {phase !== 'reveal' && (
                <button className={styles.skipBtn} onClick={handleSkip}>Skip Introduction</button>
            )}

            {(phase === 'logo' || phase === 'video') && (
                <div className={styles.logoContainer}>
                    <img src={logoImg} alt="E-Advocate" className={styles.logo} />
                    <div className={styles.servicesText}>{typedText}</div>
                </div>
            )}

            {(phase === 'video' || phase === 'reveal') && (
                <div className={`${styles.videoContainer} ${phase === 'reveal' ? styles.videoCircle : ''}`}>
                    <video
                        ref={videoRef}
                        className={styles.videoElement}
                        playsInline
                        onEnded={handleVideoEnded}
                    >
                        <source src="/assets/intro.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}
        </div>
    );
};

export default IntroAnimation;
