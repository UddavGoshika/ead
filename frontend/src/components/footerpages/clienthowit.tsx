import React from "react";
import styles from "./clienthow.module.css";

const ClientHowItWorks: React.FC = () => {
    return (
        <div className={styles.page}>

            {/* ================= CLIENT HERO ================= */}
            <section
                id="chowit-client-hero"
                className={styles.chowitHero}
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1400&q=80')",
                }}
            >
                <div className={styles.chowitContainer}>
                    <h1 className={styles.chowitHeroTitle}>
                        How E-Advocate Services Works for Clients
                    </h1>
                    <p className={styles.chowitHeroSubtitle}>
                        A complete, step-by-step explanation of how individuals use E-Advocate Services
                        to search, filter, evaluate, connect, communicate, and independently engage
                        with advocates while maintaining full privacy and control.
                    </p>
                </div>
            </section>

            {/* ================= PROCESS ================= */}
            <section id="chowit-client-process" className={styles.chowitProcess}>
                <div className={styles.chowitContainer}>
                    <h2 className={styles.chowitSectionTitle}>
                        Client Journey & Platform Usage
                    </h2>
                    <p className={styles.chowitSectionSubtitle}>
                        Transparent explanation of every feature and interaction from first visit
                        to independent legal engagement.
                    </p>

                    <div className={styles.chowitSteps}>

                        {/* STEP 1 */}
                        <article className={styles.chowitStep}>
                            <div className={styles.chowitStepContent}>
                                <span className={styles.chowitStepNumber}>1</span>
                                <h3>Platform Entry & Initial Exploration</h3>
                                <p>
                                    Browse advocate categories and legal information without registration.
                                </p>
                                <ul className={styles.chowitFeatureList}>
                                    <li>Browse without signup</li>
                                    <li>Explore legal services</li>
                                    <li>Informational content only</li>
                                </ul>
                            </div>

                            <div className={styles.chowitStepImage}>
                                <img
                                    src="https://raw.githubusercontent.com/BOINISRIHARI/100pages/refs/heads/main/WhatsApp%20Image%202026-01-12%20at%207.38.02%20PM.jpeg"
                                    alt="Explore before registering"
                                />
                                <span className={styles.chowitCaption}>
                                    Explore before registering
                                </span>
                            </div>
                        </article>

                        {/* STEP 2 */}
                        <article
                            className={`${styles.chowitStep} ${styles.chowitReverse}`}
                        >
                            <div className={styles.chowitStepContent}>
                                <span className={styles.chowitStepNumber}>2</span>
                                <h3>User Registration & Account Creation</h3>
                                <p>Secure, minimal, and privacy-focused account setup.</p>
                                <ul className={styles.chowitFeatureList}>
                                    <li>Minimal details</li>
                                    <li>OTP verification</li>
                                    <li>Profile control</li>
                                </ul>
                                <div className={styles.chowitNote}>
                                    No case details required at signup.
                                </div>
                            </div>

                            <div className={styles.chowitStepImage}>
                                <img
                                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80"
                                    alt="Secure user registration"
                                />
                                <span className={styles.chowitCaption}>
                                    Secure user registration
                                </span>
                            </div>
                        </article>

                        {/* STEP 3 */}
                        <article className={styles.chowitStep}>
                            <div className={styles.chowitStepContent}>
                                <span className={styles.chowitStepNumber}>3</span>
                                <h3>Advocate Discovery & Filtering</h3>
                                <p>Search advocates using verified professional data.</p>
                                <ul className={styles.chowitFeatureList}>
                                    <li>Practice area filters</li>
                                    <li>Location & courts</li>
                                    <li>Language preference</li>
                                </ul>
                            </div>

                            <div className={styles.chowitStepImage}>
                                <img
                                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80"
                                    alt="Find the right advocate"
                                />
                                <span className={styles.chowitCaption}>
                                    Find the right advocate
                                </span>
                            </div>
                        </article>

                        {/* STEP 4 */}
                        <article
                            className={`${styles.chowitStep} ${styles.chowitReverse}`}
                        >
                            <div className={styles.chowitStepContent}>
                                <span className={styles.chowitStepNumber}>4</span>
                                <h3>Connection Requests & Communication</h3>
                                <p>Secure chat and consultation after advocate acceptance.</p>
                                <ul className={styles.chowitFeatureList}>
                                    <li>Send requests</li>
                                    <li>Secure messaging</li>
                                    <li>Online consultation</li>
                                </ul>
                            </div>

                            <div className={styles.chowitStepImage}>
                                <img
                                    src="https://sdlawyers.com/wp-content/uploads/2024/01/Bruno_Heartfelt-Connections-The-Importance-of-a-Strong-Relationship-with-Your-Lawyer.png"
                                    alt="Private communication"
                                />
                                <span className={styles.chowitCaption}>
                                    Private communication
                                </span>
                            </div>
                        </article>

                        {/* STEP 5 */}
                        <article className={styles.chowitStep}>
                            <div className={styles.chowitStepContent}>
                                <span className={styles.chowitStepNumber}>5</span>
                                <h3>Independent Legal Engagement</h3>
                                <p>
                                    All legal work occurs independently between client and advocate.
                                </p>
                                <div className={styles.chowitNote}>
                                    Platform does not provide legal advice.
                                </div>
                            </div>

                            <div className={styles.chowitStepImage}>
                                <img
                                    src="https://png.pngtree.com/thumb_back/fh260/background/20250319/pngtree-lawyer-signing-legal-documents-with-scales-of-justice-image_17090342.jpg"
                                    alt="Independent legal engagement"
                                />
                                <span className={styles.chowitCaption}>
                                    Independent legal engagement
                                </span>
                            </div>
                        </article>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default ClientHowItWorks;
