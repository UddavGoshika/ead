import React from 'react';
import styles from './FooterPage.module.css';

const Credits: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.title}>Acknowledgments & Credits</h1>
            <div className={styles.content}>
                <section className={styles.section}>
                    <h2>Technology Stack</h2>
                    <p>
                        E-Advocate Services is built using state-of-the-art technologies including React, TypeScript, and modern CSS modules to provide a seamless and luxury experience.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Design & Icons</h2>
                    <ul>
                        <li><strong>Icons:</strong> React Icons (Font Awesome, Lucide, etc.).</li>
                        <li><strong>Typography:</strong> Google Fonts (Inter, Outfit, Roboto).</li>
                        <li><strong>Illustrations:</strong> Custom high-fidelity illustrations and photography.</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Partners & Data</h2>
                    <p>
                        We express our gratitude to the following entities for their informational support:
                    </p>
                    <ul>
                        <li>Department of Justice, India</li>
                        <li>e-Committee, Supreme Court of India</li>
                        <li>Digital India Initiative</li>
                        <li>National Informatics Centre (NIC)</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Development Team</h2>
                    <p>
                        Designed and developed with ❤️ by the <strong>Ilearn Nexus Technology Team</strong>. Dedicated to excellence in legal tech innovation.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Credits;
