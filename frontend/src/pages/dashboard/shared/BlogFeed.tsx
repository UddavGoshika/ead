import React from 'react';
import BlogCard from '../../../components/blog/BlogCard';

const dummyPosts = [
    {
        id: 1,
        title: "Ethical Boundaries for Advocates",
        description: "Understanding Bar Council of India guidelines when engaging with clients online. This guide covers the essential do's and don'ts for modern legal practice.",
        author: "Adv. R. Sharma",
        authorInitials: "RS",
        module: "Ethics",
        date: "March 2025",
        category: "Legal Ethics",
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        title: "Digital Transformation of Indian Judiciary",
        description: "How e-courts and digital filing are changing the landscape of legal practice. Explore the latest technological advancements in the court system.",
        author: "Adv. S. Verma",
        authorInitials: "SV",
        module: "Tech",
        date: "Feb 2025",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3,
        title: "Property Rights in Digital Assets",
        description: "Navigating the complex world of NFTs and digital property. Learn how traditional legal frameworks are adapting to the blockchain era.",
        author: "Adv. M. Iyer",
        authorInitials: "MI",
        module: "Digital",
        date: "Jan 2025",
        category: "IP Law",
        image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 4,
        title: "Cyber Laws in India 2025",
        description: "Exploring the latest updates in Information Technology Act and data protection regulations.",
        author: "Adv. A. Gupta",
        authorInitials: "AG",
        module: "Law",
        date: "Jan 2025",
        category: "Cyber Law",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 5,
        title: "Commercial Arbitration Trends",
        description: "New developments in domestic and international arbitration procedures in India.",
        author: "Adv. K. Menon",
        authorInitials: "KM",
        module: "Ethics",
        date: "Dec 2024",
        category: "Arbitration",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
    }
];

const BlogFeed: React.FC = () => {
    return (
        <div style={{ padding: '20px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {dummyPosts.map(post => (
                    <BlogCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default BlogFeed;
