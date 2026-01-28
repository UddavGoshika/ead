import React from "react";
import styles from "./sitehow.module.css";

const SiteHowItWorks: React.FC = () => {
    return (
        <div className={styles.page}>

            {/* HOW IT WORKS */}
            <section id="shw-how-it-works" className={styles.shwSection}>
                <div className={styles.shwContainer}>
                    <h2 className={styles.shwSectionTitle}>How It Works</h2>
                    <p className={styles.shwSectionSubtitle}>
                        Our platform simplifies the legal process with a seamless, step-by-step approach
                        for both clients and advocates
                    </p>

                    <div className={styles.shwHowItWorksContainer}>

                        {/* STEP 1 */}
                        <div className={styles.shwHowItWorksStep}>
                            <div className={styles.shwStepNumber}>1</div>

                            <div className={styles.shwStepContent}>
                                <h3>Register & Create Your Profile</h3>
                                <p>
                                    Begin by creating your account on E-Advocate. Clients can specify their legal needs,
                                    while advocates can create detailed professional profiles highlighting their expertise,
                                    experience, and areas of specialization.
                                </p>

                                <div className={styles.shwStepFeatures}>
                                    <div className={styles.shwStepFeature}>
                                        <i className="fas fa-check-circle"></i> Secure Registration
                                    </div>
                                    <div className={styles.shwStepFeature}>
                                        <i className="fas fa-check-circle"></i> Profile Verification
                                    </div>
                                    <div className={styles.shwStepFeature}>
                                        <i className="fas fa-check-circle"></i> Specialization Selection
                                    </div>
                                </div>
                            </div>

                            <div className={styles.shwStepImage}>
                                Registration & Profile Creation
                            </div>
                        </div>

                        {/* REGISTRATION SECTION */}
                        <section id="shw-registration" className={`${styles.shwSection} ${styles.shwRegistrationSection}`}>
                            <div className={styles.shwContainer}>

                                <h2 className={styles.shwSectionTitle}>Get Started</h2>
                                <p className={styles.shwSectionSubtitle}>
                                    Choose how you want to join E-Advocate and begin your legal journey
                                </p>

                                <div className={styles.shwRegistrationGrid}>

                                    {/* CLIENT */}
                                    <div className={styles.shwRegisterCard}>
                                        <div className={styles.shwRegisterIcon}>
                                            <i className="fas fa-user"></i>
                                        </div>

                                        <h3>Register as Client</h3>
                                        <p>
                                            Looking for legal help? Register as a client to find verified advocates,
                                            book consultations, file cases online, and track your case status.
                                        </p>

                                        <ul className={styles.shwRegisterFeatures}>
                                            <li><i className="fas fa-check-circle"></i> Find Advocates by Specialization</li>
                                            <li><i className="fas fa-check-circle"></i> Online Consultation</li>
                                            <li><i className="fas fa-check-circle"></i> Digital Case Filing</li>
                                            <li><i className="fas fa-check-circle"></i> Case Status Tracking</li>
                                        </ul>

                                        <button className={`${styles.shwBtn} ${styles.shwBtnPrimary}`}>
                                            Register as Client
                                        </button>
                                    </div>

                                    {/* ADVOCATE */}
                                    <div className={`${styles.shwRegisterCard} ${styles.shwAdvocateCard}`}>
                                        <div className={styles.shwRegisterIcon}>
                                            <i className="fas fa-gavel"></i>
                                        </div>

                                        <h3>Register as Advocate</h3>
                                        <p>
                                            Are you a legal professional? Join E-Advocate to showcase your expertise,
                                            connect with clients, manage cases, and grow your practice digitally.
                                        </p>

                                        <ul className={styles.shwRegisterFeatures}>
                                            <li><i className="fas fa-check-circle"></i> Verified Advocate Profile</li>
                                            <li><i className="fas fa-check-circle"></i> Client Lead Generation</li>
                                            <li><i className="fas fa-check-circle"></i> Case & Document Management</li>
                                            <li><i className="fas fa-check-circle"></i> Secure Consultations</li>
                                        </ul>

                                        <button className={`${styles.shwBtn} ${styles.shwBtnSecondary}`}>
                                            Register as Advocate
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </section>

                        {/* STEP 2 */}
                        <div className={styles.shwHowItWorksStep}>
                            <div className={styles.shwStepNumber}>2</div>

                            <div className={styles.shwStepContent}>
                                <h3>Find & Connect</h3>
                                <p>
                                    Clients can browse advocate profiles using our advanced filtering system.
                                    Our AI-powered matching algorithm suggests the most suitable advocates based on
                                    case type, location, experience, and client reviews.
                                </p>

                                <div className={styles.shwStepFeatures}>
                                    <div className={styles.shwStepFeature}><i className="fas fa-check-circle"></i> Advanced Search Filters</div>
                                    <div className={styles.shwStepFeature}><i className="fas fa-check-circle"></i> AI-Powered Matching</div>
                                    <div className={styles.shwStepFeature}><i className="fas fa-check-circle"></i> Secure Messaging</div>
                                </div>
                            </div>

                            <div className={styles.shwStepImage}>
                                Advocate Matching & Connection
                            </div>
                        </div>

                        {/* STEP 3 */}
                        <div className={styles.shwHowItWorksStep}>
                            <div className={styles.shwStepNumber}>3</div>

                            <div className={styles.shwStepContent}>
                                <h3>Consultation & Case Filing</h3>
                                <p>
                                    Schedule consultations via secure video, audio, or chat. Once you've chosen your advocate,
                                    you can proceed with digital case filing, document submission, and payment processing—
                                    all within our secure platform.
                                </p>

                                <div className={styles.shwStepFeatures}>
                                    <div className={styles.shwStepFeature}><i className="fas fa-check-circle"></i> Secure Video Consultation</div>
                                    <div className={styles.shwStepFeature}><i className="fas fa-check-circle"></i> Digital Case Filing</div>
                                    <div className={styles.shwStepFeature}><i className="fas fa-check-circle"></i> Document Management</div>
                                </div>
                            </div>

                            <div className={styles.shwStepImage}>
                                Consultation & Case Management
                            </div>
                        </div>

                        {/* STEP 4 */}
                        <div className={styles.shwHowItWorksStep}>
                            <div className={styles.shwStepNumber}>4</div>

                            <div className={styles.shwStepContent}>
                                <h3>Track & Manage</h3>
                                <p>
                                    Monitor your case progress in real-time with our tracking dashboard. Receive updates
                                    on hearing dates, document submissions, and advocate communications—all in one
                                    centralized location.
                                </p>

                                <div className={styles.shwStepFeatures}>
                                    <div className={styles.shwStepFeature}><i className="fas fa-check-circle"></i> Real-Time Case Tracking</div>
                                    <div className={styles.shwStepFeature}><i className="fas fa-check-circle"></i> Hearing Schedule Updates</div>
                                    <div className={styles.shwStepFeature}><i className="fas fa-check-circle"></i> Document Storage</div>
                                </div>
                            </div>

                            <div className={styles.shwStepImage}>
                                Case Tracking & Management
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* BROWSE PROFILES */}
            <section id="shw-browse-profiles" className={`${styles.shwSection} ${styles.shwBrowseProfiles}`}>
                <div className={styles.shwContainer}>
                    <h2 className={styles.shwSectionTitle}>Browse Profiles</h2>
                    <p className={styles.shwSectionSubtitle}>
                        Find the right legal expert for your needs with our comprehensive filtering system
                    </p>

                    <div className={styles.shwFilterContainer}>
                        <div className={styles.shwFilterGrid}>
                            <div className={styles.shwFilterGroup}>
                                <label htmlFor="shw-language">Select Language</label>
                                <select id="shw-language">
                                    <option value="">Any Language</option>
                                    <option value="english">English</option>
                                    <option value="hindi">Hindi</option>
                                    <option value="tamil">Tamil</option>
                                    <option value="telugu">Telugu</option>
                                </select>
                            </div>

                            <div className={styles.shwFilterGroup}>
                                <label htmlFor="shw-experience">Select Experience</label>
                                <select id="shw-experience">
                                    <option value="">Any Experience</option>
                                    <option value="0-5">0-5 Years</option>
                                    <option value="5-10">5-10 Years</option>
                                    <option value="10-15">10-15 Years</option>
                                    <option value="15+">15+ Years</option>
                                </select>
                            </div>

                            <div className={styles.shwFilterGroup}>
                                <label htmlFor="shw-city">Select City</label>
                                <select id="shw-city">
                                    <option value="">Any City</option>
                                    <option value="delhi">Delhi</option>
                                    <option value="mumbai">Mumbai</option>
                                    <option value="bangalore">Bangalore</option>
                                    <option value="chennai">Chennai</option>
                                </select>
                            </div>

                            <div className={styles.shwFilterGroup}>
                                <label htmlFor="shw-department">Select Department</label>
                                <select id="shw-department">
                                    <option value="">Any Department</option>
                                    <option value="civil">Civil Law</option>
                                    <option value="criminal">Criminal Law</option>
                                    <option value="corporate">Corporate Law</option>
                                    <option value="family">Family Law</option>
                                </select>
                            </div>

                            <div className={styles.shwFilterGroup}>
                                <label htmlFor="shw-state">Select State</label>
                                <select id="shw-state">
                                    <option value="">Any State</option>
                                    <option value="delhi">Delhi</option>
                                    <option value="maharashtra">Maharashtra</option>
                                    <option value="karnataka">Karnataka</option>
                                    <option value="tamilnadu">Tamil Nadu</option>
                                </select>
                            </div>

                            <div className={styles.shwFilterGroup}>
                                <label htmlFor="shw-mode">Consultation Mode</label>
                                <select id="shw-mode">
                                    <option value="">Any Mode</option>
                                    <option value="online">Online Only</option>
                                    <option value="offline">Offline Only</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>

                            <div className={styles.shwFilterGroup}>
                                <label htmlFor="shw-role">Select Role</label>
                                <select id="shw-role">
                                    <option value="">Any Role</option>
                                    <option value="advocate">Advocate</option>
                                    <option value="senior">Senior Advocate</option>
                                    <option value="legal">Legal Advisor</option>
                                </select>
                            </div>

                            <div className={styles.shwFilterGroup}>
                                <label htmlFor="shw-district">Select District</label>
                                <select id="shw-district">
                                    <option value="">Any District</option>
                                    <option value="central">Central Delhi</option>
                                    <option value="south">South Mumbai</option>
                                    <option value="bangalore">Bangalore Urban</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.shwFilterButtons}>
                            <button className={`${styles.shwBtn} ${styles.shwBtnSecondary}`}>RESET</button>
                            <button className={`${styles.shwBtn} ${styles.shwBtnPrimary}`}>APPLY FILTERS</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLOGS */}
            <section id="shw-blogs" className={styles.shwSection}>
                <div className={styles.shwContainer}>
                    <h2 className={styles.shwSectionTitle}>Blogs</h2>
                    <p className={styles.shwSectionSubtitle}>
                        Insights, updates & success stories from advocates & legal experts
                    </p>

                    <div className={styles.shwBlogsGrid}>
                        <div className={styles.shwBlogCard}>
                            <div className={styles.shwBlogImage}>Ethical Boundaries for Advocates</div>
                            <div className={styles.shwBlogContent}>
                                <div className={styles.shwBlogMeta}>
                                    <span className={styles.shwBlogAuthor}>Adv. R. Sharma</span>
                                    <span>March 2025</span>
                                </div>
                                <h3 className={styles.shwBlogTitle}>
                                    Ethical Boundaries for Advocates on Digital Platforms
                                </h3>
                                <p className={styles.shwBlogExcerpt}>
                                    Understanding Bar Council of India guidelines when engaging with clients online.
                                </p>
                                <a href="#" className={styles.shwReadMore}>
                                    Read More <i className="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>

                        <div className={styles.shwBlogCard}>
                            <div className={styles.shwBlogImage}>Digital Evidence Admissibility</div>
                            <div className={styles.shwBlogContent}>
                                <div className={styles.shwBlogMeta}>
                                    <span className={styles.shwBlogAuthor}>Adv. Priya Mehta</span>
                                    <span>February 2025</span>
                                </div>
                                <h3 className={styles.shwBlogTitle}>
                                    Digital Evidence Admissibility in Indian Courts
                                </h3>
                                <p className={styles.shwBlogExcerpt}>
                                    A comprehensive guide to submitting digital evidence and ensuring it meets legal standards.
                                </p>
                                <a href="#" className={styles.shwReadMore}>
                                    Read More <i className="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>

                        <div className={styles.shwBlogCard}>
                            <div className={styles.shwBlogImage}>Case Study: Online Dispute</div>
                            <div className={styles.shwBlogContent}>
                                <div className={styles.shwBlogMeta}>
                                    <span className={styles.shwBlogAuthor}>Legal Team</span>
                                    <span>January 2025</span>
                                </div>
                                <h3 className={styles.shwBlogTitle}>
                                    Success Story: Resolving a Complex Property Dispute Online
                                </h3>
                                <p className={styles.shwBlogExcerpt}>
                                    How E-Advocate platform facilitated a complete property dispute resolution remotely.
                                </p>
                                <a href="#" className={styles.shwReadMore}>
                                    Read More <i className="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section id="shw-about" className={`${styles.shwSection} ${styles.shwAboutSection}`}>
                <div className={styles.shwContainer}>
                    <h2 className={styles.shwSectionTitle}>About E-Advocate</h2>
                    <p className={styles.shwSectionSubtitle}>
                        Revolutionizing Legal Services through Digital Innovation, Connecting Clients
                        with Expert Advocates Seamlessly
                    </p>

                    <div className={styles.shwAboutContent}>
                        <div className={styles.shwAboutText}>
                            <h3>Digital Legal Platform</h3>
                            <p>
                                E-Advocate is a premium digital platform that bridges the gap between clients seeking
                                legal assistance and qualified advocates offering expert services.
                            </p>
                            <p>
                                Our purpose is to democratize access to legal services, making them affordable,
                                transparent, and accessible to everyone regardless of location or economic background.
                            </p>

                            <h3>What We Provide:</h3>

                            <div className={styles.shwServicesGrid}>
                                <div className={styles.shwServiceItem}>
                                    <h4><i className="fas fa-file-upload"></i> Digital Case Filing</h4>
                                    <p>File legal cases online with complete documentation support</p>
                                </div>
                                <div className={styles.shwServiceItem}>
                                    <h4><i className="fas fa-robot"></i> Advocate Matching</h4>
                                    <p>AI-powered matching with specialized advocates based on case type</p>
                                </div>
                                <div className={styles.shwServiceItem}>
                                    <h4><i className="fas fa-shield-alt"></i> Secure Communication</h4>
                                    <p>Encrypted chat, call, and video consultation features</p>
                                </div>
                                <div className={styles.shwServiceItem}>
                                    <h4><i className="fas fa-chart-line"></i> Case Tracking</h4>
                                    <p>Real-time updates on case status and hearing schedules</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.shwAboutImage}>
                            E-Advocate Platform Overview
                        </div>
                    </div>
                </div>
            </section>

            {/* CASE STATUS */}
            <section id="shw-case-status" className={styles.shwSection}>
                <div className={styles.shwContainer}>
                    <h2 className={styles.shwSectionTitle}>Case Status</h2>
                    <p className={styles.shwSectionSubtitle}>
                        Access detailed case status using your case number or filing number
                        as registered with the court.
                    </p>

                    <div className={styles.shwCaseStatusBox}>
                        <p>
                            Enter your case number or filing ID to get real-time updates on your legal proceedings,
                            next hearing dates, and case documents.
                        </p>

                        <div className={styles.shwCaseSearch}>
                            <input type="text" placeholder="Enter Case Number or Filing ID" />
                            <button className={`${styles.shwBtn} ${styles.shwBtnPrimary}`}>
                                Explore
                            </button>
                        </div>

                        <p style={{ marginTop: "20px", fontSize: "14px", color: "#6b7280" }}>
                            <i className="fas fa-shield-alt"></i> Your case information is secure and encrypted
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default SiteHowItWorks;
