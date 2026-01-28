import React from 'react';
import styles from './FooterPage.module.css';

const AboutUs: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.title}>About E-Advocate Services</h1>
            <div className={styles.content}>
                <section className={styles.section}>
                    <h2>Our Vision</h2>
                    <p>
                        E-Advocate Services is India's premier digital legal ecosystem, dedicated to bridging the gap between legal expertise and those in search of justice. We envision a world where legal help is accessible, transparent, and efficient for every citizen.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Who We Are</h2>
                    <p>
                        Founded by a team of legal professionals and technology enthusiasts, we combine decades of legal experience with cutting-edge digital solutions. Our platform serves as a trusted marketplace where clients can find verified advocates across various specialties.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Our Values</h2>
                    <ul>
                        <li><strong>Integrity:</strong> We maintain the highest standards of professional ethics and transparency.</li>
                        <li><strong>Excellence:</strong> Delivering premium legal connectivity through innovative technology.</li>
                        <li><strong>Trust:</strong> Building a secure environment for sensitive legal communications.</li>
                        <li><strong>Accessibility:</strong> Making legal resources available to everyone, everywhere.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;
