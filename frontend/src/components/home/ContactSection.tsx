import React, { useState } from 'react';
import styles from './ContactSection.module.css';
import axios from 'axios';
import {
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Check,
    CheckCircle,
    AlertCircle,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ContactSection: React.FC = () => {
    const { openAuthModal } = useAuth();
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, formData);
            if (res.data.success) {
                showNotification(res.data.message || 'Message sent successfully!', 'success');
                setFormData({ name: '', email: '', phone: '', message: '' });
            }
        } catch (err: any) {
            console.error('Contact Form Error:', err);
            showNotification(err.response?.data?.error || 'Failed to send message. Please try again.', 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <section id="contact" className={styles.section}>
            <AnimatePresence>
                {notification && (
                    <motion.div
                        className={`${styles.notification} ${styles[notification.type]}`}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                        <p>{notification.message}</p>
                        <button onClick={() => setNotification(null)} className={styles.closeNotif}>
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.container}>
                {/* Left Column */}
                <div className={styles.leftColumn}>
                    <div className={styles.intro}>
                        <span className={styles.subtitle}>CONTACT E-ADVOCATE SERVICES</span>
                        <h2 className={styles.title}>
                            Let's Start a <span className={styles.highlight}>Meaningful</span> Conversation
                        </h2>
                        <p className={styles.description}>
                            Whether you're exploring our services, looking to partner, or interested in a franchise opportunity — our team is ready to assist you with clarity and commitment.
                        </p>
                    </div>

                    <div className={styles.contactGrid}>
                        <div className={styles.infoCard}>
                            <Phone className={styles.infoIcon} size={20} />
                            <div className={styles.infoContent}>
                                <h3>Phone</h3>
                                <p>+91 70937 04706</p>
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <Mail className={styles.infoIcon} size={20} />
                            <div className={styles.infoContent}>
                                <h3>Email</h3>
                                <p>tatitoprojects@gmail.com</p>
                                <p>support@tatitoprojects.com</p>
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <MapPin className={styles.infoIcon} size={20} />
                            <div className={styles.infoContent}>
                                <h3>Location</h3>
                                <p>Tirupati, Andhra Pradesh</p>
                                <p>517501, India</p>
                            </div>
                        </div>
                        <div className={styles.downloadSection}>
                            <h3>Download Our App</h3>
                            <div className={styles.appButtons}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className={styles.appBtn} />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className={styles.appBtn} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.regCard}>
                        <h3>Join e-Advocate — Free Registration</h3>
                        <p>Create your free e-Advocate profile and start connecting with clients through a secure, technology-enabled legal services platform.</p>
                        <div className={styles.bulletList}>
                            <div className={styles.bulletItem}>
                                <Check className={styles.checkIcon} size={16} />
                                <span>Free advocate profile listing</span>
                            </div>
                            <div className={styles.bulletItem}>
                                <Check className={styles.checkIcon} size={16} />
                                <span>Basic visibility to potential clients</span>
                            </div>
                            <div className={styles.bulletItem}>
                                <Check className={styles.checkIcon} size={16} />
                                <span>Receive client interest & inquiries</span>
                            </div>
                            <div className={styles.bulletItem}>
                                <Check className={styles.checkIcon} size={16} />
                                <span>Access to essential case-tracking tools</span>
                            </div>
                        </div>
                        <button className={styles.regBtn} onClick={() => openAuthModal('register')}>
                            Register For Free <ArrowRight size={18} />
                        </button>
                    </div>

                </div>

                {/* Right Column */}
                <div className={styles.rightColumn}>
                    <div className={styles.formHeader}>
                        <h2>Send Us a Message</h2>
                        <p>We typically respond within 24 hours.</p>
                    </div>

                    <form className={styles.formArea} onSubmit={handleSubmit}>
                        <div className={styles.formRow}>
                            {/* <input type="text" placeholder="Last Name" required /> */}
                        </div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Tell us how we can help you..."
                            rows={6}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                        ></textarea>
                        <button type="submit" className={styles.submitBtn} disabled={sending}>
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>

                    <div className={styles.officeHeader}>
                        <h3>Office Address</h3>
                        <div className={styles.mapContainer}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3877.54492212308!2d79.43331991115305!3d13.624583000169977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d4b085e6780cf%3A0x32b866f5776709de!2sTATITO%20PROJECTS!5e0!3m2!1sen!2sin!4v1769098927355!5m2!1sen!2sin"
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
