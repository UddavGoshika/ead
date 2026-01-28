import React from 'react';
import styles from './BlogSection.module.css';
import HomeBlogCard from '../blog/HomeBlogCard';

const blogPosts = [
    {
        id: 1,
        title: "Upload Documents",
        description: "Before you can begin filing cases or verifying your identity, it is crucial to upload the necessary documents to the eFiling portal. This includes you...",
        author: "e-Advocate Services",
        authorInitials: "e",
        module: "Documentation Module",
        date: "March 2025",
        category: "Legal Awareness",
        image: ""
    },
    {
        id: 2,
        title: "Select Document File",
        description: "Once you are in the upload section, the next step is to locate and select the specific document files from your local device. The system features a us...",
        author: "e-Advocate Services",
        authorInitials: "e",
        module: "Upload Workflow",
        date: "March 2025",
        category: "Legal Awareness",
        image: ""
    },
    {
        id: 3,
        title: "Document Uploaded Successfully",
        description: "After the file transfer is complete, the system will display a confirmation message indicating that your documents have been uploaded successfully. Th...",
        author: "e-Advocate Services",
        authorInitials: "e",
        module: "Upload Status",
        date: "March 2025",
        category: "Legal Awareness",
        image: ""
    }
];

const BlogSection: React.FC = () => {
    return (
        <section id="blogs" className={styles.blogSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Legal Insights</h2>
                    <p className={styles.subtitle}>Stay updated with the latest news, success stories, and expert opinions from the legal world.</p>
                </div>

                <div className={styles.grid}>
                    {blogPosts.map(post => (
                        <HomeBlogCard key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
