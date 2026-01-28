import React from "react";
import styles from "./advhow.module.css";

const AdvocateHowItWorks: React.FC = () => {
    return (
        <div className={styles.page}>

            {/* ================= HERO ================= */}
            <section
                id="advhowitworks-hero"
                className={styles.advhowitworksHero}
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1400&q=80')",
                }}
            >
                <div
                    id="advhowitworks-hero-container"
                    className={styles.advhowitworksContainer}
                >
                    <h1 id="advhowitworks-hero-title" className={styles.advhowitworksHeroTitle}>
                        How E-Advocate Works for Advocates
                    </h1>

                    <p id="advhowitworks-hero-desc" className={styles.advhowitworksHeroDesc}>
                        A deep, step-by-step explanation of advocate onboarding, compliance,
                        visibility, client discovery, communication tools, workflow control,
                        and professional independence on the platform.
                    </p>
                </div>
            </section>

            {/* ================= PROCESS ================= */}
            <section
                id="advhowitworks-process"
                className={styles.advhowitworksProcess}
            >
                <div
                    id="advhowitworks-process-container"
                    className={styles.advhowitworksContainer}
                >
                    <h2 id="advhowitworks-heading" className={styles.advhowitworksHeading}>
                        Advocate Experience & Workflow
                    </h2>

                    <p
                        id="advhowitworks-subtitle"
                        className={styles.advhowitworksSubtitle}
                    >
                        Every feature is designed to support advocates ethically, transparently,
                        and without compromising Bar Council of India regulations or professional autonomy.
                    </p>

                    <div
                        id="advhowitworks-steps"
                        className={styles.advhowitworksSteps}
                    >

                        {/* STEP 1 */}
                        <div
                            id="advhowitworks-step-1"
                            className={styles.advhowitworksStep}
                        >
                            <div className={styles.advhowitworksContent}>
                                <div className={styles.advhowitworksNum}>1</div>
                                <h3>Registration & Professional Verification</h3>
                                <p>
                                    Advocates register by submitting verified professional credentials.
                                    This ensures authenticity, trust, and compliance before profiles become visible.
                                </p>
                                <ul className={styles.advhowitworksFeatures}>
                                    <li>Bar Council enrollment verification</li>
                                    <li>Education & specialization mapping</li>
                                    <li>Courts & jurisdiction tagging</li>
                                    <li>OTP & identity validation</li>
                                </ul>
                            </div>

                            <div className={styles.advhowitworksImage}>
                                <img
                                    src="https://img.freepik.com/free-vector/modern-online-registration-compositio_23-2147993866.jpg?semt=ais_hybrid&w=740&q=80"
                                    alt="Secure advocate onboarding & verification"
                                />
                                <div className={styles.advhowitworksCaption}>
                                    Secure advocate onboarding & verification
                                </div>
                            </div>
                        </div>

                        {/* STEP 2 */}
                        <div
                            id="advhowitworks-step-2"
                            className={`${styles.advhowitworksStep} ${styles.advhowitworksReverse}`}
                        >
                            <div className={styles.advhowitworksContent}>
                                <div className={styles.advhowitworksNum}>2</div>
                                <h3>Profile Structuring & Compliance Review</h3>
                                <p>
                                    Profiles are structured strictly as informational listings.
                                    All content is reviewed to prevent advertising, fee promotion,
                                    or outcome guarantees.
                                </p>
                                <div className={styles.advhowitworksNote}>
                                    <strong>Compliance Focus:</strong> Profiles are visibility tools, not advertisements.
                                </div>
                            </div>

                            <div className={styles.advhowitworksImage}>
                                <img
                                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80"
                                    alt="BCI-aligned advocate profiles"
                                />
                                <div className={styles.advhowitworksCaption}>
                                    BCI-aligned advocate profiles
                                </div>
                            </div>
                        </div>

                        {/* STEP 3 */}
                        <div
                            id="advhowitworks-step-3"
                            className={styles.advhowitworksStep}
                        >
                            <div className={styles.advhowitworksContent}>
                                <div className={styles.advhowitworksNum}>3</div>
                                <h3>Discovery, Filters & Matching</h3>
                                <p>
                                    Advocate profiles appear to users based on objective filters such as
                                    specialization, experience, court, location, and language.
                                </p>
                                <ul className={styles.advhowitworksFeatures}>
                                    <li>Rule-based matching (no paid ranking)</li>
                                    <li>Language & accessibility filters</li>
                                    <li>Neutral & fair visibility</li>
                                </ul>
                            </div>

                            <div className={styles.advhowitworksImage}>
                                <img
                                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80"
                                    alt="Fair advocate discovery system"
                                />
                                <div className={styles.advhowitworksCaption}>
                                    Fair advocate discovery system
                                </div>
                            </div>
                        </div>

                        {/* STEP 4 */}
                        <div
                            id="advhowitworks-step-4"
                            className={`${styles.advhowitworksStep} ${styles.advhowitworksReverse}`}
                        >
                            <div className={styles.advhowitworksContent}>
                                <div className={styles.advhowitworksNum}>4</div>
                                <h3>Client Requests & Screening</h3>
                                <p>
                                    Advocates receive requests containing basic context.
                                    Each request can be accepted, declined, or ignored with complete discretion.
                                </p>
                                <ul className={styles.advhowitworksFeatures}>
                                    <li>Centralized request inbox</li>
                                    <li>Accept or decline freely</li>
                                    <li>No forced engagement</li>
                                </ul>
                            </div>

                            <div className={styles.advhowitworksImage}>
                                <img
                                    src="https://media.istockphoto.com/id/2149167948/photo/word-request-on-speech-bubble.jpg?s=612x612&w=0&k=20&c=ovOOjZhT47nvYhdz43mEUAAHwzTZDI0IunYDZFc67nU="
                                    alt="Full control over client engagement"
                                />
                                <div className={styles.advhowitworksCaption}>
                                    Full control over client engagement
                                </div>
                            </div>
                        </div>

                        {/* STEP 5 */}
                        <div
                            id="advhowitworks-step-5"
                            className={styles.advhowitworksStep}
                        >
                            <div className={styles.advhowitworksContent}>
                                <div className={styles.advhowitworksNum}>5</div>
                                <h3>Secure Communication & Consultation</h3>
                                <p>
                                    Once accepted, advocates can communicate securely to understand
                                    the matter before proceeding professionally.
                                </p>
                                <ul className={styles.advhowitworksFeatures}>
                                    <li>Encrypted messaging</li>
                                    <li>Virtual consultation support</li>
                                    <li>Secure document sharing</li>
                                </ul>
                            </div>

                            <div className={styles.advhowitworksImage}>
                                <img
                                    src="https://www.sociabble.com/medias/sociabble-why-secure-internal-comm-important-gpdr.png"
                                    alt="Confidential advocate-client communication"
                                />
                                <div className={styles.advhowitworksCaption}>
                                    Confidential advocate-client communication
                                </div>
                            </div>
                        </div>

                        {/* STEP 6 */}
                        <div
                            id="advhowitworks-step-6"
                            className={`${styles.advhowitworksStep} ${styles.advhowitworksReverse}`}
                        >
                            <div className={styles.advhowitworksContent}>
                                <div className={styles.advhowitworksNum}>6</div>
                                <h3>Independent Legal Engagement</h3>
                                <p>
                                    All legal advice, fees, documentation, and representation occur
                                    independently outside the platform.
                                </p>
                                <div className={styles.advhowitworksNote}>
                                    <strong>Platform Boundary:</strong> No interference in legal decisions.
                                </div>
                            </div>

                            <div className={styles.advhowitworksImage}>
                                <img
                                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80"
                                    alt="Complete professional independence"
                                />
                                <div className={styles.advhowitworksCaption}>
                                    Complete professional independence
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdvocateHowItWorks;
