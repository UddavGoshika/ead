/// <reference types="vite/client" />
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../../BlogPage.module.css';
import BlogCard from '../../../components/blog/BlogCard';
import { Loader2 } from 'lucide-react';

const BlogFeed: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [displayPosts, setDisplayPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const observer = useRef<IntersectionObserver | null>(null);

    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading]);

    // Fetch initial blogs
    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                // Use a standard URL or env variable
                const apiUrl = import.meta.env.VITE_API_URL || 'https://eadvocate.onrender.com';
                const response = await fetch(`${apiUrl}/api/blogs`);
                const data = await response.json();

                if (data.success && Array.isArray(data.blogs)) {
                    setPosts(data.blogs);
                    setDisplayPosts(data.blogs);
                } else {
                    console.warn('Failed to load blogs for feed');
                }
            } catch (err) {
                console.error('Error fetching blogs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    // Infinite scroll logic - Loop existing posts for "unlimited" effect
    useEffect(() => {
        if (page > 1 && posts.length > 0) {
            setLoading(true);
            // Artificial delay for premium feel
            setTimeout(() => {
                setDisplayPosts(prev => [...prev, ...posts]);
                setLoading(false);
            }, 800);
        }
    }, [page, posts]);

    return (
        <div className={styles.blogPage} style={{
            minHeight: 'auto',
            marginTop: '-60px',
            marginLeft: '-30px',
            marginRight: '-30px',
            width: 'calc(100% + 60px)',
            borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
            {/* Standard Hero Section - Exact Format */}
            <section className={styles.hero} style={{ marginTop: '0', padding: '100px 20px 60px' }}>
                <div className={styles.container} style={{ maxWidth: '1400px' }}>
                    <h1 className={styles.heroTitle} style={{ fontSize: 'clamp(3rem, 5vw, 5rem)' }}>E-Advocate Blogs</h1>
                    <p className={styles.heroSubtitle}>Insights, updates & success stories from advocates & legal experts</p>
                </div>
            </section>

            {/* Content Section - Widened for Dashboard */}
            <section className={styles.content}>
                <div className={styles.container} style={{ maxWidth: '1400px', padding: '0 40px' }}>
                    <div className={styles.blogList} style={{ gap: '40px' }}>
                        {displayPosts.map((post, index) => {
                            const isLast = displayPosts.length === index + 1;
                            const cardProps = {
                                id: post._id,
                                title: post.title,
                                description: post.content,
                                author: post.authorName || 'e-Advocate Services',
                                authorInitials: post.authorName ? post.authorName.charAt(0).toUpperCase() : 'E',
                                module: post.category,
                                date: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                                category: post.category || "Legal Insight",
                                image: post.image,
                                likes: post.likes || 0,
                                saves: post.saves || 0,
                                views: post.views || 0,
                                shares: post.shares || 0,
                                comments: post.comments || []
                            };

                            if (isLast) {
                                return (
                                    <div ref={lastPostElementRef} key={`${post._id}-${index}`}>
                                        <BlogCard post={cardProps} />
                                    </div>
                                );
                            }
                            return <BlogCard key={`${post._id}-${index}`} post={cardProps} />;
                        })}
                    </div>

                    {loading && (
                        <div className={styles.loader}>
                            <Loader2 className={styles.spinner} size={40} />
                            <span>Synchronizing latest insights...</span>
                        </div>
                    )}

                    {posts.length === 0 && !loading && (
                        <div className={styles.loader}>
                            <h3>The legal library is currently being updated.</h3>
                            <p>Check back shortly for fresh content.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default BlogFeed;
