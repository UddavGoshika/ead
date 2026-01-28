import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BlogCard.module.css';

interface BlogCardProps {
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

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 10);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
    };

    const handleShare = () => {
        const url = window.location.href + `/post/${post.id}`;
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.container}>
                <div className={styles.leftContent}>
                    {/* Author Info */}
                    <div className={styles.authorBar}>
                        <div className={styles.authorInfo}>
                            <div className={styles.avatar}>{post.authorInitials}</div>
                            <div className={styles.authorText}>
                                <span className={styles.authorName}>{post.author}</span>
                                <span className={styles.metaText}>{post.module} • {post.date}</span>
                            </div>
                        </div>
                        <div className={styles.topActions}>
                            <button
                                className={`${styles.iconBtn} ${isSaved ? styles.saved : ''}`}
                                onClick={handleSave}
                            >
                                <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                            </button>
                            <span className={styles.categoryBadge}>{post.category}</span>
                        </div>
                    </div>

                    {/* Blog Title & Description */}
                    <div className={styles.mainContent}>
                        <h2 className={styles.title}>{post.title}</h2>
                        <p className={styles.description}>{post.description}</p>
                    </div>

                    {/* Interaction Bar */}
                    <div className={styles.interactionBar}>
                        <div className={styles.leftActions}>
                            <button
                                className={`${styles.interactionBtn} ${isLiked ? styles.liked : ''}`}
                                onClick={handleLike}
                            >
                                <div className={styles.roundIcon}>
                                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                </div>
                                <span className={styles.count}>{likeCount}</span>
                            </button>
                            <button
                                className={`${styles.interactionBtn} ${showComments ? styles.active : ''}`}
                                onClick={() => setShowComments(!showComments)}
                            >
                                <div className={styles.roundIcon}>
                                    <MessageCircle size={18} />
                                </div>
                            </button>
                        </div>
                        <button className={styles.shareBtn} onClick={handleShare}>
                            <Share2 size={20} />➦
                        </button>
                    </div>
                </div>

                {/* Side Image */}
                <div className={styles.imageWrapper}>
                    <img src={post.image} alt={post.title} className={styles.image} />
                </div>
            </div>

            {/* Comment Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        className={styles.commentSection}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <div className={styles.commentInputWrapper}>
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className={styles.commentInput}
                            />
                            <button className={styles.postCommentBtn} disabled={!commentText.trim()}>
                                Post
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BlogCard;
