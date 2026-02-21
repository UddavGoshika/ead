import React from 'react';
import styles from './CreditsPage.module.css';
import { ArrowLeft, ShieldCheck, Landmark, Cpu, Handshake, Info } from 'lucide-react';

const CreditsPage: React.FC<{ backToHome?: () => void }> = ({ backToHome }) => {
    const creditsData = [
        {
            title: "Official Approvals & Compliance",
            icon: <ShieldCheck size={24} />,
            points: [
                "Strict adherence to Digital India e-Governance Standards.",
                "Compliance with the Information Technology Act, 2000.",
                "Direct integration with India.gov.in official services.",
                "Authorized platform for digitizing advocate-client interactions."
            ]
        },
        {
            title: "Departmental Partnerships",
            icon: <Landmark size={24} />,
            points: [
                "Strategic alignment with the Department of Justice (DoJ).",
                "Deep integration with eCommittee Supreme Court of India.",
                "Support for e-Filing 3.0 protocols across District and High Courts.",
                "Real-time syncing with National Judicial Data Grid (NJDG)."
            ]
        },
        {
            title: "Technological Collaborations",
            icon: <Cpu size={24} />,
            points: [
                "Infrastructure inspired by NIC data security protocols.",
                "Legislation data sourced from 'India Code' portal.",
                "Collaboration with open-source legal tech communities.",
                "ISO-certified secure cloud data hosting."
            ]
        },
        {
            title: "Institutional Associations",
            icon: <Handshake size={24} />,
            points: [
                "Association with Bar Associations for ethical guidelines.",
                "Membership in Startup India and Digital Transformation councils.",
                "Alignment with BCI (Bar Council of India) digital protocols.",
                "Collaboration with Legal Aid Authorities."
            ]
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                {/* {backToHome && <button onClick={backToHome} className={styles.backBtn}><ArrowLeft size={20} /></button>} */}
                <h1>Institutional Foundation & Credits</h1>
            </div>

            <div className={styles.introCard}>
                <Info className={styles.infoIcon} size={32} />
                <p>E-Advocate Services is built on a foundation of trust, official compliance, and technical excellence. We collaborate with India's leading legal and digital institutions to provide a transparent judicial ecosystem.</p>
            </div>

            <div className={styles.grid}>
                {creditsData.map((section, idx) => (
                    <div key={idx} className={styles.creditCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconBox}>{section.icon}</div>
                            <h3>{section.title}</h3>
                        </div>
                        <ul className={styles.points}>
                            {section.points.map((point, pIdx) => (
                                <li key={pIdx}>{point}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className={styles.platformCredits}>
                <h2>Platform Credits</h2>
                <div className={styles.creditsRow}>
                    <div className={styles.creditItem}>
                        <span>Technical Architecture</span>
                        <p>Ilearn Nexus Technology Team</p>
                    </div>
                    <div className={styles.creditItem}>
                        <span>Design Standards</span>
                        <p>High-Accessibility Modern UI</p>
                    </div>
                    <div className={styles.creditItem}>
                        <span>Iconography</span>
                        <p>Lucide-React & FontAwesome</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditsPage;
