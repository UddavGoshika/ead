import React, { useState, useEffect, useCallback } from 'react';
import styles from './FindAdvocatesSection.module.css';
import { Search, MapPin, Gavel, UserCheck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sliderImages } from '../../data/sliderData';

const FindAdvocatesSection: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalItems = sliderImages.length;

    const categories = ["Criminal", "Civil", "Family", "Corporate", "Property"];

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, [totalItems]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
    }, [totalItems]);

    useEffect(() => {
        const timer = setInterval(nextSlide, 5500);
        return () => clearInterval(timer);
    }, [nextSlide]);

    if (!sliderImages || sliderImages.length === 0) return null;

    const slider1Image = sliderImages[(currentIndex + 5) % totalItems];
    const slider2Image = sliderImages[(currentIndex + 6) % totalItems];

    return (
        <section id="find-advocates" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.glassCard}>
                    <div className={styles.header}>
                        <h2>Find Your Advocate</h2>
                        <p>Search through thousands of verified  professionals across India</p>
                    </div>

                    <div className={styles.quickSearch}>
                        <div className={styles.inputGroup}>
                            <Search size={20} />
                            <input type="text" placeholder="Specialization (e.g. Divorce)" />
                        </div>
                        <div className={styles.inputGroup}>
                            <MapPin size={20} />
                            <input type="text" placeholder="City or Pincode" />
                        </div>
                        <button className={styles.searchBtn}>Find Advocates</button>
                    </div>

                    <div className={styles.popularTags}>
                        <span>Popular:</span>
                        {categories.map(cat => (
                            <button key={cat} className={styles.tag}>{cat}</button>
                        ))}
                    </div>

                    <div className={styles.trustBadges}>
                        <div className={styles.badge}>
                            <UserCheck size={24} />
                            <span>10k+ Verified Advocates</span>
                        </div>
                        <div className={styles.badge}>
                            <Gavel size={24} />
                            <span>50k+ Cases Resolved</span>
                        </div>
                    </div>
                </div>

                {/* 4-Box Dynamic Grid Slider */}
                <div className={styles.grid} style={{ marginTop: '60px' }}>
                    {/* Box 1: Dynamic Text */}
                    <div className={`${styles.card} ${styles.textCard}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`text1-find-${currentIndex}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.5 }}
                                className={styles.cardContent}
                            >
                                <h2 className={styles.cardTitle}>{slider1Image.title.split(' ')[0]}</h2>
                                <h3 className={styles.dynamicTitle}>{slider1Image.title}</h3>
                                <p className={styles.cardDescription}>
                                    {slider1Image.subtitle}
                                </p>
                                <button
                                    onClick={() => window.open(slider1Image.btnLink, '_blank')}
                                    className={styles.exploreBtn}
                                >
                                    Learn More <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Box 2: Dynamic Image */}
                    <div className={`${styles.card} ${styles.imageCard}`}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={`img1-find-${currentIndex}`}
                                src={slider1Image.src}
                                initial={{ opacity: 0, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, filter: 'blur(10px)' }}
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

                    {/* Box 3: Dynamic Image */}
                    <div className={`${styles.card} ${styles.imageCard}`}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={`img2-find-${currentIndex}`}
                                src={slider2Image.src}
                                initial={{ opacity: 0, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, filter: 'blur(10px)' }}
                                transition={{ duration: 0.6 }}
                                className={styles.sliderImage}
                            />
                        </AnimatePresence>
                    </div>

                    {/* Box 4: Dynamic Text */}
                    <div className={`${styles.card} ${styles.textCard} ${styles.whiteCard}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`text2-find-${currentIndex}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.5 }}
                                className={styles.cardContent}
                            >
                                <h2 className={styles.cardTitle}>{slider2Image.title.split(' ')[0]}</h2>
                                <h3 className={styles.dynamicTitle}>{slider2Image.title}</h3>
                                <p className={styles.cardDescriptionDark}>
                                    {slider2Image.subtitle}
                                </p>
                                <button
                                    className={styles.trackBtn}
                                    onClick={() => window.open(slider2Image.btnLink, '_blank')}
                                >
                                    Get Started <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FindAdvocatesSection;
