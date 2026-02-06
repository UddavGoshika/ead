import React, { useEffect, useState } from 'react';
import styles from './BlogSection.module.css';
import HomeBlogCard from '../blog/HomeBlogCard';
import { blogService } from '../../services/api';

const BlogSection: React.FC = () => {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            console.log('Fetching blogs...');
            try {
                const response = await blogService.getBlogs();
                const data = response.data;
                console.log('Blog data received:', data);

                if (data.success && Array.isArray(data.blogs)) {
                    setBlogs(data.blogs.slice(0, 3));
                } else {
                    console.warn('Blog data format incorrect or success false:', data);
                }
            } catch (err) {
                console.error('Error fetching blogs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) {
        return (
            <section id="blogs" className={styles.blogSection}>
                <div className={styles.container}>
                    <div className={styles.header} style={{ opacity: 0.5 }}>
                        <h2 className={styles.title}>Blog Insights</h2>
                        <p>Loading updates...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="blogs" className={styles.blogSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Blog Insights</h2>
                    <p className={styles.subtitle}>Stay updated with the latest news, success stories, and expert opinions from the  world.</p>
                </div>

                <div className={styles.grid}>
                    {blogs.map(post => (
                        <HomeBlogCard key={post._id} post={{
                            id: post._id,
                            title: post.title,
                            description: post.content.substring(0, 150) + '...',
                            author: post.authorName,
                            authorInitials: post.authorName.charAt(0).toUpperCase(),
                            module: post.category,
                            date: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                            category: "Legal Insight",
                            image: post.image
                        }} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
