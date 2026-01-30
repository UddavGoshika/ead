import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './HomeBlogCard.module.css';

interface HomeBlogCardProps {
    post: {
        id: string;
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
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleReadClick = async () => {
        try {
            // Increment view count in background
            fetch(`${apiUrl}/api/blogs/${post.id}`, { method: 'GET' });
        } catch (err) {
            console.error('Failed to increment view:', err);
        }
        navigate('/blogs');
    };

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.cardHeader}>
                <div className={styles.authorLogo}>
                    <img src="/assets/eadvocate.webp" alt="e-Advocate Services" />
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

            {post.image && (
                <div className={styles.postThumbnail}>
                    <img src={post.image} alt={post.title} />
                </div>
            )}

            <div className={styles.cardFooter}>
                <button className={styles.actionBtn}>{post.category}</button>
                <button className={styles.readBtn} onClick={handleReadClick}>Read Article</button>
            </div>
        </motion.div>
    );
};

export default HomeBlogCard;
