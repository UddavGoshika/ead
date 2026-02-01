import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DraftingServicesGrid.module.css';
import { ArrowRight, FileText, ClipboardCheck, Scale, ScrollText } from 'lucide-react';
import { motion } from 'framer-motion';

const DraftingServicesGrid = () => {
    const navigate = useNavigate();
    const services = [
        {
            id: 'rent-agreement',
            title: 'Agreement Drafting Services',
            description: 'Legally sound and customized agreements drafted as per Indian Contract Act and BCI standards.',
            icon: <FileText size={32} />,
            link: '/legal-documentation'
        },
        {
            id: 'affidavit',
            title: 'Affidavit Drafting Services',
            description: 'Accurate and legally valid affidavits drafted for personal, professional, and court-related purposes.',
            icon: <ClipboardCheck size={32} />,
            link: '/legal-documentation'
        },
        {
            id: 'legal-notice',
            title: 'Legal Notice Drafting Services',
            description: 'Strategic and legally enforceable legal notices drafted to assert rights and initiate action.',
            icon: <Scale size={32} />,
            link: '/legal-documentation'
        },
        {
            id: 'will-drafting',
            title: 'Legal Document Preparation Services',
            description: 'Expert preparation of specialized legal documents including Wills, POA, and Trust Deeds.',
            icon: <ScrollText size={32} />,
            link: '/legal-documentation'
        }
    ];

    return (
        <section className={styles.sectionContainer}>
            <div className={styles.inner}>
                <div className={styles.header}>
                    <span className={styles.badge}>DOCUMENTATION</span>
                    <h2 className={styles.title}>Premium Drafting & Documentation</h2>
                    <p className={styles.subtitle}>Explore our specialized legal drafting solutions in detail</p>
                </div>

                <div className={styles.grid}>
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            className={styles.card}
                            whileHover={{ y: -10 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className={styles.iconWrapper}>
                                {service.icon}
                            </div>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                            <button
                                className={styles.learnMore}
                                onClick={() => navigate(service.link, { state: { serviceId: service.id } })}
                            >
                                Learn More <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DraftingServicesGrid;
