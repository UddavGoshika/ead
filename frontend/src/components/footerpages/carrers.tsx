import React from 'react';
// import styles from './carrer.module.css';
import styles from './FooterPage.module.css';
const Careers: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.title}>Careers at E-Advocate</h1>

            <div className={styles.content}>
                {/* INTRO */}
                <section className={styles.section}>
                    <h2>Join Our Mission</h2>
                    <p>
                        E-Advocate Services is building a secure digital ecosystem to connect
                        citizens with verified legal professionals across India. We welcome
                        advocates, legal scholars, technologists, and support professionals
                        who believe in ethical practice, confidentiality, and access to justice.
                    </p>
                </section>

                {/* WHY WORK WITH US */}
                <section className={styles.section}>
                    <h2>Why Work With Us?</h2>
                    <ul className={styles.bullets}>
                        <li>
                            <strong>Innovative Environment:</strong> Work on first-of-its-kind legal tech solutions.
                        </li>
                        <li>
                            <strong>Growth Opportunities:</strong> Continuous learning and professional development.
                        </li>
                        <li>
                            <strong>Impact:</strong> Help millions of people access justice more effectively.
                        </li>
                        <li>
                            <strong>Culture:</strong> A collaborative, diverse, and high-performance team.
                        </li>
                    </ul>
                </section>

                {/* CAREER OPPORTUNITIES */}
                <section className={styles.section}>
                    <h2>Career Opportunities</h2>

                    <ul className={styles.careerList}>
                        <li className={styles.careerItem}>
                            <a href="/careers/advocates" className={styles.careerLink}>
                                Advocate & Law Firm Partnerships
                            </a>
                            <span className={styles.careerSubtext}>
                                Join our verified advocate network and offer professional legal services
                                while maintaining full independence and client confidentiality.
                            </span>
                        </li>

                        <li className={styles.careerItem}>
                            <a href="/careers/legal-internships" className={styles.careerLink}>
                                Legal Internships & Clerkships
                            </a>
                            <span className={styles.careerSubtext}>
                                Opportunities for law students and fresh graduates to gain exposure to
                                digital legal platforms, case workflows, and legal research.
                            </span>
                        </li>

                        <li className={styles.careerItem}>
                            <a href="/careers/legal-research" className={styles.careerLink}>
                                Legal Research & Content Roles
                            </a>
                            <span className={styles.careerSubtext}>
                                Contribute to legal articles, case summaries, compliance documentation,
                                and knowledge resources aligned with Indian laws.
                            </span>
                        </li>

                        <li className={styles.careerItem}>
                            <a href="/careers/technology" className={styles.careerLink}>
                                Technology & Platform Development
                            </a>
                            <span className={styles.careerSubtext}>
                                Roles for developers, UI/UX designers, cybersecurity professionals,
                                and system architects focused on secure legal technology.
                            </span>
                        </li>

                        <li className={styles.careerItem}>
                            <a href="/careers/support" className={styles.careerLink}>
                                Client & Advocate Support
                            </a>
                            <span className={styles.careerSubtext}>
                                Assist users and advocates with onboarding, platform guidance,
                                and issue resolution while maintaining privacy standards.
                            </span>
                        </li>

                        <li className={styles.careerItem}>
                            <a href="/careers/compliance" className={styles.careerLink}>
                                Compliance & Quality Assurance
                            </a>
                            <span className={styles.careerSubtext}>
                                Help ensure adherence to professional ethics, data protection norms,
                                and platform policies.
                            </span>
                        </li>

                        <li className={styles.careerItem}>
                            <a href="/careers/freelance" className={styles.careerLink}>
                                Freelance & Remote Opportunities
                            </a>
                            <span className={styles.careerSubtext}>
                                Flexible engagement options for legal experts, writers, designers,
                                and technical contributors.
                            </span>
                        </li>
                    </ul>
                </section>

                {/* NOTE */}
                <section className={styles.section}>
                    <p className={styles.footerNote}>
                        E-Advocate Services does not guarantee employment, client volume, or income.
                        All roles and partnerships are subject to verification, applicable laws,
                        and platform terms.
                    </p>

                    <p className={styles.contactNote}>
                        Interested candidates can send their CV to:{' '}
                        <strong>careers@eadvocateservices.com</strong>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Careers;
