import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Upload, X, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import styles from './RejectionOverlay.module.css';

const RejectionOverlay: React.FC = () => {
    const { user, logout, refreshUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<Record<string, File | null>>({});
    const [success, setSuccess] = useState(false);

    if (!user || user.status !== 'Rejected') return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(files).forEach(([key, file]) => {
                if (file) formData.append(key, file);
            });

            const res = await axios.post(`${API_BASE_URL}/api/auth/resubmit-profile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.data.success) {
                setSuccess(true);
                refreshUser({ status: 'Reverify' });
                setTimeout(() => {
                    // Force a reload or logout to prevent further access? 
                    // User said: "he cant acess anything after he again sent for re approval"
                    // So we should probably logout or show a "Pending" screen.
                    logout();
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to resubmit profile:', error);
            alert('Failed to resubmit documents. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.modal}
            >
                {success ? (
                    <div className={styles.successContent}>
                        <CheckCircle size={64} className={styles.successIcon} />
                        <h2>Documents Resubmitted!</h2>
                        <p>Your profile has been sent for re-verification. You will be logged out now. Please wait for admin approval.</p>
                    </div>
                ) : (
                    <div className={styles.content}>
                        <div className={styles.header}>
                            <AlertTriangle size={32} className={styles.warningIcon} />
                            <h2>Account Verification Rejected</h2>
                        </div>

                        <div className={styles.reasonBox}>
                            <h3>Reason for Rejection:</h3>
                            <p>{user.rejectionReason || "Please re-upload your profile documents for verification."}</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <p className={styles.instruction}>Please upload the required documents to proceed:</p>

                            <div className={styles.uploadGrid}>
                                <div className={styles.uploadItem}>
                                    <label>ID Proof (Aadhar/PAN/etc.)</label>
                                    <div className={styles.fileInputWrapper}>
                                        <input type="file" onChange={(e) => handleFileChange(e, 'idProof')} id="idProof" />
                                        <label htmlFor="idProof" className={styles.fileLabel}>
                                            <Upload size={18} /> {files.idProof ? files.idProof.name : 'Choose File'}
                                        </label>
                                    </div>
                                </div>

                                {(user.role === 'advocate' || user.role === 'legal_provider') && (
                                    <>
                                        <div className={styles.uploadItem}>
                                            <label>Bar Council License</label>
                                            <div className={styles.fileInputWrapper}>
                                                <input type="file" onChange={(e) => handleFileChange(e, 'license')} id="license" />
                                                <label htmlFor="license" className={styles.fileLabel}>
                                                    <Upload size={18} /> {files.license ? files.license.name : 'Choose File'}
                                                </label>
                                            </div>
                                        </div>
                                        <div className={styles.uploadItem}>
                                            <label>Degree Certificate</label>
                                            <div className={styles.fileInputWrapper}>
                                                <input type="file" onChange={(e) => handleFileChange(e, 'certificate')} id="certificate" />
                                                <label htmlFor="certificate" className={styles.fileLabel}>
                                                    <Upload size={18} /> {files.certificate ? files.certificate.name : 'Choose File'}
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <button type="button" onClick={logout} className={styles.logoutBtn}>Logout</button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={isSubmitting || Object.keys(files).length === 0}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Resubmit for Verification'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default RejectionOverlay;
