import React from "react";
import styles from "./grivence.module.css";

const Grievances: React.FC = () => {
    return (
        <section className={styles.termsSection}>
            <div className={styles.termsContainer}>
                <div className={styles.container}>
                    <h4>Grievance</h4>

                    <p className={styles.updated}>
                        E-Advocate Services
                    </p>

                    <p>
                        E-Advocate Services is committed to addressing user concerns in a fair, transparent,
                        and timely manner. This Grievance Redressal section explains how users can raise
                        grievances related to the platform.
                    </p>

                    <hr />

                    <h4>1. Scope of Grievances</h4>
                    <p>
                        Users may raise grievances related to:
                    </p>

                    <ul>
                        <li>Platform misuse or policy violations</li>
                        <li>Account or profile-related issues</li>
                        <li>Privacy or data protection concerns</li>
                        <li>Technical or access-related problems</li>
                        <li>Impersonation or fraudulent activity on the platform</li>
                    </ul>

                    <h4>2. Matters Not Covered</h4>
                    <p>
                        The platform does not handle grievances related to:
                    </p>

                    <ul>
                        <li>Legal advice provided by advocates</li>
                        <li>Advocate–client disputes</li>
                        <li>Professional conduct of advocates outside the platform</li>
                        <li>Case outcomes, court proceedings, or legal strategy</li>
                    </ul>

                    <h4>3. How to Submit a Grievance</h4>
                    <p>
                        Grievances may be submitted through official support channels only.
                    </p>

                    <ul>
                        <li>📧 Email: <strong>[official grievance / support email]</strong></li>
                        <li>📌 Subject Line: <strong>Grievance – E-Advocate Services</strong></li>
                    </ul>

                    <p>
                        Users are advised to include clear details of the issue to facilitate review.
                    </p>

                    <h4>4. Review & Resolution Process</h4>
                    <p>
                        Upon receipt of a grievance:
                    </p>

                    <ul>
                        <li>The grievance will be acknowledged within a reasonable timeframe</li>
                        <li>Relevant details will be reviewed internally</li>
                        <li>
                            Appropriate action will be taken in accordance with platform policies and law
                        </li>
                    </ul>

                    <h4>5. Resolution Timeline</h4>
                    <p>
                        E-Advocate Services aims to address and resolve valid grievances within a reasonable
                        period, subject to the nature and complexity of the issue.
                    </p>

                    <h4>6. User Cooperation</h4>
                    <p>
                        Users are expected to cooperate during the grievance review process and provide
                        accurate and complete information when requested.
                    </p>

                    <h4>7. Misuse of Grievance Mechanism</h4>
                    <p>
                        Submitting false, misleading, or malicious grievances may result in appropriate
                        action, including account suspension, as permitted by law.
                    </p>

                    <h4>8. Legal Compliance</h4>
                    <p>
                        The grievance mechanism is maintained in accordance with applicable Indian laws,
                        including the Information Technology Act, 2000 and relevant rules.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Grievances;
