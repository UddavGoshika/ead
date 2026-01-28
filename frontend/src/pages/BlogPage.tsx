import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './BlogPage.module.css';
import BlogCard from '../components/blog/BlogCard';
import { Loader2 } from 'lucide-react';

const INITIAL_POSTS = [
    {
        id: 1,
        title: "Upload Documents",
        description: "Before you can begin filing cases or verifying your identity, it is crucial to upload the necessary documents to the eFiling portal. This includes your Bar Registration Certificate, a valid Photo ID proof, and your current Address Proof. The system requires these files to be in specific formats such as PDF or JPEG to ensure smooth processing.",
        author: "e-Advocate Services",
        authorInitials: "e",
        module: "Documentation Module",
        date: "March 2025",
        category: "Case Study",
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        title: "Digital Courts: The Future of Law",
        description: "The digital transformation of the Indian judiciary is moving rapidly. With the implementation of Phase 3 of the e-Courts project, virtual hearings and online case management are becoming the norm. This article explores the benefits and challenges of this transition for practitioners.",
        author: "Justice Tech Team",
        authorInitials: "JT",
        module: "Judiciary Tech",
        date: "Feb 2025",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3,
        title: "Winning Complex Property Disputes",
        description: "Navigating real estate law in India requires a deep understanding of RERA and the Transfer of Property Act. In this detailed case study, we examine how a decade-long dispute was settled in just six months using online mediation and digitized evidence submission.",
        author: "Adv. Rahul S.",
        authorInitials: "RS",
        module: "Property Law",
        date: "Jan 2025",
        category: "Legal Insights",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"
    }
];

const BlogPage: React.FC = () => {
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMorePosts();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const loadMorePosts = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const nextBatch = INITIAL_POSTS.map(p => ({
                ...p,
                id: p.id + posts.length // Unique IDs
            }));
            setPosts(prev => [...prev, ...nextBatch]);
            setLoading(false);

            // Limit to some pages for simulation
            if (posts.length > 20) setHasMore(false);
        }, 1500);
    };

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
                        {posts.map((post, index) => {
                            if (posts.length === index + 1) {
                                return (
                                    <div ref={lastPostElementRef} key={post.id}>
                                        <BlogCard post={post} />
                                    </div>
                                );
                            } else {
                                return <BlogCard key={post.id} post={post} />;
                            }
                        })}
                    </div>

                    {loading && (
                        <div className={styles.loader}>
                            <Loader2 className={styles.spinner} size={40} />
                            <span>Loading more legal insights...</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default BlogPage;
