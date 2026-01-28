import React from "react";
import styles from "./termsofuse.module.css";

const TermsOfUse: React.FC = () => {
    return (
        <section className={styles.termsSection}>
            <div className={styles.termsContainer}>
                <h2>Terms of Use</h2>

                {/* 
        <p className={styles.updated}>
          E-Advocate Services<br />
          Last updated: <strong>[Add Date]</strong>
        </p>
        */}

                <p>
                    These Terms of Use (“Terms”) govern access to and use of the E-Advocate Services
                    website and mobile application (“Platform”). By accessing or using the Platform,
                    you agree to be bound by these Terms.
                </p>

                <p>If you do not agree, please discontinue use immediately.</p>

                <hr />

                <h3>1. Purpose of the Platform</h3>

                <p>
                    E-Advocate Services is a technology facilitation platform designed to enable users to:
                </p>

                <ul>
                    <li>Discover and connect with advocates</li>
                    <li>Share basic case-related information</li>
                    <li>Communicate for lawful legal consultation purposes</li>
                </ul>

                <p>
                    The Platform does not provide legal advice and does not act as an advocate or law firm.
                    All legal services are provided independently by advocates in accordance with
                    applicable laws and rules issued by the Bar Council of India.
                </p>

                <h3>2. Eligibility to Use</h3>

                <ul>
                    <li>You are 18 years or older</li>
                    <li>You are legally capable of entering into contracts</li>
                    <li>You provide accurate and truthful information</li>
                </ul>

                <p>
                    Advocates must be validly enrolled with a State Bar Council in India.
                </p>

                <h3>3. Account Registration & Access</h3>

                <ul>
                    <li>Users are responsible for maintaining confidentiality of login credentials</li>
                    <li>You are responsible for all activities under your account</li>
                    <li>Any unauthorized use must be reported immediately</li>
                </ul>

                <h3>4. Acceptable Use Policy</h3>

                <ul>
                    <li>Impersonate advocates, clients, or officials</li>
                    <li>Upload false, misleading, or illegal information</li>
                    <li>Solicit clients or advertise legal services unlawfully</li>
                    <li>Harass, threaten, or abuse other users</li>
                    <li>Attempt to hack, scrape, or disrupt the Platform</li>
                </ul>

                <h3>5. Governing Law & Jurisdiction</h3>

                <p>
                    These Terms are governed by the laws of India.
                    All disputes shall be subject to the jurisdiction of Indian courts only.
                </p>
            </div>
        </section>
    );
};

export default TermsOfUse;
