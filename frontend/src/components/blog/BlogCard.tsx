import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Link2, X } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import styles from './BlogCard.module.css';
import { blogService } from '../../services/api';

interface BlogCardProps {
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
        likes?: string[];
        saves?: string[];
        views?: number;
        shares?: number;
        comments?: any[];
    };
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    const { user, openAuthModal, isLoggedIn } = useAuth();

    // Correction Logic
    const displayAuthor = post.author.includes('Health Plus') ? 'e-Advocate Services' : post.author;
    const displayDate = post.date === 'Invalid Date' ? 'Recently Updated' : post.date;
    const [imgSrc, setImgSrc] = useState(post.image);

    const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.id as string) || false);
    const [isSaved, setIsSaved] = useState(post.saves?.includes(user?.id as string) || false);
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [shareCount, setShareCount] = useState(post.shares || 0);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState<any[]>(post.comments || []);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const handleLike = async () => {
        if (!isLoggedIn) {
            openAuthModal('login');
            return;
        }
        try {
            const res = await blogService.likeBlog(post.id, user?.id as string);
            if (res.data.success) {
                setIsLiked(res.data.isLiked);
                setLikeCount(res.data.likes);
            }
        } catch (err) {
            console.error('Like failed:', err);
        }
    };

    const handleSave = async () => {
        if (!isLoggedIn) {
            openAuthModal('login');
            return;
        }
        try {
            const res = await blogService.saveBlog(post.id, user?.id as string);
            if (res.data.success) {
                setIsSaved(res.data.isSaved);
            }
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const handleShareInit = async () => {
        setShowShareMenu(!showShareMenu);
    };

    const handleShareOptionClick = async (platform: string) => {
        try {
            const res = await blogService.shareBlog(post.id);
            if (res.data.success) {
                setShareCount(res.data.shares);
                const url = window.location.origin + `/blogs?id=${post.id}`;
                const text = `Check out this blog: ${post.title}`;

                if (platform === 'whatsapp') {
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                } else if (platform === 'facebook') {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                } else if (platform === 'linkedin') {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                } else if (platform === 'copy') {
                    navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                }
                setShowShareMenu(false);
            }
        } catch (err: any) {
            console.error('Share failed:', err);
        }
    };

    const handlePostComment = async () => {
        if (!isLoggedIn) {
            openAuthModal('login');
            return;
        }
        if (!commentText.trim()) return;

        try {
            const res = await blogService.commentBlog(post.id, {
                userId: user?.id as string,
                userName: user?.name as string,
                text: commentText
            });
            if (res.data.success) {
                setLocalComments(res.data.comments);
                setCommentText('');
            }
        } catch (err) {
            console.error('Comment failed:', err);
        }
    };

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            {shareCount > 0 && (
                <div className={styles.topShareBadge}>
                    <Share2 size={12} />
                    <span>{shareCount} Shares</span>
                </div>
            )}
            <div className={styles.container}>
                <div className={styles.leftContent}>
                    {/* Author Info */}
                    <div className={styles.authorBar}>
                        <div className={styles.authorInfo}>
                            <div className={styles.avatar}>
                                <img src="/assets/eadvocate.webp" alt="e-Advocate logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div className={styles.authorText}>
                                <span className={styles.authorName}>{displayAuthor}</span>
                                <span className={styles.metaText}>{post.module} • {displayDate}</span>
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
                                <span className={styles.count}>{localComments.length}</span>
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button className={styles.shareBtn} onClick={handleShareInit}>
                                {showShareMenu ? <X size={24} /> : <Share2 size={28} />}
                            </button>
                            {showShareMenu && (
                                <div className={styles.shareMenu}>
                                    <div className={`${styles.shareOption} ${styles.whatsapp}`} onClick={() => handleShareOptionClick('whatsapp')}>
                                        <FaWhatsapp size={24} />
                                    </div>
                                    <div className={`${styles.shareOption} ${styles.facebook}`} onClick={() => handleShareOptionClick('facebook')}>
                                        <FaFacebook size={24} />
                                    </div>
                                    <div className={`${styles.shareOption} ${styles.linkedin}`} onClick={() => handleShareOptionClick('linkedin')}>
                                        <FaLinkedin size={24} />
                                    </div>
                                    <div className={`${styles.shareOption} ${styles.copyLink}`} onClick={() => handleShareOptionClick('copy')}>
                                        <Link2 size={24} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Image */}
                <div className={styles.imageWrapper}>
                    <img
                        src={imgSrc}
                        alt={post.title}
                        className={styles.image}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            setImgSrc('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800');
                        }}
                    />
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
                        <div className={styles.previousComments}>
                            {localComments.map((c, i) => (
                                <div key={i} className={styles.commentItem}>
                                    <span className={styles.commentUser}>{c.userName}:</span>
                                    <span className={styles.commentText}>{c.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.commentInputWrapper}>
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className={styles.commentInput}
                                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                            />
                            <button
                                className={styles.postCommentBtn}
                                onClick={handlePostComment}
                                disabled={!commentText.trim()}
                            >
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
