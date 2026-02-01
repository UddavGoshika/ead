import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './BlogPage.module.css';
import BlogCard from '../components/blog/BlogCard';
import { Loader2 } from 'lucide-react';

const BlogPage: React.FC = () => {
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

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'https://eadvocate.onrender.com';
                console.log('Fetching blogs from:', apiUrl);

                const response = await fetch(`${apiUrl}/api/blogs`);
                const data = await response.json();

                if (data.success && Array.isArray(data.blogs)) {
                    console.log(`Loaded ${data.blogs.length} blogs.`);
                    setPosts(data.blogs);
                    setDisplayPosts(data.blogs);
                } else {
                    console.warn('Failed to load blogs or invalid format:', data);
                }
            } catch (err) {
                console.error('Error fetching blogs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // Effect for handling the "unlimited" scroll
    useEffect(() => {
        if (page > 1 && posts.length > 0) {
            setLoading(true);
            setTimeout(() => {
                // To make it truly "unlimited", we append the posts again 
                // in a loop if we reach the end.
                setDisplayPosts(prev => [...prev, ...posts]);
                setLoading(false);
            }, 800);
        }
    }, [page, posts]);

    return (
        <div className={styles.blogPage}>
            {/* Redesigned Hero Section */}
            <section className={styles.hero}>
                <div className={styles.container}>
                    <h1 className={styles.heroTitle}>Blogs</h1>
                    <p className={styles.heroSubtitle}>Insights, updates & success stories from advocates & legal experts</p>
                </div>
            </section>

            {/* Content Section */}
            <section className={styles.content}>
                <div className={styles.container}>
                    <div className={styles.blogList}>
                        {displayPosts.map((post, index) => {
                            const isLast = displayPosts.length === index + 1;
                            const cardProps = {
                                id: post._id,
                                title: post.title,
                                description: post.content,
                                author: post.authorName,
                                authorInitials: post.authorName.charAt(0).toUpperCase(),
                                module: post.category,
                                date: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                                category: "Legal Insight",
                                image: post.image,
                                likes: post.likes,
                                saves: post.saves,
                                views: post.views,
                                shares: post.shares,
                                comments: post.comments
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
                            <span>Discovering more legal insights...</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default BlogPage;
