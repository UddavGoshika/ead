import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DraftingServicesGrid.module.css';
import {
    ArrowRight,
    FileText,
    ClipboardCheck,
    Scale,
    ScrollText,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const DraftingServicesGrid = () => {
    const navigate = useNavigate();

    const services = [
        {
            id: 'agreements',
            title: 'Agreement Drafting Services',
            description:
                'Legally sound and customized agreements drafted in compliance with the Indian Contract Act and BCI standards.',
            details: [
                'Custom clauses as per client requirements',
                'Legally vetted and enforceable format',
                'Ready for registration or execution',
            ],
            icon: <FileText size={30} />,
            link: '/legal-documentation',
        },
        {
            id: 'affidavits',
            title: 'Affidavit Drafting Services',
            description:
                'Professionally drafted affidavits suitable for courts, government offices, and legal proceedings.',
            details: [
                'Court-compliant affidavit formats',
                'Stamp paper & notarization guidance',
                'Error-free legal language',
            ],
            icon: <ClipboardCheck size={30} />,
            link: '/legal-documentation',
        },
        {
            id: 'notices',
            title: 'Legal Notice Drafting Services',
            description:
                'Strategic legal notices designed to protect rights and initiate lawful action.',
            details: [
                'Cause-of-action based drafting',
                'Advocate-reviewed legal tone',
                'Pre-litigation compliance',
            ],
            icon: <Scale size={30} />,
            link: '/legal-documentation',
        },
        {
            id: 'legal-docs',
            title: 'Legal Document Preparation Services',
            description:
                'Preparation of critical legal documents such as Wills, POA, Trust Deeds, and declarations.',
            details: [
                'Legally valid formats',
                'Jurisdiction-specific drafting',
                'Future-proof & dispute-resistant',
            ],
            icon: <ScrollText size={30} />,
            link: '/legal-documentation',
        },
    ];

    return (
        <section className={styles.sectionContainer}>
            <div className={styles.inner}>
                <div className={styles.header}>
                    <span className={styles.badge}>DOCUMENTATION</span>
                    <h2 className={styles.title}>Premium Drafting & Documentation</h2>
                    <p className={styles.subtitle}>
                        Explore professionally drafted legal documents tailored to your needs
                    </p>
                </div>

                <div className={styles.grid}>
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            className={styles.card}
                            whileHover={{ y: -8 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {/* ICON + TITLE */}
                            <div className={styles.titleRow}>
                                <div className={styles.iconWrapper}>
                                    {service.icon}
                                </div>
                                <h3 className={styles.cardTitle}>
                                    {service.title}
                                </h3>
                            </div>

                            {/* DESCRIPTION */}
                            <p className={styles.description}>
                                {service.description}
                            </p>

                            {/* DETAILED CONTENT */}
                            <ul className={styles.detailsList}>
                                {service.details.map((item) => (
                                    <li key={item}>
                                        <CheckCircle2 size={16} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <button
                                className={styles.learnMore}
                                onClick={() =>
                                    navigate(service.link, {
                                        state: { serviceId: service.id },
                                    })
                                }
                            >
                                View Full Details <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DraftingServicesGrid;
