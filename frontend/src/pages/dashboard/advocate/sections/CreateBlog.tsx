import React, { useState } from 'react';
import styles from './CreateBlog.module.css';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { X, CheckCircle } from 'lucide-react';

interface CreateBlogProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateBlog: React.FC<CreateBlogProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) return alert("Please fill all fields");

        try {
            setLoading(true);
            const res = await axios.post('/api/blogs', {
                title,
                content,
                author: user?.id,
                authorName: user?.name,
                category
            });

            if (res.data.success) {
                setDone(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            }
        } catch (err) {
            alert("Error creating blog");
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className={styles.modalContent} style={{ textAlign: 'center', padding: '40px' }}>
                <CheckCircle size={60} color="#10b981" style={{ marginBottom: '20px' }} />
                <h2>Blog Submitted!</h2>
                <p>Your blog has been sent for admin approval.</p>
            </div>
        );
    }

    return (
        <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
                <h2>Write New Blog</h2>
                <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className={styles.blogForm}>
                <div className={styles.formGroup}>
                    <label>Blog Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Navigating Corporate Law in 2026"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="General">General</option>
                        <option value="Civil Law">Civil Law</option>
                        <option value="Criminal Law">Criminal Law</option>
                        <option value="Corporate Law">Corporate Law</option>
                        <option value="Technology">Technology</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your legal insights here..."
                        rows={8}
                    />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? "Submitting..." : "Submit for Approval"}
                </button>
            </form>
        </div>
    );
};

export default CreateBlog;
