import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './HomeBlogCard.module.css';

interface HomeBlogCardProps {
    post: {
        id: number;
        title: string;
        description: string;
        author: string;
        authorInitials: string;
        module: string;
        date: string;
        category: string;
        image: string;
    };
}

const HomeBlogCard: React.FC<HomeBlogCardProps> = ({ post }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.cardHeader}>
                <div className={styles.avatarCircle}>
                    {post.authorInitials}
                </div>
                <div className={styles.headerInfo}>
                    <span className={styles.serviceName}>{post.author}</span>
                    <span className={styles.moduleName}>{post.module}</span>
                    <span className={styles.date}>{post.date}</span>
                </div>
            </div>

            <div className={styles.cardBody}>
                <h2 className={styles.mainTitle}>{post.title}</h2>
                <p className={styles.cardDescription}>{post.description}</p>
            </div>

            <div className={styles.cardFooter}>
                <button className={styles.actionBtn}>{post.category}</button>
                <button className={styles.readBtn} onClick={() => navigate('/blogs')}>Read Article</button>
            </div>
        </motion.div>
    );
};

export default HomeBlogCard;
