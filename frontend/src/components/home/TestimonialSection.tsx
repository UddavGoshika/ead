import React from 'react';
import styles from './TestimonialSection.module.css';
import { Quote, Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
    {
        id: 1,
        name: "Rajesh Kumar",
        role: "Business Owner",
        content: "E-Advocate helped me find the perfect corporate lawyer for my startup. The platform is seamless and the matching algorithm is spot on!",
        rating: 5,
        image: "RK"
    },
    {
        id: 2,
        name: "Anjali Singh",
        role: "Property Consultant",
        content: "I was struggling with legal documentation for months until I found E-Advocate. The secure communication and case tracking features are life-savers.",
        rating: 5,
        image: "AS"
    },
    {
        id: 3,
        name: "Vikram Malhotra",
        role: "Individual Client",
        content: "The transparency E-Advocate offers is unmatched. I knew exactly who I was hiring and could track every hearing schedule in real-time.",
        rating: 4,
        image: "VM"
    }
];

const TestimonialSection: React.FC = () => {
    return (
        <section className={styles.testimonialSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>What Our Clients Says</h2>
                    <p className={styles.subtitle}>Success stories from individuals and businesses who found their legal experts through E-Advocate.</p>
                </div>

                <div className={styles.grid}>
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            className={styles.card}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className={styles.quoteIcon}>
                                <Quote size={40} />
                            </div>
                            {/* <div className={styles.rating}>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill={i < testimonial.rating ? "var(--primary-gold)" : "none"}
                                        stroke={i < testimonial.rating ? "var(--primary-gold)" : "#64748b"}
                                    />
                                ))}
                            </div> */}
                            <p className={styles.content}>"{testimonial.content}"</p>
                            <div className={styles.footer}>
                                <div className={styles.avatar}>{testimonial.image}</div>
                                <div className={styles.info}>
                                    <h3>{testimonial.name} <CheckCircle size={14} className={styles.verifyIcon} /></h3>
                                    <span>{testimonial.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
