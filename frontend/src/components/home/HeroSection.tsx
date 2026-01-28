// import React, { useState, useEffect } from 'react';
// import { Search, Gavel, Users, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import styles from './HeroSection.module.css';

// const slides = [
//     {
//         id: 1,
//         title: "Connect with Elite Legal Professionals",
//         subtitle: "Track your cases in real-time and navigate the Indian judicial system with ease.",
//         badge: "The Future of Justice is Digital",
//         image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000"
//     },
//     {
//         id: 2,
//         title: "Secure & Transparent Legal Consultations",
//         subtitle: "Experience 24/7 digital access to verified advocates from the comfort of your home.",
//         badge: "Verified Experts at Your Fingertips",
//         image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=2000"
//     },
//     {
//         id: 3,
//         title: "Advanced Case Management System",
//         subtitle: "Democratizing access to justice with AI-powered matching and real-time tracking.",
//         badge: "Smart Legal Solutions",
//         image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2000"
//     }
// ];

// const HeroSection: React.FC = () => {
//     const [currentSlide, setCurrentSlide] = useState(0);
//     const [partyName, setPartyName] = useState('');

//     useEffect(() => {
//         const timer = setInterval(() => {
//             setCurrentSlide((prev) => (prev + 1) % slides.length);
//         }, 6000);
//         return () => clearInterval(timer);
//     }, []);

//     const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
//     const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

//     const handleSearch = (e: React.FormEvent) => {
//         e.preventDefault();
//         console.log('Searching for party:', partyName);
//     };

//     return (
//         <section className={styles.hero}>
//             <AnimatePresence mode="wait">
//                 <motion.div
//                     key={currentSlide}
//                     className={styles.slideBackground}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 1 }}
//                     style={{ backgroundImage: `linear-gradient(rgba(6, 11, 26, 0.8), rgba(6, 11, 26, 0.8)), url(${slides[currentSlide].image})` }}
//                 />
//             </AnimatePresence>

//             <div className={styles.container}>
//                 {/* LEFT CONTENT */}
//                 <motion.div
//                     key={`content-${currentSlide}`}
//                     className={styles.heroLeft}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.8 }}
//                 >
//                     <div className={styles.badge}>
//                         <ShieldCheck size={14} />
//                         <span>{slides[currentSlide].badge}</span>
//                     </div>
//                     <h1 className={styles.heroTitleHeader}>
//                         {slides[currentSlide].title}
//                     </h1>
//                     <p className={styles.heroSubDescription}>
//                         {slides[currentSlide].subtitle}
//                     </p>

//                     <div className={styles.stats}>
//                         <div className={styles.statBox}>
//                             <Gavel size={24} className={styles.statIcon} />
//                             <div className={styles.statTexts}>
//                                 <span className={styles.statNum}>50k+</span>
//                                 <span className={styles.statLabel}>Cases Filed</span>
//                             </div>
//                         </div>
//                         <div className={styles.statBox}>
//                             <Users size={24} className={styles.statIcon} />
//                             <div className={styles.statTexts}>
//                                 <span className={styles.statNum}>10k+</span>
//                                 <span className={styles.statLabel}>Verified Advocates</span>
//                             </div>
//                         </div>
//                     </div>
//                 </motion.div>

//                 {/* RIGHT CONTENT: SEARCH CARD */}
//                 <motion.div
//                     className={styles.heroRight}
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.8, delay: 0.2 }}
//                 >
//                     <div className={styles.searchCard}>
//                         <div className={styles.cardHeader}>
//                             <h3>Quick Case Search</h3>
//                             <p>Verify case updates and advocate status</p>
//                         </div>
//                         <form className={styles.heroForm} onSubmit={handleSearch}>
//                             <div className={styles.inputWrapper}>
//                                 <Search className={styles.searchIconInside} size={20} />
//                                 <input
//                                     type="text"
//                                     placeholder="Enter Party Name..."
//                                     value={partyName}
//                                     onChange={(e) => setPartyName(e.target.value)}
//                                     required
//                                 />
//                             </div>
//                             <button type="submit" className={styles.heroSearchBtn}>
//                                 SEARCH NOW
//                             </button>
//                         </form>
//                         <div className={styles.cardFooter}>
//                             <span>Trusted by 5000+ Law Firms</span>
//                         </div>
//                     </div>
//                 </motion.div>
//             </div>

//             {/* SLIDE NAVIGATION */}
//             <div className={styles.slidePagination}>
//                 {slides.map((_, index) => (
//                     <button
//                         key={index}
//                         className={`${styles.dot} ${currentSlide === index ? styles.activeDot : ''}`}
//                         onClick={() => setCurrentSlide(index)}
//                     />
//                 ))}
//             </div>

//             <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevSlide}>
//                 <ChevronLeft size={24} />
//             </button>
//             <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextSlide}>
//                 <ChevronRight size={24} />
//             </button>

//             <div className={styles.glowRefraction} />
//         </section>
//     );
// };

// export default HeroSection;
import React, { useState, useEffect } from "react";
import styles from "./HeroSection.module.css";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

import { sliderImages } from "../../data/sliderData";

const HomeBanner: React.FC = () => {
    const { settings } = useSettings();
    const { openAuthModal, isLoggedIn } = useAuth();
    const [current, setCurrent] = useState<number>(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % sliderImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () =>
        setCurrent((prev) => (prev + 1) % sliderImages.length);

    const prevSlide = () =>
        setCurrent((prev) =>
            prev === 0 ? sliderImages.length - 1 : prev - 1
        );

    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                {/* LEFT: Fixed Luxury Content */}
                <div className={styles.left}>
                    <div className={styles.logoCircle}>
                        <img src={settings?.logo_url_hero || "src/assets/image.png"} alt="e-Advocate Logo" />
                    </div>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.mainTitle}>{settings?.hero_title || "e-Advocate Services"}</h1>
                        <p className={styles.mainSubtitle}>
                            {settings?.hero_subtitle || "A secure digital bridge between clients and professionals. Discover trusted experts, connect instantly, and manage your legal journey with confidence through our premium platform."}
                        </p>
                        <div className={styles.staticAuth}>
                            {isLoggedIn ? (
                                <button
                                    className={styles.exploreBtn}
                                    onClick={() => {
                                        const element = document.getElementById('search');
                                        element?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    Explore →
                                </button>
                            ) : (
                                <>
                                    <button
                                        id="hero-login-btn"
                                        className={styles.luxuryBtn}
                                        onClick={() => openAuthModal('login')}
                                    >
                                        Login
                                    </button>
                                    <button
                                        id="hero-register-btn"
                                        className={styles.luxuryBtn}
                                        onClick={() => openAuthModal('register')}
                                    >
                                        Register
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Slider and Dynamic Content */}
                <div className={styles.right}>
                    <div className={styles.rightContentBox}>
                        <div className={styles.slider}>
                            <img
                                src={sliderImages[current].src}
                                className={styles.sliderImage}
                                alt="Legal Highlight"
                            />
                            <span className={styles.counter}>
                                {current + 1} of {sliderImages.length}
                            </span>
                            <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevSlide}>‹</button>
                            <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextSlide}>›</button>
                        </div>

                        {/* DYNAMIC CONTENT BELOW SLIDER */}
                        <div className={styles.dynamicContent}>
                            <h2 className={styles.slideTitle}>{sliderImages[current].title}</h2>
                            <p className={styles.slideSubtitle}>{sliderImages[current].subtitle}</p>
                            <a
                                href={sliderImages[current].btnLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.primaryBtn}
                            >
                                Click Here →
                            </a>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeBanner;
