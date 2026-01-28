import React from "react";
import styles from "./fraudalert.module.css";

const FraudAlert: React.FC = () => {
    return (
        <section className={styles.fraudSection}>
            <div className={styles.fraudContainer}>
                <h2>Fraud Alert</h2>

                <p className={styles.updated}>
                    E-Advocate Services
                </p>

                <p>
                    E-Advocate Services is committed to protecting users and advocates from fraud,
                    impersonation, and misuse of the platform name. This section outlines common
                    risks, prohibited activities, and safety guidance.
                </p>

                <hr />

                <h3>1. No Guaranteed Results or Promises</h3>
                <ul>
                    <li>Guarantee case outcomes</li>
                    <li>Promise legal success</li>
                    <li>Assure favorable court decisions</li>
                    <li>Offer fast-track or “fixed” case results</li>
                </ul>

                <p>
                    Any person or entity making such claims using the platform name is not
                    associated with E-Advocate Services.
                </p>

                <h3>2. No Commission-Based or Paid Matchmaking</h3>
                <ul>
                    <li>No payments are taken for connecting users with advocates</li>
                    <li>No priority listings are sold</li>
                    <li>No inducements are offered for selecting any advocate</li>
                </ul>

                <h3>3. Impersonation & Fake Profiles</h3>
                <p>
                    Creating or using fake profiles or impersonating advocates, courts,
                    authorities, or platform representatives is strictly prohibited.
                </p>

                <h3>4. Unauthorized Communications</h3>
                <ul>
                    <li>We never request OTPs or passwords</li>
                    <li>No payment requests via personal numbers or messaging apps</li>
                    <li>No legal threats through informal channels</li>
                </ul>

                <h3>5. Payments & Financial Safety</h3>
                <ul>
                    <li>Verify payment requests carefully</li>
                    <li>Avoid sharing financial details with unknown parties</li>
                    <li>Use authorized payment methods only</li>
                </ul>

                <h3>6. Misuse of Platform Name</h3>
                <p>
                    Any misuse of the E-Advocate Services name, logo, or identity may result
                    in legal action under applicable Indian laws.
                </p>

                <h3>7. Reporting Suspicious Activity</h3>
                <ul>
                    <li>Suspicious messages or calls</li>
                    <li>Fake advocate profiles</li>
                    <li>Unauthorized payment requests</li>
                    <li>Impersonation attempts</li>
                </ul>

                <h3>8. Platform Safeguards</h3>
                <ul>
                    <li>Profile verification checks</li>
                    <li>Activity monitoring for abuse patterns</li>
                    <li>Account suspension and blocking mechanisms</li>
                </ul>

                <h3>9. Legal Consequences</h3>
                <ul>
                    <li>Immediate account termination</li>
                    <li>Reporting to law-enforcement authorities</li>
                    <li>Civil or criminal action under Indian law</li>
                </ul>

                <h3>10. User Responsibility</h3>
                <p>
                    Users are responsible for safeguarding their accounts, verifying communications,
                    and exercising caution when sharing personal or financial information.
                </p>
            </div>
        </section>
    );
};

export default FraudAlert;
