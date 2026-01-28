import React from 'react';
import styles from './AboutSection.module.css';
import { Shield, Users, MessageSquare, LineChart } from 'lucide-react';

const AboutSection: React.FC = () => {
    return (
        <section id="about" className={styles.aboutSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>About E-Advocate</h2>
                    <p className={styles.subtitle}>Revolutionizing Legal Services through Digital Innovation, Connecting Clients with Expert Advocates Seamlessly</p>
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.textContent}>
                        <h3>Digital Legal Platform</h3>
                        <p>E-Advocate is a premium digital platform that bridges the gap between clients seeking legal assistance and qualified advocates offering expert services. We provide a comprehensive ecosystem for legal consultation, case management, and professional networking.</p>
                        <p>Our purpose is to democratize access to legal services, making them affordable, transparent, and accessible to everyone regardless of location or economic background.</p>

                        <div className={styles.servicesHeader}>
                            <h3>What We Provide:</h3>
                        </div>
                        <div className={styles.servicesGrid}>
                            <div className={styles.serviceItem}>
                                <div className={styles.iconBox}><LineChart /></div>
                                <h4>Digital Case Filing</h4>
                                <p>File legal cases online with complete documentation support</p>
                            </div>
                            <div className={styles.serviceItem}>
                                <div className={styles.iconBox}><Users /></div>
                                <h4>Advocate Matching</h4>
                                <p>AI-powered matching with specialized advocates based on case type</p>
                            </div>
                            <div className={styles.serviceItem}>
                                <div className={styles.iconBox}><Shield /></div>
                                <h4>Secure Communication</h4>
                                <p>Encrypted chat, call, and video consultation features</p>
                            </div>
                            <div className={styles.serviceItem}>
                                <div className={styles.iconBox}><MessageSquare /></div>
                                <h4>Case Tracking</h4>
                                <p>Real-time updates on case status and hearing schedules</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.approvalSection}>
                    <div className={styles.approvalBox}>
                        <h4>Institutional Recognition</h4>
                        <div className={styles.logosRow}>
                            <span>APPROVED BY</span>
                            <span>PARTNERSHIP</span>
                            <span>ASSOCIATION</span>
                        </div>
                        <div className={styles.logosGrid}>
                            <div className={styles.placeholderLogo}>Digital India</div>
                            <div className={styles.placeholderLogo}>India.gov.in</div>
                            <div className={styles.placeholderLogo}>Bar Council</div>
                            <div className={styles.placeholderLogo}>Legal Cell</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
