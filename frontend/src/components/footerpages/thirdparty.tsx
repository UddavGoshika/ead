import React from "react";
import styles from "./thirdparty.module.css";

const ThirdPartyTerms: React.FC = () => {
    return (
        <section
            className={styles.termsSection}
            id="third-partyTermsofUse"
            style={{ width: "1800px" }}
        >
            <div className={styles.termsContainer}>
                <div className={styles.container}>
                    <h4>Third-Party Terms of Use</h4>

                    <p className={styles.updated}>
                        E-Advocate Services
                    </p>

                    <p>
                        This Third-Party Terms of Use section explains how E-Advocate Services
                        interacts with third-party platforms, services, and tools that may be
                        integrated with or linked from our website or mobile application.
                    </p>

                    <hr />

                    <h4>1. Use of Third-Party Services</h4>
                    <p>
                        E-Advocate Services may rely on third-party service providers for limited
                        and essential functions such as:
                    </p>

                    <ul>
                        <li>Website and application hosting</li>
                        <li>Cloud infrastructure and data storage</li>
                        <li>Security and fraud prevention</li>
                        <li>Messaging or notification delivery</li>
                        <li>Payment gateway processing (if applicable)</li>
                    </ul>

                    <p>
                        These services are used strictly to operate and improve the platform.
                    </p>

                    <h4>2. Third-Party Links</h4>
                    <p>
                        The platform may contain links to third-party websites or services for
                        user convenience. E-Advocate Services does not control, endorse, or
                        assume responsibility for the content, policies, or practices of such
                        third parties.
                    </p>

                    <h4>3. Independent Terms & Policies</h4>
                    <p>
                        Third-party services operate under their own terms of use, privacy
                        policies, and conditions. Users are advised to review the applicable
                        third-party terms before engaging with such services.
                    </p>

                    <h4>4. No Liability for Third-Party Actions</h4>
                    <p>
                        E-Advocate Services shall not be liable for:
                    </p>

                    <ul>
                        <li>Availability or performance of third-party services</li>
                        <li>Data handling practices of third parties</li>
                        <li>Losses or damages arising from third-party platforms</li>
                        <li>Disputes between users and third-party providers</li>
                    </ul>

                    <h4>5. Limited Data Sharing</h4>
                    <p>
                        Where integration with third-party services is required, only the
                        minimum necessary data is shared to enable platform functionality.
                    </p>

                    <p>
                        Third-party providers are contractually required to:
                    </p>

                    <ul>
                        <li>Maintain confidentiality</li>
                        <li>Use data only for agreed purposes</li>
                        <li>Comply with applicable Indian laws</li>
                    </ul>

                    <h4>6. Payments via Third-Party Gateways</h4>
                    <p>
                        If payment features are enabled, all transactions are processed through
                        third-party payment gateways. E-Advocate Services does not store
                        sensitive financial information.
                    </p>

                    <p>
                        Refunds, chargebacks, and transaction disputes are subject to the terms
                        and policies of the respective payment gateway and financial
                        institutions.
                    </p>

                    <h4>7. External Communication Platforms</h4>
                    <p>
                        Any communication conducted outside the platform (such as phone calls,
                        email, or messaging applications) is governed by the terms and policies
                        of the respective third-party service providers.
                    </p>

                    <p>
                        E-Advocate Services does not monitor or control such external
                        communications.
                    </p>

                    <h4>8. Compliance & Legal Standards</h4>
                    <p>
                        Use of third-party services through the platform is subject to:
                    </p>

                    <ul>
                        <li>Applicable Indian laws</li>
                        <li>Information Technology Act, 2000</li>
                        <li>Relevant IT Rules</li>
                        <li>Professional and ethical standards applicable to legal platforms</li>
                    </ul>

                    <h4>9. Changes to Third-Party Terms</h4>
                    <p>
                        E-Advocate Services reserves the right to update this Third-Party Terms
                        of Use section at any time. Continued use of the platform constitutes
                        acceptance of the updated terms.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ThirdPartyTerms;
