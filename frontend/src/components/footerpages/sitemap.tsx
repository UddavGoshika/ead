import React from "react";
import styles from "./sitemap.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sitemap: React.FC = () => {
    const { openAuthModal, openClientReg, openAdvocateReg } = useAuth();
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        navigate('/');
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <section className={styles.termsSection}>
            <div className={styles.termsContainer}>
                <div className={styles.container}>
                    <h1>Site Map</h1>

                    <p className={styles.updated}></p>

                    <section className={styles.sitemap}>
                        <h4>E-Advocate Services Sitemap</h4>

                        <div className={styles.sitemapGrid}>
                            <div>
                                <h4>Platform</h4>
                                <ul>
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/about-us">About E-Advocate</Link></li>
                                    <li><Link to="/site-how-it-works">How It Works</Link></li>
                                    <li><button className={styles.linkBtn} onClick={() => scrollToSection('mainblogs')}>Legal Blogs</button></li>
                                    <li><button className={styles.linkBtn} onClick={() => scrollToSection('contact')}>Contact & Support</button></li>
                                </ul>
                            </div>

                            <div>
                                <h4>User Access</h4>
                                <ul>
                                    <li><button className={styles.linkBtn} onClick={() => openAuthModal('login')}>Login</button></li>
                                    <li><button className={styles.linkBtn} onClick={() => openAuthModal('register')}>Register</button></li>
                                    <li><button className={styles.linkBtn} onClick={openClientReg}>Client Registration</button></li>
                                    <li><button className={styles.linkBtn} onClick={openAdvocateReg}>Advocate Registration</button></li>
                                    <li><button className={styles.linkBtn} onClick={() => openAuthModal('login')}>Forgot Password</button></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Client Services</h4>
                                <ul>
                                    <li><button className={styles.linkBtn} onClick={() => scrollToSection('search')}>Browse Advocates</button></li>
                                    <li><button className={styles.linkBtn} onClick={() => scrollToSection('search')}>Online Consultation</button></li>
                                    <li><button className={styles.linkBtn} onClick={() => scrollToSection('search')}>Offline Consultation</button></li>
                                    <li><Link to="/dashboard/client">Submit Legal Request</Link></li>
                                    <li><a href="https://services.ecourts.gov.in/ecourtindia_v6/" target="_blank" rel="noopener noreferrer">Case Follow-ups</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Advocate Services</h4>
                                <ul>
                                    <li><Link to="/dashboard/advocate">Advocate Dashboard</Link></li>
                                    <li><Link to="/dashboard/advocate">Manage Profile</Link></li>
                                    <li><Link to="/dashboard/advocate">Client Requests</Link></li>
                                    <li><Link to="/dashboard/advocate">Availability Management</Link></li>
                                    <li><Link to="/dashboard/advocate">Practice Areas</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Dashboards</h4>
                                <ul>
                                    <li><Link to="/admin">Admin Dashboard</Link></li>
                                    <li><Link to="/dashboard/client">Client Dashboard</Link></li>
                                    <li><Link to="/dashboard/advocate">Advocate Dashboard</Link></li>
                                    <li><Link to="/dashboard/user">Account Settings</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Legal Tools</h4>
                                <ul>
                                    <li>
                                        <a
                                            href="https://filing.ecourts.gov.in/pdedev/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            File a Case
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://services.ecourts.gov.in/ecourtindia_v6/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Case Status
                                        </a>
                                    </li>
                                    <li><Link to="/site-how-it-works">Legal Assistant</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Policies</h4>
                                <ul>
                                    <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                                    <li><Link to="/terms-of-use">Terms & Conditions</Link></li>
                                    <li><Link to="/fraud-alert">Fraud Alert</Link></li>
                                    <li><Link to="/third-party-policy">Third-Party Terms</Link></li>
                                    <li><Link to="/terms-of-use">Disclaimer</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Tatito Network</h4>
                                <ul>
                                    <li><a href="#">Tatito Edverse</a></li>
                                    <li><a href="#">Tatito Career Hub</a></li>
                                    <li><a href="#">Tatito Nexus</a></li>
                                    <li><a href="#">Tatito Civic One</a></li>
                                    <li><a href="/">E-Advocate Services</a></li>
                                    <li><a href="#">Tatito Fashions</a></li>
                                </ul>
                            </div>

                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
};

export default Sitemap;
