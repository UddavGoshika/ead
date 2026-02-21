import React, { useState, useEffect } from 'react';
import styles from './FloatingScrollButton.module.css';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingScrollButton: React.FC = () => {
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const threshold = 300; // Show after 300px
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

            // Show/Hide logic
            if (scrollY > threshold) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            // Direction logic: if user is in the bottom half, show UP; else show DOWN
            if (scrollY > totalHeight / 2) {
                setScrollDirection('up');
            } else {
                setScrollDirection('down');
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Run once on mount
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAction = () => {
        if (scrollDirection === 'up') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={styles.scrollButton}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAction}
                    title={scrollDirection === 'up' ? "Scroll to Top" : "Scroll to Bottom"}
                >
                    <div className={styles.iconWrapper}>
                        <div className={`${styles.triangle} ${scrollDirection === 'up' ? styles.up : styles.down}`} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FloatingScrollButton;
