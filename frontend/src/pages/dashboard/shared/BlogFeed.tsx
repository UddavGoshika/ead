/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import BlogCard from '../../../components/blog/BlogCard';
import { Loader2 } from 'lucide-react';

const BlogFeed: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/blogs`);
                const data = await response.json();
                if (data.success) {
                    setPosts(data.blogs);
                }
            } catch (err) {
                console.error('Error fetching blogs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [apiUrl]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
            {posts.map((post) => (
                <BlogCard
                    key={post._id}
                    post={{
                        id: post._id,
                        title: post.title,
                        description: post.content,
                        author: post.authorName,
                        authorInitials: post.authorName?.charAt(0).toUpperCase() || 'A',
                        module: post.category,
                        date: new Date(post.createdAt).toLocaleDateString(),
                        category: post.category || 'Legal',
                        image: post.image,
                        likes: post.likes,
                        saves: post.saves,
                        views: post.views,
                        shares: post.shares,
                        comments: post.comments
                    }}
                />
            ))}
            {posts.length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
                    No blog posts found.
                </div>
            )}
        </div>
    );
};

export default BlogFeed;
