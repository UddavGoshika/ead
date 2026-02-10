import React, { useState } from 'react';
import styles from './SafetyCenter.module.css'; // Reusing the dark/gold theme
import { ArrowLeft, MessageSquare, Mail, Phone, HelpCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface Props {
    backToHome?: () => void;
    showToast?: (msg: string) => void;
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            marginBottom: '10px',
            transition: 'all 0.2s',
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: '#e2e8f0',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left'
                }}
            >
                {question}
                {isOpen ? <ChevronUp size={20} color="#facc15" /> : <ChevronDown size={20} color="#94a3b8" />}
            </button>
            {isOpen && (
                <div style={{
                    padding: '0 20px 20px 20px',
                    color: '#94a3b8',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ paddingTop: '15px' }}>{answer}</div>
                </div>
            )}
        </div>
    );
};

const HelpSupport: React.FC<Props> = ({ backToHome, showToast }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        category: 'General Inquiry'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const api = (await import('../../../services/api')).default;

            await api.post('/contact', {
                name: user?.name || 'Dashboard User',
                email: user?.email || 'user@eadvocate.com',
                phone: user?.phone || 'N/A',
                userId: user?.id || (user as any)?._id,
                subject: formData.subject,
                category: formData.category,
                message: `[${formData.category}] ${formData.message}`,
                source: 'Dashboard Help & Support'
            });

            if (showToast) showToast('Ticket submitted successfully! Please wait 12-24 hours for our team to respond.');
            setFormData({ subject: '', message: '', category: 'General Inquiry' });
        } catch (error) {
            console.error('Submission error:', error);
            if (showToast) showToast('Failed to submit ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                {backToHome && (
                    <button onClick={backToHome} className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '5px' }}>Help & Support Center</h2>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>We are here to assist you 24/7. Find answers or contact us.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                {/* Left Column: Quick Actions & FAQs */}
                <div>
                    {/* Contact Channels Grid */}
                    {/* Contact Channels Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                        <a href="tel:+9118004567890" style={{ textDecoration: 'none' }}>
                            <div className={styles.card} style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
                                <div className={styles.iconBox}><Phone size={24} /></div>
                                <div>
                                    <h4 style={{ color: '#fff', margin: '0 0 5px 0' }}>Call Us</h4>
                                    <p style={{ fontSize: '12px', color: '#facc15' }}>+91 70937 04706

                                    </p>
                                </div>
                            </div>
                        </a>
                        <a href="mailto:help@eadvocate.in" style={{ textDecoration: 'none' }}>
                            <div className={styles.card} style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
                                <div className={styles.iconBox}><Mail size={24} /></div>
                                <div>
                                    <h4 style={{ color: '#fff', margin: '0 0 5px 0' }}>Email Us</h4>
                                    <p style={{ fontSize: '12px', color: '#facc15' }}>info.eadvocateservices@gmail.com
                                    </p>
                                </div>
                            </div>
                        </a>
                    </div>

                    <h3 style={{ color: '#facc15', margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <HelpCircle size={20} /> Frequently Asked Questions
                    </h3>

                    <FAQItem
                        question="How do I verify my profile?"
                        answer="To verify your profile, go to the Safety Center and click on 'Get Verified Now'. You will need to upload your Bar Council ID."
                    />
                    <FAQItem
                        question="Is my consultation data private?"
                        answer="Yes, absolutely. We use end-to-end encryption for all chats and calls. Your case details are never shared without your consent."
                    />
                    <FAQItem
                        question="How do credits work?"
                        answer="Credits allow you to access premium features like contacting top advocates. You can purchase credits from the Wallet section."
                    />
                    <FAQItem
                        question="What if I have a dispute with a client/advocate?"
                        answer="You can raise a dispute ticket through this form. Our legal compliance team will investigate and mediate the issue within 48 hours."
                    />
                </div>

                {/* Right Column: Contact Form */}
                <div>
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(250, 204, 21, 0.2)',
                        borderRadius: '20px',
                        padding: '30px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MessageSquare size={20} color="#facc15" /> Send us a Query
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        outline: 'none'
                                    }}
                                >
                                    <option>General Inquiry</option>
                                    <option>Technical Issue</option>
                                    <option>Billing & Refunds</option>
                                    <option>Report User</option>
                                    <option>Feature Request</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder="Brief summary of your issue"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Describe your issue in detail..."
                                    required
                                    rows={5}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    background: '#facc15',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '14px',
                                    fontWeight: '700',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    transition: 'transform 0.2s',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}
                            >
                                {isSubmitting ? 'Sending...' : <><Send size={18} /> Submit Ticket</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
