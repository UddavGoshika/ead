import React from "react";
import styles from "./sitemap.module.css";

const Sitemap: React.FC = () => {
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
                                    <li><a href="#home">Home</a></li>
                                    <li><a href="#about">About E-Advocate</a></li>
                                    <li><a href="#">How It Works</a></li>
                                    <li><a href="#mainblogs">Legal Blogs</a></li>
                                    <li><a href="#contact">Contact & Support</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4>User Access</h4>
                                <ul>
                                    <li><a href="#">Login</a></li>
                                    <li><a href="#">Register</a></li>
                                    <li><a href="#">Client Registration</a></li>
                                    <li><a href="#">Advocate Registration</a></li>
                                    <li><a href="#">Forgot Password</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Client Services</h4>
                                <ul>
                                    <li><a href="#">Browse Advocates</a></li>
                                    <li><a href="#">Online Consultation</a></li>
                                    <li><a href="#">Offline Consultation</a></li>
                                    <li><a href="#">Submit Legal Request</a></li>
                                    <li><a href="#">Case Follow-ups</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Advocate Services</h4>
                                <ul>
                                    <li><a href="#advocatedashboard">Advocate Dashboard</a></li>
                                    <li><a href="#myprofile">Manage Profile</a></li>
                                    <li><a href="#">Client Requests</a></li>
                                    <li><a href="#">Availability Management</a></li>
                                    <li><a href="#">Practice Areas</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Dashboards</h4>
                                <ul>
                                    <li><a href="#dashboard">Admin Dashboard</a></li>
                                    <li><a href="#clientdashboard">Client Dashboard</a></li>
                                    <li><a href="#advocatedashboard">Advocate Dashboard</a></li>
                                    <li><a href="#settings">Account Settings</a></li>
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
                                    <li><a href="#">Legal Assistant</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Policies</h4>
                                <ul>
                                    <li><a href="#">Privacy Policy</a></li>
                                    <li><a href="#">Terms & Conditions</a></li>
                                    <li><a href="#">Fraud Alert</a></li>
                                    <li><a href="#">Third-Party Terms</a></li>
                                    <li><a href="#">Disclaimer</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4>Tatito Network</h4>
                                <ul>
                                    <li><a href="#">Tatito Edverse</a></li>
                                    <li><a href="#">Tatito Career Hub</a></li>
                                    <li><a href="#">Tatito Nexus</a></li>
                                    <li><a href="#">Tatito Civic One</a></li>
                                    <li><a href="#">Tatito Health+</a></li>
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
