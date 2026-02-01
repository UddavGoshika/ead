import React, { useState, useEffect, useCallback } from 'react';
import styles from './FileACaseSection.module.css';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sliderImages } from '../../data/sliderData';

const FileACaseSection: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalItems = sliderImages.length;

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, [totalItems]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
    }, [totalItems]);

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    if (!sliderImages || sliderImages.length === 0) return null;

    const slider1Image = sliderImages[currentIndex];
    const slider2Image = sliderImages[(currentIndex + 1) % totalItems];

    return (
        <section id="file-a-case" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    {/* <h2 className={styles.title}>Digital Legal Solutions</h2> */}
                    <h1 className={styles.mainTitle}>e-Advocate Services</h1>
                    <p className={styles.subtitle}>Quick access to filing & case tracking</p>
                </div>

                <div className={styles.grid}>
                    {/* Row 1, Col 1: Text Card */}
                    <div className={`${styles.card} ${styles.textCard}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`text1-${currentIndex}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.5 }}
                                className={styles.cardContent}
                            >
                                <h2 className={styles.cardTitle}>File a Case</h2>
                                <h3 className={styles.dynamicTitle}>{slider1Image.title}</h3>
                                <p className={styles.cardDescription}>
                                    {slider1Image.subtitle}
                                </p>
                                <button
                                    onClick={() => window.open(slider1Image.btnLink, '_blank')}
                                    className={styles.exploreBtn}
                                >
                                    Click Here <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Row 1, Col 2: Image Card */}
                    <div className={`${styles.card} ${styles.imageCard}`}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={`img1-${currentIndex}`}
                                src={slider1Image.src}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.6 }}
                                className={styles.sliderImage}
                            />
                        </AnimatePresence>
                        <div className={styles.sliderControls}>
                            <div className={styles.arrows}>
                                <button onClick={prevSlide} className={styles.arrowBtn}><ChevronLeft size={18} /></button>
                                <button onClick={nextSlide} className={styles.arrowBtn}><ChevronRight size={18} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Row 2, Col 1: Image Card */}
                    <div className={`${styles.card} ${styles.imageCard}`}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={`img2-${currentIndex}`}
                                src={slider2Image.src}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.6 }}
                                className={styles.sliderImage}
                            />
                        </AnimatePresence>
                    </div>

                    {/* Row 2, Col 2: Text Card */}
                    <div className={`${styles.card} ${styles.textCard} ${styles.whiteCard}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`text2-${currentIndex}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className={styles.cardContent}
                            >
                                <h2 className={styles.cardTitle}>Case Status</h2>
                                <h3 className={styles.dynamicTitle}>{slider2Image.title}</h3>
                                <p className={styles.cardDescriptionDark}>
                                    {slider2Image.subtitle}
                                </p>
                                <button
                                    className={styles.trackBtn}
                                    onClick={() => window.open(slider2Image.btnLink, '_blank')}
                                >
                                    Track Now <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FileACaseSection;
