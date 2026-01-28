import React, { useState, useEffect } from 'react';
import { ArrowLeft, Construction, Loader2, Send } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { advocateService } from '../../../../services/api';
import type { Advocate } from '../../../../types';
import AdvocateCard from '../../../../components/dashboard/AdvocateCard';
import { interactionService } from '../../../../services/interactionService';
import styles from '../AdvocateList.module.css';

interface Props {
    title: string;
    backToHome?: () => void;
}

const PlaceholderPage: React.FC<Props> = ({ title, backToHome }) => {
    return (
        <div style={{ padding: '40px', color: 'white' }}>
            {backToHome && (
                <button onClick={backToHome} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', textAlign: 'center' }}>
                <Construction size={64} style={{ color: '#eab308', marginBottom: '20px' }} />
                <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{title}</h1>
                <p style={{ color: '#94a3b8', fontSize: '18px' }}>We are working hard to bring this feature to you soon!</p>
            </div>
        </div>
    );
};

export default PlaceholderPage;

// Export specialized placeholders
export const NormalProfiles = ({ showDetailedProfile, showToast, showsidePage, onSelectForChat }: any) => {
    const { user } = useAuth();
    const [advocates, setAdvocates] = useState<Advocate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdvocates = async () => {
            try {
                const response = await advocateService.getAdvocates();
                setAdvocates(response.data.advocates || []);
            } catch (err) {
                console.error(err);
                showToast('Failed to load advocates');
            } finally {
                setLoading(false);
            }
        };
        fetchAdvocates();
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.headerSection}>
                <button className={styles.backLink} onClick={() => showsidePage('featured-profiles')}>
                    <ArrowLeft size={18} />
                    <span>Switch to Featured Profiles</span>
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={40} color="#3b82f6" />
                </div>
            ) : (
                <div className={styles.grid}>
                    {advocates.map((adv: Advocate) => (
                        <div key={adv.id} onClick={() => showDetailedProfile(adv.unique_id)} style={{ cursor: 'pointer' }}>
                            <AdvocateCard
                                advocate={adv}
                                variant="normal"
                                isPremium={user?.isPremium}
                                onAction={async (action: string, data?: string) => {
                                    if (user) {
                                        const targetId = String(adv.id);
                                        const userId = String(user.id);
                                        const targetRole = 'advocate';

                                        if (action === 'interest_initiated' || action === 'interest') {
                                            await interactionService.recordActivity(targetRole, targetId, 'interest', userId);
                                            showToast(`Interest sent to ${adv.name}`);
                                        } else if (action === 'super_interest_sent' || action === 'super-interest') {
                                            await interactionService.recordActivity(targetRole, targetId, 'superInterest', userId);
                                            showToast(`Super Interest sent to ${adv.name}!`);
                                        } else if (action === 'shortlisted') {
                                            await interactionService.recordActivity(targetRole, targetId, 'shortlist', userId);
                                            showToast(`${adv.name} added to shortlist`);
                                        } else if (action === 'openFullChatPage') {
                                            await interactionService.recordActivity(targetRole, targetId, 'chat', userId);
                                            onSelectForChat(adv);
                                        } else if (action === 'message_sent' && data) {
                                            await interactionService.sendMessage(userId, targetId, data);
                                            showToast(`Message sent to ${adv.name}`);
                                        } else {
                                            showToast(`Advocate ${adv.name}: ${action}`);
                                        }
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Upgrade = (props: any) => <PlaceholderPage title="Upgrade Account" backToHome={props.backToHome} />;
export const Credits = (props: any) => <PlaceholderPage title="Credits & Billing" backToHome={props.backToHome} />;
export const HelpSupport = (props: any) => <PlaceholderPage title="Help & Support" backToHome={props.backToHome} />;

// BLOGS SECTION WITH POST FEATURE
export const Blogs = () => {
    const [blogText, setBlogText] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handlePost = () => {
        if (!blogText.trim()) return;
        setIsPosting(true);
        // Mock post
        setTimeout(() => {
            setBlogText('');
            setIsPosting(false);
            alert('Blog posted successfully!');
        }, 1500);
    };

    return (
        <div style={{ padding: '30px', color: 'white' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '25px', color: '#facc15' }}>Legal Blogs</h1>

            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '25px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '40px'
            }}>
                <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Create New Post</h3>
                <textarea
                    value={blogText}
                    onChange={(e) => setBlogText(e.target.value)}
                    placeholder="Share your legal expertise or latest updates..."
                    style={{
                        width: '100%',
                        height: '120px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '15px',
                        color: 'white',
                        fontSize: '16px',
                        resize: 'none',
                        marginBottom: '15px',
                        outline: 'none'
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handlePost}
                        disabled={isPosting || !blogText.trim()}
                        style={{
                            background: '#facc15',
                            color: '#000',
                            border: 'none',
                            padding: '10px 25px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: blogText.trim() ? 'pointer' : 'not-allowed',
                            opacity: isPosting ? 0.7 : 1,
                            transition: 'all 0.3s'
                        }}
                    >
                        {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        {isPosting ? 'Posting...' : 'Post Blog'}
                    </button>
                </div>
            </div>

            <div style={{ opacity: 0.6 }}>
                <PlaceholderPage title="Archived Blogs" />
            </div>
        </div>
    );
};

