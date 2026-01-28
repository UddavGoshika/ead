import React, { useState, useEffect } from 'react';
import styles from './FileACaseSection.module.css';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const FileACaseSection: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { } = useAuth();

    // Original images for this section
    const fileACaseImages = [
        { src: "/assets/fil2.jpeg", title: "File a Case", subtitle: "Locate case information using advocate name, FIR number, or applicable act where supported." },
        { src: "/assets/fil1.jpeg", title: "Search by CNR Number", subtitle: "Track case information using the unique Case Number Record (CNR)." },
        { src: "/assets/fil3.jpeg", title: "Case Status", subtitle: "Access detailed case status using your case number or filing number as registered with the court." },
        { src: "/assets/fil4.jpeg", title: "Search by Party Name", subtitle: "Find your case status using the petitioner or respondent name." },
    ];

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % fileACaseImages.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + fileACaseImages.length) % fileACaseImages.length);

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    // Selection for the two sliders
    const slider1Image = fileACaseImages[currentIndex % 2]; // fil2, fil1
    const slider2Image = fileACaseImages[(currentIndex % 2) + 2]; // fil3, fil4

    return (
        <section id="file-a-case" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Digital Legal Solutions</h2>
                    <h1 className={styles.mainTitle}>e-Advocate Services</h1>
                    <p className={styles.subtitle}>Quick access to legal filing & case tracking</p>
                </div>

                <div className={styles.grid}>
                    {/* Row 1, Col 1: Text Card (File a Case) */}
                    <div className={`${styles.card} ${styles.textCard}`}>
                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>File a Case</h2>
                            <h3 className={styles.dynamicTitle}>{slider1Image.title}</h3>
                            <p className={styles.cardDescription}>
                                {slider1Image.subtitle}
                            </p>
                            <button
                                onClick={() => window.open('https://services.ecourts.gov.in/ecourtindia_v6/', '_blank')}
                                className={styles.exploreBtn}
                            >
                                Click Here <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Row 1, Col 2: Image Slider 1 */}
                    <div className={`${styles.card} ${styles.imageCard}`}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={`s1-${currentIndex % 2}`}
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

                    {/* Row 2, Col 1: Image Slider 2 */}
                    <div className={`${styles.card} ${styles.imageCard}`}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={`s2-${currentIndex % 2}`}
                                src={slider2Image.src}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.6 }}
                                className={styles.sliderImage}
                            />
                        </AnimatePresence>
                    </div>

                    {/* Row 2, Col 2: Text Card (Case Status) */}
                    <div className={`${styles.card} ${styles.textCard} ${styles.whiteCard}`}>
                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>Case Status</h2>
                            <h3 className={styles.dynamicTitle}>{slider2Image.title}</h3>
                            <p className={styles.cardDescriptionDark}>
                                {slider2Image.subtitle}
                            </p>
                            <button
                                className={styles.trackBtn}
                                onClick={() => window.open('https://services.ecourts.gov.in/ecourtindia_v6/index.php?p=casestatus/index', '_blank')}
                            >
                                Track Now <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FileACaseSection;
