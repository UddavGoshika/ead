import React from "react";
import styles from "./refund.module.css";

const RefundPolicy: React.FC = () => {
    return (
        <section className={styles.termsSection}>
            <div className={styles.termsContainer}>
                <div className={styles.container}>
                    <h4>Refund Policy</h4>

                    <p>
                        This Refund Policy explains the circumstances under which refunds may or may not be
                        issued for payments made on Tatito Projects sub branch of E-Advocate Services.
                        By using the Platform or making any payment, you agree to this Refund Policy.
                    </p>

                    <hr />

                    <h4>1. Nature of Payments on the Platform</h4>
                    <p>
                        E-Advocate Services operates as a technology facilitation platform to help users
                        connect with advocates.
                    </p>

                    <p>
                        Payments on the Platform may include:
                    </p>

                    <ul>
                        <li>Platform subscription or usage fees (if applicable)</li>
                        <li>Feature access fees</li>
                        <li>Third-party service charges</li>
                    </ul>

                    <p>
                        ⚠️ Advocate professional fees are not determined, controlled, or guaranteed by
                        E-Advocate Services.
                    </p>

                    <h4>2. No Refund on Advocate Fees</h4>
                    <ul>
                        <li>Any fees paid directly to advocates for legal services are non-refundable</li>
                        <li>
                            Refunds, if any, are subject to mutual agreement between the advocate and the client
                        </li>
                        <li>
                            E-Advocate Services is not responsible for disputes regarding advocate fees,
                            consultations, or outcomes
                        </li>
                    </ul>

                    <p>
                        Professional services are governed by applicable laws and ethical standards
                        prescribed by the Bar Council of India.
                    </p>

                    <h4>3. Platform Fees & Subscription Refunds</h4>

                    <h3>A. Non-Refundable Situations</h3>
                    <p>
                        Refunds will not be issued in cases of:
                    </p>

                    <ul>
                        <li>Change of mind</li>
                        <li>Dissatisfaction with advocate advice or outcome</li>
                        <li>Inactivity or non-usage after subscription purchase</li>
                        <li>Account suspension due to policy violation</li>
                        <li>Payments made with incorrect user details</li>
                    </ul>

                    <h4>B. Refundable Situations (Limited)</h4>
                    <p>
                        Refunds may be considered only if:
                    </p>

                    <ul>
                        <li>A payment was successfully debited but service was not activated</li>
                        <li>Duplicate payment occurred due to a technical error</li>
                        <li>
                            A purchased platform feature is permanently unavailable due to system fault
                        </li>
                    </ul>

                    <p>
                        All refund decisions are at the sole discretion of E-Advocate Services.
                    </p>

                    <h4>4. Refund Request Process</h4>
                    <p>
                        To request a refund (where applicable):
                    </p>

                    <ul>
                        <li>📧 Email: <strong>[official support / billing email]</strong></li>
                        <li>📌 Subject: <strong>Refund Request – E-Advocate Services</strong></li>
                    </ul>

                    <p>
                        Please include:
                    </p>

                    <ul>
                        <li>Registered name and email / phone number</li>
                        <li>Payment reference ID</li>
                        <li>Date and amount of payment</li>
                        <li>Reason for refund request</li>
                    </ul>

                    <p>
                        Incomplete refund requests may be rejected.
                    </p>

                    <h4>5. Refund Timeline</h4>
                    <ul>
                        <li>Refund requests are reviewed within 7–10 working days</li>
                        <li>Approved refunds (if any) are processed to the original payment method</li>
                        <li>Processing time may vary depending on payment gateway or bank</li>
                    </ul>

                    <h4>6. No Guarantee of Legal Outcomes</h4>
                    <p>
                        Refunds will not be granted on the basis of:
                    </p>

                    <ul>
                        <li>Case results</li>
                        <li>Court decisions</li>
                        <li>Legal delays</li>
                        <li>Advocate strategy or advice</li>
                    </ul>

                    <p>
                        E-Advocate Services does not guarantee outcomes of legal matters.
                    </p>

                    <h4>7. Chargebacks & Misuse</h4>
                    <ul>
                        <li>
                            Unauthorized chargebacks without contacting support may result in
                            account suspension
                        </li>
                        <li>
                            Fraudulent refund claims may lead to legal action under applicable
                            Indian laws
                        </li>
                    </ul>

                    <h4>8. Third-Party Payment Gateways</h4>
                    <p>
                        All payments are processed through third-party payment gateways.
                        Refunds are subject to:
                    </p>

                    <ul>
                        <li>Gateway policies</li>
                        <li>Bank processing timelines</li>
                        <li>Regulatory requirements</li>
                    </ul>

                    <p>
                        E-Advocate Services does not store sensitive financial information.
                    </p>

                    <h4>9. Policy Changes</h4>
                    <p>
                        E-Advocate Services reserves the right to modify this Refund Policy at any time.
                        The updated policy will be effective immediately upon publication.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default RefundPolicy;
