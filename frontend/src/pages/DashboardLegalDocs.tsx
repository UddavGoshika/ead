import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './DashboardLegalDocs.module.css';
import {
    FileText, ClipboardCheck, Scale, ScrollText, CheckCircle2, Zap, Bookmark, MessageCircle,
    ArrowRight, Home, MapPin, Search, Handshake, Filter, Briefcase, Award, Star, Clock, Info, ChevronDown, Shield, Lock, X, Mail, Activity as ActivityIcon, Phone, Send, Inbox, CreditCard, Video, Paperclip, Sparkles, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { interactionService } from '../services/interactionService';
import api, { advocateService, clientService } from '../services/api';
import { LOCATION_DATA_RAW } from '../components/layout/statesdis';
import { formatImageUrl } from '../utils/imageHelper';
import type { Advocate } from '../types';
import { useCall } from '../context/CallContext';

// --- Types ---

interface Provider {
    id: string;
    adv_id: string;
    license_id: string;
    name: string;
    age: number;
    image_url?: string;
    location: string;
    specialization: string;
    experience: string;
    rating: number;
    reviews: number;
    hourly_rate: string;
    isPremium: boolean;
    isVerified: boolean;
    specializations?: string[];
}

interface ServiceDetail {
    id: string;
    title: string;
    description: string;
    howItWorks: string[];
    howToUse: string[];
    categories: string[];
    types: string[];
    subtypes: string[];
}

// --- Mock Data ---

const documentationServices = [
    {
        id: 'agreements',
        title: 'Agreements Drafting',
        description:
            'Legally sound and customized agreements drafted in accordance with Indian Contract Act, 1872 and Bar Council of India (BCI) standards.',
        price: '₹2,500 onwards',
        icon: <FileText size={32} />,
        idealFor: [
            'Businesses',
            'Startups',
            'Professionals',
            'Property Owners',
            'Investors',
        ],
        features: [
            'Clear definition of rights and obligations',
            'Risk mitigation clauses',
            'Industry-specific drafting',
            'Legally enforceable structure',
        ],
        deliverables: [
            'Editable Word & PDF formats',
            'Legally structured clauses',
            'Execution-ready document',
        ],
        timeline: '2–7 working days',
        revisions: 'Up to 2 free revisions',
        compliance: [
            'Indian Contract Act, 1872',
            'BCI Professional Standards',
            'Applicable State & Central Laws',
        ],
        howItWorks: [
            'Requirement analysis',
            'Clause identification',
            'Drafting',
            'Client review',
            'Final delivery',
        ],
        serviceOptions: [
            // Commercial & Business
            'Agency Agreement',
            'Arbitration Agreement',
            'Business Transfer Agreement',
            'Consultancy Agreement',
            'Co-founder Agreement',
            'Distribution Agreement',
            'Development Agreement',
            'Exclusivity Agreement',
            'Franchise Agreement',
            'Independent Contractor Agreement',
            'Joint Venture Agreement',
            'Partnership Deed',
            'Shareholders Agreement',
            'Supply Agreement',
            'Vendor Agreement',
            'Retainer Agreement',
            'Service Level Agreement (SLA)',

            // Employment & HR
            'Employment Agreement',
            'Non-Compete Agreement',
            'Confidentiality Agreement',
            'Non-Disclosure Agreement (NDA)',

            // Property & Real Estate
            'Builder–Buyer Agreement',
            'Lease Agreement (Residential)',
            'Lease Agreement (Commercial)',
            'Rental Agreement',
            'Purchase Agreement',
            'Gift Deed (Agreement Format)',

            // IP & Technology
            'Intellectual Property Assignment Agreement',
            'Licensing Agreement',
            'Technology Transfer Agreement',
            'Trademark Licensing Agreement',

            // Strategic & General
            'Memorandum of Understanding (MoU)',
            'Settlement Agreement',
            'Indemnity Agreement',
            'Guarantee Agreement',
        ],
    },

    {
        id: 'affidavits',
        title: 'Affidavits',
        description:
            'Drafting of legally valid affidavits in prescribed formats for courts, government authorities, and official use.',
        price: '₹1,500 onwards',
        icon: <ClipboardCheck size={32} />,
        idealFor: [
            'Individuals',
            'Court Proceedings',
            'Government Applications',
            'Banks & Institutions',
        ],
        features: [
            'Legally prescribed format',
            'Verification clauses',
            'Notary / oath-ready',
        ],
        deliverables: [
            'Affidavit draft',
            'Stamp paper guidance',
            'Execution instructions',
        ],
        timeline: '1–3 working days',
        revisions: '1 free revision',
        compliance: [
            'Civil Procedure Code',
            'Indian Evidence Act',
            'State-specific affidavit rules',
        ],
        howItWorks: [
            'Purpose identification',
            'Fact collection',
            'Drafting',
            'Client confirmation',
            'Final delivery',
        ],
        serviceOptions: [
            'Address Proof Affidavit',
            'Age Proof Affidavit',
            'Birth Certificate Correction Affidavit',
            'Change of Name Affidavit',
            'Character Certificate Affidavit',
            'Date of Birth Correction Affidavit',
            'Education / Qualification Affidavit',
            'Financial Status Affidavit',
            'Heirship Affidavit',
            'Income Affidavit',
            'Loss of Documents Affidavit',
            'Marriage Affidavit',
            'Nationality Affidavit',
            'Ownership Declaration Affidavit',
            'Passport Related Affidavit',
            'Relationship Proof Affidavit',
            'Single Status Affidavit',
            'Service Record Affidavit',
            'Vehicle Ownership Affidavit',
            'Court Proceedings Affidavit',
            'Government Submission Affidavit',
            'Bank / Financial Institution Affidavit',
        ],
    },

    {
        id: 'notices',
        title: 'Legal Notices',
        description:
            'Drafting of formal legal notices to assert legal rights, demand compliance, or respond to disputes.',
        price: '₹3,000 onwards',
        icon: <Scale size={32} />,
        idealFor: [
            'Individuals',
            'Businesses',
            'Employers',
            'Landlords',
            'Consumers',
        ],
        features: [
            'Clear statement of facts',
            'Legal grounds cited',
            'Professional legal language',
        ],
        deliverables: [
            'Legally drafted notice',
            'Ready-to-send format',
        ],
        timeline: '1–2 working days',
        revisions: '1 free revision',
        compliance: [
            'CPC / CrPC',
            'Consumer Protection Act',
            'Contract Laws',
        ],
        howItWorks: [
            'Fact review',
            'Legal analysis',
            'Drafting',
            'Client approval',
            'Final delivery',
        ],
        serviceOptions: [
            'Breach of Contract Notice',
            'Consumer Complaint Notice',
            'Divorce Legal Notice',
            'Eviction Notice',
            'Fraud & Misrepresentation Notice',
            'Loan Recovery Notice',
            'Money Recovery Notice',
            'Property Dispute Notice',
            'Rent Arrears Notice',
            'Service Deficiency Notice',
            'Termination of Contract Notice',
            'Workplace Harassment Representation',
            'Cheque Bounce Notice (NI Act)',
            'Reply to Legal Notice',
            'Cease and Desist Notice',
        ],
    },

    {
        id: 'legal-docs',
        title: 'Legal Document Preparation',
        description:
            'Preparation of specialized legal documents for personal, business, statutory, and regulatory purposes.',
        price: '₹3,000 onwards',
        icon: <ScrollText size={32} />,
        idealFor: [
            'Families',
            'Business Owners',
            'Trusts',
            'Property Holders',
        ],
        features: [
            'Statutory compliance',
            'Execution-ready format',
            'Clear legal structuring',
        ],
        deliverables: [
            'Customized legal document',
            'Stamp & registration guidance',
        ],
        timeline: '3–7 working days',
        revisions: 'Up to 2 free revisions',
        compliance: [
            'Indian Succession Act',
            'Registration Act, 1908',
            'State Stamp Laws',
        ],
        howItWorks: [
            'Requirement assessment',
            'Document structuring',
            'Drafting',
            'Client review',
            'Final delivery',
        ],
        serviceOptions: [
            'Will Drafting',
            'Codicil to Will',
            'Power of Attorney (General)',
            'Power of Attorney (Special)',
            'Gift Deed',
            'Trust Deed',
            'Lease Deed',
            'Rental Agreement',
            'Indemnity Bond',
            'Declaration & Undertaking',
            'Authorization Letter',
            'Property Declarations',
            'Statutory Forms & Applications',
            'Government Representations',
            'Regulatory Filings',
        ],
    },
];


const serviceDetails: Record<string, ServiceDetail> = {
    agreements: {
        id: 'agreements',
        title: 'Professional Agreement Drafting',
        description: 'Legally binding agreements drafted by expert advocates with years of experience in corporate and civil law.',
        howItWorks: [
            'Select your specific agreement category',
            'Connect with a certified legal expert',
            'Provide necessary details and parties involved',
            'Review draft and finalize with signatures'
        ],
        howToUse: [
            'Browse specialized agreement providers',
            'Filter by your location and category',
            'Book a service directly through the profile',
            'Receive digital and physical copies as needed'
        ],
        categories: [
            'Agency Agreement', 'Arbitration Agreement', 'Business Transfer Agreement', 'Builder–Buyer Agreement',
            'Consultancy Agreement', 'Confidentiality / NDA', 'Co-founder Agreement', 'Distribution Agreement',
            'Development Agreement', 'Employment Agreement', 'Exclusivity Agreement', 'Franchise Agreement',
            'Gift Deed (Agreement Format)', 'Independent Contractor Agreement', 'Intellectual Property Assignment Agreement',
            'Joint Venture Agreement', 'Lease Agreement (Residential / Commercial)', 'Licensing Agreement',
            'Memorandum of Understanding (MoU)', 'Non-Compete Agreement', 'Non-Disclosure Agreement (NDA)',
            'Partnership Deed', 'Purchase Agreement', 'Rental Agreement', 'Retainer Agreement',
            'Service Level Agreement (SLA)', 'Shareholders Agreement', 'Supply Agreement',
            'Technology Transfer Agreement', 'Trademark Licensing Agreement', 'Vendor Agreement'
        ],
        types: ['Standard', 'Urgent', 'Bilingual', 'International'],
        subtypes: ['Individual', 'Corporate', 'Government']
    },
    affidavits: {
        id: 'affidavits',
        title: 'Legal Affidavit Preparation',
        description: 'Secure and verified affidavits for all official purposes, issued by authorized legal personnel.',
        howItWorks: [
            'Fill out the mandatory legal declaration form',
            'Expert review of statement facts',
            'Notarization and stamp duty processing',
            'Instant digital delivery of completed document'
        ],
        howToUse: [
            'Select the type of affidavit needed (Identity, address, etc)',
            'Provide personal identification documents',
            'Pay fee and get it verified by our lawyers',
            'Download and use for your official requirement'
        ],
        categories: [
            'Address Proof Affidavit', 'Age Proof Affidavit', 'Birth Certificate Correction Affidavit',
            'Change of Name Affidavit', 'Character Certificate Affidavit', 'Date of Birth Correction Affidavit',
            'Education / Qualification Affidavit', 'Financial Status Affidavit', 'Heirship Affidavit',
            'Income Affidavit', 'Loss of Documents Affidavit', 'Marriage Affidavit', 'Nationality Affidavit',
            'Ownership Declaration Affidavit', 'Passport Related Affidavit', 'Relationship Proof Affidavit',
            'Single Status Affidavit', 'Service Record Affidavit', 'Vehicle Ownership Affidavit'
        ],
        types: ['General', 'Specific', 'Oath'],
        subtypes: ['Standard Form', 'Custom Statement']
    },
    notices: {
        id: 'notices',
        title: 'Formal Legal Notices',
        description: 'Protect your legal rights by sending high-impact, professional legal notices to opposing parties.',
        howItWorks: [
            'Initial consultation on the nature of dispute',
            'Drafting the legal notice with precise legal terms',
            'Service of notice via registered tracking',
            'Follow-up and monitoring of responses'
        ],
        howToUse: [
            'Choose a legal notice specialist',
            'Brief the expert on your current conflict',
            'Review the drafted notice for factual accuracy',
            'Direct the expert to send via official channels'
        ],
        categories: [
            'Breach of Contract Notice', 'Consumer Complaint Notice', 'Divorce Legal Notice',
            'Eviction Notice', 'Fraud & Misrepresentation Notice', 'Loan Recovery Notice',
            'Money Recovery Notice', 'Property Dispute Notice', 'Rent Arrears Notice',
            'Service Deficiency Notice', 'Termination of Contract Notice', 'Workplace Harassment Representation'
        ],
        types: ['Demand Notice', 'Show Cause', 'Disclaimer'],
        subtypes: ['Standard Letter', 'Advocate Notified']
    },
    'legal-docs': {
        id: 'legal-docs',
        title: 'Specialized Legal Documentation',
        description: 'Advanced document preparation for complex legal needs, including Wills, POA, and Trust Deeds.',
        howItWorks: [
            'Requirement assessment', 'Document structure planning', 'Legal drafting', 'Client revisions', 'Final execution-ready delivery'
        ],
        howToUse: [
            'Search for document specialists in your state',
            'Share the objectives of the document',
            'Provide supporting proofs for drafting',
            'Finalize document after expert validation'
        ],
        categories: [
            'Will Drafting', 'Living Will / Healthcare Proxy', 'Codicil to Will', 'Special Power of Attorney',
            'General Power of Attorney', 'Durable Power of Attorney', 'Trust Deed (Private / Public)',
            'Gift Deed', 'Relinquishment Deed', 'Partition Deed', 'Settlement Deed', 'Sale Deed Drafting',
            'Lease Deed', 'Mortgage Deed', 'Rectification Deed', 'Cancellation Deed', 'Adoption Deed'
        ],
        types: ['Estate Planning', 'Property Transfer', 'Fiduciary Docs'],
        subtypes: ['Individual', 'Joint', 'Corporate Entity']
    }
};

// --- Helpers ---
const maskString = (str: string) => {
    if (str.length <= 2) return str;
    return str.substring(0, 2) + '*'.repeat(str.length - 2);
};

// --- Sub-Components ---

const SelectableFilter: React.FC<{
    label: string;
    options: string[];
    selectedValue: string;
    onSelect: (val: string) => void
}> = ({ label, options, selectedValue, onSelect }) => (
    <div className={styles.filterRow}>
        <span className={styles.filterLabel}>{label}</span>
        <div className={styles.chipContainer}>
            <button
                className={`${styles.filterChip} ${selectedValue === '' ? styles.activeChip : ''}`}
                onClick={() => onSelect('')}
            >
                All
            </button>
            {options.map(opt => (
                <button
                    key={opt}
                    className={`${styles.filterChip} ${selectedValue === opt ? styles.activeChip : ''}`}
                    onClick={() => onSelect(opt)}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

interface ProviderCardProps {
    provider: Advocate;
    isLoggedIn: boolean;
    onLogin: () => void;
    onClick: () => void;
    onChat: (p: Advocate) => void;
    onConsult: (p: Advocate) => void;
    isAlreadyInterested?: boolean;
    isAlreadyConsulted?: boolean;
    onInteractionSuccess?: (type: string) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
    provider,
    isLoggedIn,
    onLogin,
    onClick,
    onChat,
    onConsult,
    isAlreadyInterested = false,
    isAlreadyConsulted = false,
    onInteractionSuccess
}) => {
    const { user } = useAuth();
    const name = provider.name || `${provider.firstName} ${provider.lastName}`;
    const age = provider.age || 35;
    const location = typeof provider.location === 'object' ? (provider.location as any).city : provider.location;
    const experience = provider.experience || '10+ years';
    const specialization = provider.specialization || (provider.practice as any)?.specialization || 'Legal Specialist';
    const license_id = provider.licenseId || (provider as any).bar_council_id || 'BCI-VERIFIED';
    const adv_id = provider.unique_id || provider.display_id || 'ADV-USER';
    const image_url = provider.profilePicPath ? formatImageUrl(provider.profilePicPath) : provider.image_url;
    const specializations = provider.specialties || [(specialization)];

    return (
        <motion.div
            className={styles.premiumProviderCard}
            whileHover={{ translateY: -10 }}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            {/* Image Section */}
            <div className={styles.cardImageSection}>
                <img
                    src={image_url || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=800'}
                    alt={name}
                    className={styles.providerImage}
                />

                {/* Top Right Badges */}
                <div className={styles.topBadgesContainer}>
                    <div className={styles.topIdBadge} style={{ width: 'auto', padding: '4px 10px' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>{adv_id}</span>
                        {provider.verified === true ? (
                            <div className={styles.checkInner} title="Verified Specialist">
                                <CheckCircle2 size={12} />
                            </div>
                        ) : (
                            <div className={`${styles.checkInner} ${styles.pendingBadgeSmall}`} title="Verification Pending">
                                <Clock size={12} />
                            </div>
                        )}
                    </div>
                    {/* Specializations moved to top right */}
                    <div className={styles.topSpecTags}>
                        {specializations && specializations.map(spec => (
                            <span key={spec} className={styles.topSpecTag}>{spec}</span>
                        ))}
                    </div>
                </div>

                {/* Bottom Overlay Details */}
                <div className={styles.imageOverlay}>
                    <div className={styles.overlayMain}>
                        <h3>{name}{age ? `, ${age}` : ''}</h3>
                        <p className={styles.overlayLoc}>{location}</p>
                        <p className={styles.overlayExp}>{experience} experience</p>
                    </div>

                    <div className={styles.overlayBadges}>
                        <div className={styles.licenseBadge} style={{ opacity: 1, background: 'rgba(0,0,0,0.6)' }}>
                            <Shield size={12} className={styles.shieldIcon} color="#4ade80" />
                            <span style={{ letterSpacing: '0.5px' }}>{license_id}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className={styles.cardActionBar}>
                <button
                    className={`${styles.actionItem} ${isAlreadyInterested ? styles.actionDisabled : ''}`}
                    disabled={isAlreadyInterested}
                    onClick={async (e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) {
                            onLogin();
                        } else {
                            try {
                                const targetId = String((provider as any).userId?._id || (provider as any).userId || provider.id || (provider as any)._id);
                                await interactionService.recordActivity('advocate', targetId, 'interest', String(user?.id));
                                alert(`Interest for ${name} recorded!`);
                                if (onInteractionSuccess) onInteractionSuccess('interest');
                            } catch (err: any) {
                                console.error("Error recording interest:", err);
                                if (err.response?.data?.error === 'ALREADY_SENT') {
                                    alert("Interest already sent.");
                                    if (onInteractionSuccess) onInteractionSuccess('interest');
                                } else {
                                    alert("Action failed. Please try again.");
                                }
                            }
                        }
                    }}
                >
                    <div className={styles.actionIcon}><Handshake size={20} /></div>
                    <span>Interested</span>
                </button>
                <button className={styles.actionItem} onClick={(e) => { e.stopPropagation(); !isLoggedIn ? onLogin() : onChat(provider); }}>
                    <div className={styles.actionIcon}><MessageCircle size={20} /></div>
                    <span>Chat</span>
                </button>
                <button
                    className={styles.actionItem}
                    onClick={async (e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) {
                            onLogin();
                        } else {
                            try {
                                const targetId = String(provider.userId?._id || provider.userId || provider.id || (provider as any)._id);
                                await interactionService.recordActivity('advocate', targetId, 'shortlist', String(user?.id));
                                alert(`${name} added to your shortlist!`);
                            } catch (err) {
                                console.error("Error shortlisting:", err);
                                alert("Failed to shortlist.");
                            }
                        }
                    }}
                >
                    <div className={styles.actionIcon}><Bookmark size={20} /></div>
                    <span>Shortlist</span>
                </button>
                <button
                    className={`${styles.actionItem} ${isAlreadyConsulted ? styles.actionDisabled : ''}`}
                    disabled={isAlreadyConsulted}
                    onClick={(e) => { e.stopPropagation(); !isLoggedIn ? onLogin() : onConsult(provider); }}
                >
                    <div className={styles.actionIcon}><Clock size={20} /></div>
                    <span>{isAlreadyConsulted ? 'Requested' : 'Consultation'}</span>
                </button>
            </div>
        </motion.div>
    );
};

const ChatPopup: React.FC<{ provider: Advocate; service: string; onClose: () => void }> = ({ provider, service, onClose }) => {
    const [msg, setMsg] = useState('');
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const { user } = useAuth();
    const { initiateCall } = useCall();
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const name = provider.name || `${provider.firstName} ${provider.lastName}`;
    const image_url = provider.profilePicPath ? formatImageUrl(provider.profilePicPath) : provider.image_url;
    const currentUserId = String(user?.id || (user as any)?._id);
    const targetId = String(provider.userId?._id || provider.userId || provider.id || (provider as any)._id);

    const fetchHistory = async () => {
        if (!currentUserId || !targetId) return;
        try {
            const msgs = await interactionService.getConversationMessages(currentUserId, targetId);
            setHistory(msgs);
        } catch (err) {
            console.error("Failed to fetch chat history:", err);
        }
    };

    useEffect(() => {
        setLoadingHistory(true);
        fetchHistory().finally(() => setLoadingHistory(false));
        const interval = setInterval(fetchHistory, 3000);
        return () => clearInterval(interval);
    }, [currentUserId, targetId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("Please login to send messages");
        if (!msg.trim()) return;

        try {
            const sent = await interactionService.sendMessage(currentUserId, targetId, msg);
            setHistory(prev => [...prev, sent]);
            setMsg('');
            interactionService.recordActivity('advocate', targetId, 'chat', currentUserId).catch(console.error);
        } catch (err) {
            console.error("Chat error:", err);
            alert("Could not send message.");
        }
    };

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <motion.div className={styles.chatPopup} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} onClick={e => e.stopPropagation()}>
                <div className={styles.popupHeader}>
                    <div className={styles.popupProviderInfo}>
                        <img src={image_url} alt="" />
                        <div>
                            <h4>{name}</h4>
                            <p>{service}</p>
                        </div>
                    </div>
                    <div className={styles.headerActionGroup}>
                        <button className={styles.headerCallBtn} onClick={() => initiateCall(targetId, 'audio')} title="Voice Call">
                            <Phone stroke="currentColor" strokeWidth={2.5} />
                        </button>
                        <button className={styles.headerCallBtn} onClick={() => initiateCall(targetId, 'video')} title="Video Call">
                            <Video stroke="currentColor" strokeWidth={2.5} />
                        </button>
                        <button onClick={onClose} className={styles.closeBtn} title="Close Chat">
                            <X stroke="currentColor" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className={styles.chatMessages} ref={scrollRef}>
                    <div className={styles.systemNote}>Consultation regarding {service} started</div>
                    {loadingHistory && <div className={styles.systemNote}>Loading conversation...</div>}
                    {history.map((m, idx) => (
                        <div key={idx} className={`${styles.chatMsg} ${m.senderId === currentUserId ? styles.sentMsg : styles.receivedMsg}`}>
                            {m.text}
                            <span className={styles.msgTimeSmall}>
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>

                <form className={styles.chatInput} onSubmit={handleSend}>
                    <div className={styles.fileUploadWrap}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    alert(`Uploading ${file.name}... (Backend integration pending)`);
                                    // Here you would typically upload the file to a CDN/Server
                                }
                            }}
                        />
                        <button type="button" className={styles.fileUploadBtn} onClick={() => fileInputRef.current?.click()}>
                            <Paperclip stroke="currentColor" strokeWidth={2.5} />
                        </button>
                    </div>
                    <input type="text" placeholder="Write your response..." value={msg} onChange={e => setMsg(e.target.value)} />
                    <button type="submit"><Send stroke="currentColor" strokeWidth={2.5} /></button>
                </form>
            </motion.div>
        </div>
    );
};

const ConsultationPopup: React.FC<{ provider: Advocate; service: string; onClose: () => void; onInteractionSuccess?: (type: string) => void }> = ({ provider, service, onClose, onInteractionSuccess }) => {
    const [form, setForm] = useState({ service, reason: '' });
    const { user } = useAuth();
    const name = provider.name || `${provider.firstName} ${provider.lastName}`;

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <motion.div className={styles.consultPopup} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} onClick={e => e.stopPropagation()}>
                <div className={styles.popupHeader}>
                    <h3>Book Consultation</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form className={styles.consultForm} onSubmit={async e => {
                    e.preventDefault();
                    if (!user) return alert("Please login to book consultation");
                    const currentUserId = String(user.id || (user as any)._id);
                    const targetId = String(provider.userId?._id || provider.userId || provider.id || (provider as any)._id);
                    try {
                        await interactionService.recordActivity('advocate', targetId, 'meet_request', currentUserId, { service });
                        alert(`Consultation request for ${service} sent to ${name}`);
                        if (onInteractionSuccess) onInteractionSuccess('meet_request');
                        onClose();
                    } catch (err: any) {
                        console.error("Consultation error:", err);
                        if (err.response?.data?.error === 'ALREADY_SENT') {
                            alert("Consultation request already sent.");
                            if (onInteractionSuccess) onInteractionSuccess('meet_request');
                            onClose();
                        } else {
                            alert("Failed to submit request.");
                        }
                    }
                }}>
                    <div className={styles.inputGroup}>
                        <label>Target Service</label>
                        <input type="text" value={form.service} readOnly />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Reason for Consulting</label>
                        <textarea placeholder="Tell the advocate what you need help with..." required value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={4} />
                    </div>
                    <button type="submit" className={styles.confirmBtn}>Confirm Consultation Request</button>
                    <p className={styles.formNote}>This will be logged in your activity tab & advisor dashboard.</p>
                </form>
            </motion.div>
        </div>
    );
};

const CreateCaseModal: React.FC<{
    provider: Advocate;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ provider, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        type: 'Agreement Drafting',
        description: '',
        urgency: 'Normal' as 'Normal' | 'Priority',
        budget: '',
        deadline: '',
    });
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('advocateId', provider.unique_id);
            formData.append('title', form.title);
            formData.append('category', form.type);
            formData.append('description', form.description);
            formData.append('urgency', form.urgency);
            if (form.budget) formData.append('budget', form.budget);
            if (form.deadline) formData.append('deadline', form.deadline);

            files.forEach(file => {
                formData.append('documents', file);
            });

            if ((form as any).jurisdiction) formData.append('jurisdiction', (form as any).jurisdiction);
            if ((form as any).communicationPreferences) formData.append('communicationPreferences', (form as any).communicationPreferences);

            await api.post('/cases', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Case created successfully! The advisor has been notified.");
            onSuccess();
        } catch (err: any) {
            console.error("Create case error:", err);
            const msg = err.response?.data?.message || "Failed to create case.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <motion.div
                className={styles.createCaseModal}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={e => e.stopPropagation()}
            >
                <div className={styles.popupHeader} style={{
                    padding: '25px 30px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e292b 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'rgba(250, 204, 21, 0.15)', padding: '10px', borderRadius: '12px' }}>
                            <Briefcase size={22} color="#facc15" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Raise Legal Case Request</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '8px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s' }}><X size={20} /></button>
                </div>
                <form className={styles.caseForm} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Service Type</label>
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option>Agreement Drafting</option>
                            <option>Legal Notice</option>
                            <option>Affidavit</option>
                            <option>Legal Consultation</option>
                            <option>Document Verification</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Title</label>
                        <input type="text" placeholder="e.g. Purchase Agreement Review" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Description</label>
                        <textarea placeholder="Provide detailed information about your legal requirement..." required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label>Urgency</label>
                            <div className={styles.radioGroup} style={{ display: 'flex', gap: '10px' }}>
                                <label className={form.urgency === 'Normal' ? styles.radioActive : ''} style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                                    <input type="radio" value="Normal" checked={form.urgency === 'Normal'} onChange={() => setForm({ ...form, urgency: 'Normal' })} hidden /> Normal
                                </label>
                                <label className={form.urgency === 'Priority' ? styles.radioActive : ''} style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                                    <input type="radio" value="Priority" checked={form.urgency === 'Priority'} onChange={() => setForm({ ...form, urgency: 'Priority' })} hidden /> Priority
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                            <label>Deadline (Optional)</label>
                            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Jurisdiction (e.g. Mumbai)</label>
                            <input type="text" placeholder="State/City" value={(form as any).jurisdiction} onChange={e => setForm({ ...form, jurisdiction: e.target.value } as any)} />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Preferred Communication</label>
                        <select value={(form as any).communicationPreferences} onChange={e => setForm({ ...form, communicationPreferences: e.target.value } as any)}>
                            <option>In-App Chat</option>
                            <option>Email</option>
                            <option>Voice Call</option>
                            <option>Video Call</option>
                            <option>Any</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Attach Documents</label>
                        <div className={styles.fileUploadZone} onClick={() => fileInputRef.current?.click()}>
                            <Paperclip size={20} />
                            <span>{files.length > 0 ? `${files.length} files selected` : 'Upload relevant files'}</span>
                            <input type="file" multiple hidden ref={fileInputRef} onChange={e => setFiles(Array.from(e.target.files || []))} />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitCaseBtn} disabled={loading}>
                        {loading ? 'Submitting...' : 'Create Case & Notify Advisor'}
                    </button>
                    <p className={styles.formNote}>Actual work begins after advisor shares quote and payment is funded in escrow.</p>
                </form>
            </motion.div>
        </div>
    );
};

const QuoteCaseModal: React.FC<{
    caseData: any;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ caseData, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [serviceFee, setServiceFee] = useState('');
    const [notes, setNotes] = useState('');
    const [estimatedDelivery, setEstimatedDelivery] = useState('');
    const [terms, setTerms] = useState('Standard E-Advocate documentation terms apply.');
    const [maxRevisions, setMaxRevisions] = useState('3');
    const [milestones, setMilestones] = useState([{ title: 'Initial Draft', description: 'Working draft of the document', amount: 0 }]);
    const [requestedDocuments, setRequestedDocuments] = useState<string[]>(['']);

    const addMilestone = () => setMilestones([...milestones, { title: '', description: '', amount: 0 }]);
    const addRequestedDoc = () => setRequestedDocuments([...requestedDocuments, '']);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/cases/${caseData._id}/quote`, {
                serviceFee: Number(serviceFee),
                advisorNotes: notes,
                estimatedDelivery,
                milestones,
                terms,
                maxRevisions: Number(maxRevisions),
                requestedDocuments: requestedDocuments.filter(d => d.trim() !== '')
            });
            alert("Quote sent successfully! Client notified.");
            onSuccess();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to send quote");
        } finally {
            setLoading(false);
        }
    };

    const platformFee = Math.round(Number(serviceFee) * 0.20);
    const total = Number(serviceFee) + platformFee;

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <motion.div className={styles.createCaseModal} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}>
                <div className={styles.popupHeader}>
                    <h3>Construct Service Quote</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className={styles.caseForm} style={{ maxHeight: '75vh', overflowY: 'auto', padding: '30px' }}>
                    <div className={styles.caseSummaryCard}>
                        <h4>{caseData.title}</h4>
                        <p>{caseData.description}</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label>Service Fee (₹)</label>
                                <input type="number" required value={serviceFee} onChange={e => setServiceFee(e.target.value)} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Estimated Delivery (e.g. 5 Days)</label>
                                <input type="text" required placeholder="Ex: 3-5 Working Days" value={estimatedDelivery} onChange={e => setEstimatedDelivery(e.target.value)} />
                            </div>
                        </div>

                        {serviceFee && (
                            <div className={styles.feeBreakdown}>
                                <div className={styles.breakdownRow}><span>Advisor Professional Fee:</span> <span>₹{serviceFee}</span></div>
                                <div className={styles.breakdownRow}><span>Platform Commission (20%):</span> <span>₹{platformFee}</span></div>
                                <div className={styles.divider} />
                                <div className={styles.totalRow}><span>Client Total Payable:</span> <span>₹{total}</span></div>
                                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '10px' }}>* Client funds are held in secure escrow till completion.</p>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label>Milestones (Optional)</label>
                            {milestones.map((m, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px' }}>
                                    <input placeholder="Step" value={m.title} onChange={e => {
                                        const n = [...milestones]; n[i].title = e.target.value; setMilestones(n);
                                    }} />
                                    <input placeholder="Deliverable details" value={m.description} onChange={e => {
                                        const n = [...milestones]; n[i].description = e.target.value; setMilestones(n);
                                    }} />
                                </div>
                            ))}
                            <button type="button" onClick={addMilestone} style={{ width: 'fit-content', background: 'none', border: '1px dashed #64748b', fontSize: '12px' }}>+ Add Row</button>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label>Max Revisions Included</label>
                                <select value={maxRevisions} onChange={e => setMaxRevisions(e.target.value)}>
                                    <option>0</option>
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>5</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Additional Notes / Assumptions</label>
                            <textarea placeholder="Specify what's NOT included or specific requirements..." rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Requested Documents from Client</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {requestedDocuments.map((doc, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            placeholder="e.g. Aadhar Card, Property Deed..."
                                            value={doc}
                                            style={{ flex: 1 }}
                                            onChange={e => {
                                                const n = [...requestedDocuments]; n[i] = e.target.value; setRequestedDocuments(n);
                                            }}
                                        />
                                        {requestedDocuments.length > 1 && (
                                            <button type="button" onClick={() => setRequestedDocuments(requestedDocuments.filter((_, idx) => idx !== i))} style={{ padding: '0 10px', color: '#ef4444', border: 'none', background: 'none' }}>×</button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={addRequestedDoc} style={{ width: 'fit-content', background: 'none', border: '1px dashed #64748b', fontSize: '12px', color: '#94a3b8', padding: '5px 10px', borderRadius: '4px', marginTop: '5px' }}>+ Add Requirement</button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Specific Terms & Conditions</label>
                            <textarea rows={2} value={terms} onChange={e => setTerms(e.target.value)} />
                        </div>

                        <button type="submit" className={styles.submitCaseBtn} disabled={loading || !serviceFee}>
                            {loading ? 'Submitting Quote...' : 'Submit Official Quote'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

const DeliverWorkModal: React.FC<{
    caseData: any;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ caseData, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [content, setContent] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('deliverableContent', content);
            files.forEach(f => formData.append('documents', f));

            await api.post(`/cases/${caseData._id}/deliver`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Work delivered successfully! Client will review and complete.");
            onSuccess();
        } catch (err: any) {
            alert(err.response?.data?.message || "Delivery failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <motion.div className={styles.createCaseModal} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}>
                <div className={styles.popupHeader}>
                    <h3>Deliver Completed Work</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form className={styles.caseForm} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Online Copy / Deliverable Text</label>
                        <textarea placeholder="Paste the final document text or summary here..." rows={8} required value={content} onChange={e => setContent(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Attach Final Files (DOCX, PDF, etc.)</label>
                        <div className={styles.fileUploadZone} onClick={() => fileInputRef.current?.click()}>
                            <Paperclip size={20} />
                            <span>{files.length > 0 ? `${files.length} files attached` : 'Upload deliverables'}</span>
                            <input type="file" multiple hidden ref={fileInputRef} onChange={e => setFiles(Array.from(e.target.files || []))} />
                        </div>
                    </div>
                    <div className={styles.payoutAlert}>
                        <Info size={16} />
                        <span>Upon delivery, user will verify. Payment releases after verification.</span>
                    </div>
                    <button type="submit" className={styles.submitCaseBtn} disabled={loading || !content}>
                        {loading ? 'Submitting...' : 'Send Final Draft to User'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const CaseDetailModal: React.FC<{
    caseData: any;
    onClose: () => void;
    onChat?: (target: any) => void;
    onPay?: (caseData: any) => void;
    onRefresh?: () => void;
}> = ({ caseData, onClose, onChat, onPay, onRefresh }) => {
    const isClient = useAuth().user?.role?.toLowerCase() === 'client';
    const partner = isClient ? caseData.advocateId : caseData.clientId;
    const [uploadDetails, setUploadDetails] = useState({ notes: '', files: {} as Record<string, File> });
    const [uploading, setUploading] = useState(false);

    // Parsing fallback: if requestedDocuments is empty, try to parse from terms
    const getEffectiveDocs = () => {
        const explicit = caseData.requestedDocuments || caseData.quotingInfo?.requestedDocuments || [];
        if (explicit.length > 0) return explicit;

        const terms = caseData.quotingInfo?.terms || '';
        if (terms.toLowerCase().includes('required docs:')) {
            const part = terms.split(/required docs:/i)[1];
            if (part) {
                return part.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
            }
        }
        return [];
    };
    const effectiveDocs = getEffectiveDocs();

    const handleClientDocsSubmit = async () => {
        const fileList = Object.values(uploadDetails.files);
        if (fileList.length === 0) return alert("Please select files before submitting.");
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('notes', uploadDetails.notes);
            fileList.forEach(f => fd.append('documents', f));
            // We can also append names if needed, but the current backend maps documents to an array.
            await api.post(`/cases/${caseData._id}/upload-docs`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Documents shared with advisor!");
            onRefresh?.();
            onClose();
        } catch (e) {
            alert("Failed to upload documents. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <motion.div className={styles.createCaseModal} initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} onClick={e => e.stopPropagation()} style={{ width: '95%', maxWidth: '850px', background: '#0a0f1d' }}>
                <div className={styles.popupHeader} style={{
                    padding: '24px 30px',
                    background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: 'rgba(250, 204, 21, 0.1)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(250, 204, 21, 0.2)' }}>
                            <Shield size={24} color="#facc15" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#facc15', letterSpacing: '0.5px' }}>Case Lifecycle Details</h3>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>ID: <b style={{ color: '#fff' }}>{caseData.caseId}</b></span>
                                <span style={{ opacity: 0.3 }}>•</span>
                                <span>Status: <b style={{ color: '#4ade80' }}>{caseData.status}</b></span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.caseForm} style={{ maxHeight: '75vh', overflowY: 'auto', padding: 0 }}>
                    {/* Progress Timeline */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '30px 40px',
                        background: 'rgba(255,255,255,0.01)',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        position: 'relative',
                    }}>
                        <div style={{ position: 'absolute', top: '46px', left: '60px', right: '60px', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
                        {[
                            { label: 'Requested', status: ['Requested'] },
                            { label: 'Quoted', status: ['Quoted', 'Accepted'] },
                            { label: 'Funded', status: ['Funded'] },
                            { label: 'Working', status: ['In Progress', 'Revision Requested'] },
                            { label: 'Delivered', status: ['Delivered'] },
                            { label: 'Completed', status: ['Completed'] }
                        ].map((step, i) => {
                            const statusesOrder = ['Requested', 'Accepted', 'Quoted', 'Funded', 'In Progress', 'Delivered', 'Revision Requested', 'Completed'];
                            const currentIdx = statusesOrder.indexOf(caseData.status);
                            const stepIdx = statusesOrder.indexOf(step.status[0]);
                            const isPast = currentIdx > stepIdx;
                            const isActive = step.status.includes(caseData.status);

                            return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1, flex: 1 }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: isActive ? '#facc15' : (isPast ? '#22c55e' : '#1e293b'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isActive || isPast ? '#000' : '#64748b',
                                        transition: 'all 0.4s ease',
                                        border: isActive ? '4px solid rgba(250, 204, 21, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        boxShadow: isActive ? '0 0 20px rgba(250, 204, 21, 0.2)' : 'none'
                                    }}>
                                        {isPast ? <CheckCircle2 size={16} /> : <span>{i + 1}</span>}
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: isActive ? '800' : '600', color: isActive ? '#facc15' : (isPast ? '#cbd5e1' : '#64748b'), textAlign: 'center' }}>{step.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ padding: '30px' }}>
                        <div className={styles.detailSection} style={{ marginBottom: '30px' }}>
                            <label className={styles.pLabel}>Project Context</label>
                            <h4 className={styles.detailValue} style={{ fontSize: '22px', marginTop: '8px' }}>{caseData.title}</h4>
                            <p className={styles.detailValueText} style={{ marginTop: '10px', fontSize: '15px' }}>{caseData.description}</p>
                        </div>

                        <div className={styles.formRow} style={{ gap: '30px', marginBottom: '30px' }}>
                            <div className={styles.detailSection} style={{ flex: 1 }}>
                                <label className={styles.pLabel}>Comm. Preference</label>
                                <span className={styles.detailValue} style={{ fontSize: '15px', color: '#e2e8f0', display: 'block', marginTop: '6px' }}>{caseData.communicationPreferences || 'In-App Chat'}</span>
                            </div>
                            <div className={styles.detailSection} style={{ flex: 1 }}>
                                <label className={styles.pLabel}>Service Category</label>
                                <div style={{ marginTop: '8px' }}>
                                    <span className={styles.typeTag} style={{ padding: '8px 16px', fontSize: '13px' }}>{caseData.category}</span>
                                </div>
                            </div>
                        </div>

                        {caseData.status === 'Rejected' && (
                            <div className={styles.deliverableBox} style={{ border: '1px solid #ef444433', background: '#ef44440a', marginBottom: '30px' }}>
                                <h5 style={{ color: '#ef4444' }}>Rejection Reason</h5>
                                <p className={styles.detailValueText}>{caseData.rejectedReason}</p>
                            </div>
                        )}

                        {caseData.quotingInfo?.estimatedDelivery && (
                            <div className={styles.financialBox} style={{ background: 'rgba(250,204,21,0.03)', border: '1px solid rgba(250,204,21,0.1)', marginBottom: '30px', padding: '30px' }}>
                                <h5 style={{ color: '#facc15', borderBottom: '1px solid rgba(250,204,21,0.1)', paddingBottom: '12px', marginBottom: '20px' }}>Advisor Commitment & Requirements</h5>
                                <div className={styles.breakdownRow}><span>Estimated Delivery Window:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{caseData.quotingInfo.estimatedDelivery} Days</span></div>
                                <div className={styles.breakdownRow}><span>Revision Policy:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{caseData.revisionCount} / {caseData.maxRevisions} Revision rounds</span></div>

                                {caseData.advocateNotes && (
                                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                                        <label className={styles.pLabel}>Advisor Guidance / Workflow Plan</label>
                                        <p className={styles.detailValueText} style={{ color: '#e2e8f0', marginTop: '5px' }}>{caseData.advocateNotes}</p>
                                    </div>
                                )}

                                {caseData.quotingInfo.terms && (
                                    <div style={{ marginTop: '15px' }}>
                                        <label className={styles.pLabel}>Custom Terms / Requirements</label>
                                        <p className={styles.detailValueText} style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '5px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>{caseData.quotingInfo.terms}</p>
                                    </div>
                                )}

                                {caseData.quotingInfo.milestones?.length > 0 && (
                                    <div style={{ marginTop: '20px' }}>
                                        <label className={styles.pLabel}>Project Roadmap</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                                            {caseData.quotingInfo.milestones.map((m: any, idx: number) => (
                                                <div key={idx} style={{ fontSize: '13px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ color: '#facc15', fontWeight: 700, fontSize: '11px', marginBottom: '4px' }}>PHASE {idx + 1}</div>
                                                    <div style={{ color: '#fff', fontWeight: 600 }}>{m.title}</div>
                                                    <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>{m.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(caseData.requestedDocuments?.length > 0 ||
                            (caseData.quotingInfo?.requestedDocuments && caseData.quotingInfo.requestedDocuments.length > 0) ||
                            (caseData.quotingInfo?.terms?.includes('Required Docs')) ||
                            (caseData.status === 'Quoted' && isClient)) && (
                                <div className={styles.detailSection} style={{ marginBottom: '30px' }}>
                                    <label className={styles.pLabel}>CLIENT SUBMISSION FORM</label>
                                    <div className={styles.deliverableBox} style={{ margin: '10px 0', padding: '25px', background: 'rgba(218, 165, 32, 0.03)', borderRadius: '20px', border: '1px solid rgba(218, 165, 32, 0.1)' }}>
                                        <h5 style={{ color: '#daa520', fontSize: '12px', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>Required Documentation & Details</h5>
                                        <ul style={{ margin: '0 0 20px 0', paddingLeft: '20px', color: '#cbd5e1', fontSize: '14px', lineHeight: '2' }}>
                                            {effectiveDocs.length > 0 ? (
                                                effectiveDocs.map((doc: string, i: number) => (
                                                    <li key={i}>{doc}</li>
                                                ))
                                            ) : (
                                                <li>Refer to Advisor's Custom Terms below for required details.</li>
                                            )}
                                        </ul>

                                        {isClient && ['Funded', 'In Progress', 'Accepted', 'Quoted'].includes(caseData.status) && (
                                            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(250, 204, 21, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Paperclip size={16} color="#facc15" />
                                                    </div>
                                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Upload Requested Files</span>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                    {effectiveDocs.map((doc: string, idx: number) => (
                                                        <div key={idx} style={{
                                                            background: 'rgba(255,255,255,0.02)',
                                                            padding: '16px',
                                                            borderRadius: '12px',
                                                            border: '1px solid rgba(255,255,255,0.05)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '8px'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#facc15' }}>{doc}:</span>
                                                                {uploadDetails.files[doc] && <span style={{ fontSize: '11px', color: '#4ade80' }}>✓ {uploadDetails.files[doc].name}</span>}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        setUploadDetails(prev => ({
                                                                            ...prev,
                                                                            files: { ...prev.files, [doc]: file }
                                                                        }));
                                                                    }
                                                                }}
                                                                style={{
                                                                    fontSize: '12px',
                                                                    color: '#94a3b8',
                                                                    cursor: 'pointer'
                                                                }}
                                                            />
                                                        </div>
                                                    ))}

                                                    {/* General upload if no specific docs found */}
                                                    {effectiveDocs.length === 0 && (
                                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const files = Array.from(e.target.files || []);
                                                                    const newFiles = { ...uploadDetails.files };
                                                                    files.forEach((f, i) => newFiles[`extra_${i}`] = f);
                                                                    setUploadDetails(prev => ({ ...prev, files: newFiles }));
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <label className={styles.pLabel} style={{ marginBottom: '8px' }}>Submission Context / Responses</label>
                                                <textarea
                                                    placeholder="Explain how these files address the requirements or provide the requested details here..."
                                                    value={uploadDetails.notes}
                                                    onChange={(e) => setUploadDetails(prev => ({ ...prev, notes: e.target.value }))}
                                                    style={{
                                                        width: '100%',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '16px',
                                                        padding: '16px',
                                                        fontSize: '14px',
                                                        color: '#fff',
                                                        resize: 'none',
                                                        marginBottom: '20px',
                                                        lineHeight: '1.6'
                                                    }}
                                                    rows={4}
                                                />

                                                <button
                                                    onClick={handleClientDocsSubmit}
                                                    disabled={uploading || Object.keys(uploadDetails.files).length === 0}
                                                    className={styles.submitCaseBtn}
                                                    style={{
                                                        width: '100%',
                                                        padding: '15px',
                                                        background: 'linear-gradient(135deg, #facc15, #daa520)',
                                                        boxShadow: '0 4px 15px rgba(218, 165, 32, 0.2)',
                                                        opacity: Object.keys(uploadDetails.files).length === 0 ? 0.5 : 1,
                                                        cursor: Object.keys(uploadDetails.files).length === 0 ? 'not-allowed' : 'pointer',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    {uploading ? 'Finalizing Upload...' : 'Securely Submit to Advisor'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        {caseData.paymentInfo?.totalPaid > 0 && (
                            <div className={styles.financialBox} style={{ marginBottom: '30px', borderLeft: '4px solid #4ade80' }}>
                                <h5 style={{ color: '#4ade80' }}>Verified Financial Transaction</h5>
                                <div className={styles.divider} />
                                <div className={styles.breakdownRow}><span>Professional Service Fee:</span> <span>₹{caseData.paymentInfo?.serviceFee?.toLocaleString() || 0}</span></div>
                                <div className={styles.breakdownRow}><span>Platform Protection Fee:</span> <span>₹{caseData.paymentInfo?.platformFee?.toLocaleString() || 0}</span></div>
                                <div className={styles.totalRow} style={{ borderColor: 'rgba(74, 222, 128, 0.2)' }}><span style={{ fontWeight: 800 }}>Total Escrow Funded:</span> <span style={{ fontWeight: 800, color: '#4ade80' }}>₹{caseData.paymentInfo?.totalPaid?.toLocaleString() || 0}</span></div>

                                <div className={styles.payoutAlert} style={{ marginTop: '20px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.1)', color: '#4ade80' }}>
                                    <Shield size={16} />
                                    <span><b>Status:</b> {caseData.status === 'Completed' ? 'Funds Released to Advisor' : 'Held Securely in Escrow'}</span>
                                </div>
                            </div>
                        )}

                        {caseData.deliverableContent && (
                            <div className={styles.deliverableBox} style={{ marginBottom: '30px', borderLeft: '4px solid #a855f7' }}>
                                <h5 style={{ color: '#a855f7' }}>Advisor Legal Deliverables</h5>
                                <div className={styles.divider} />
                                <div className={styles.deliverableTextContent} style={{ background: 'rgba(168, 85, 247, 0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.1)', whiteSpace: 'pre-wrap' }}>
                                    {caseData.deliverableContent}
                                </div>
                            </div>
                        )}

                        {caseData.documents?.length > 0 && (
                            <div className={styles.docSection}>
                                <h5>Supporting Documentation & Attachments</h5>
                                <div className={styles.docGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                                    {caseData.documents.map((doc: any, i: number) => (
                                        <a key={i} href={doc.url} target="_blank" rel="noreferrer" className={styles.docItem} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}>
                                            <div style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                                <FileText size={18} color="#60a5fa" />
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{doc.name}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Project Attachment</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooterActions} style={{
                    padding: '20px 30px',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '15px',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={() => onChat?.(partner)}
                        className={styles.chatTabBtn}
                        style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <MessageCircle size={18} /> Chat with Specialist
                    </button>

                    {isClient && caseData.status === 'Quoted' && (
                        <button
                            className={styles.payEscrowBtn}
                            onClick={() => onPay?.(caseData)}
                            style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: '#facc15', color: '#000', fontWeight: 800 }}
                        >
                            <CreditCard size={18} /> Accept & Pay ₹{caseData.paymentInfo?.totalPaid?.toLocaleString() || 0}
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', padding: '10px' }}
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Main Page Component ---

const DashboardLegalDocs: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
    const { isLoggedIn, openAuthModal, user, refreshUser } = useAuth();
    const location = useLocation();
    const [activeNav, setActiveNav] = useState('home');
    const [activeSubNav, setActiveSubNav] = useState('sent'); // for Messages / Activity tabs
    const [isLoaded, setIsLoaded] = useState(false);
    const [providers, setProviders] = useState<Advocate[]>([]);
    const [allActivities, setAllActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<Advocate | null>(null);
    const [selectedInteraction, setSelectedInteraction] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [chatTarget, setChatTarget] = useState<Advocate | null>(null);
    const [consultTarget, setConsultTarget] = useState<Advocate | null>(null);
    const [sentInteractions, setSentInteractions] = useState<Set<string>>(new Set());
    const [payingFor, setPayingFor] = useState<Advocate | null>(null);
    const [createCaseTarget, setCreateCaseTarget] = useState<Advocate | null>(null);
    const [allCases, setAllCases] = useState<any[]>([]);
    const [quotingCase, setQuotingCase] = useState<any | null>(null);
    const [deliveringCase, setDeliveringCase] = useState<any | null>(null);
    const [detailCase, setDetailCase] = useState<any | null>(null);
    const [activeCallSubTab, setActiveCallSubTab] = useState<'all' | 'voice' | 'video'>('all');
    const contentRef = useRef<HTMLDivElement>(null);

    // --- Popup States ---
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [selectedProfileServices, setSelectedProfileServices] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Trigger Popup after 3 seconds for logged in Clients/Advocates
    useEffect(() => {
        if (isLoggedIn && (user?.role?.toLowerCase() === 'client' || user?.role?.toLowerCase() === 'advocate')) {
            const hasSeen = sessionStorage.getItem('hasSeenProfileUpdatePopup');
            if (!hasSeen) {
                const timer = setTimeout(() => {
                    setShowUpdatePopup(true);
                    // Pre-fill with existing services if any
                    const existing = (user as any).legalHelp?.featuredServices || [];
                    setSelectedProfileServices(existing);
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [isLoggedIn, user]);

    const handleSaveProfileServices = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const updates = {
                legalHelp: {
                    ...(user as any).legalHelp,
                    featuredServices: selectedProfileServices
                }
            };
            if (user.role.toLowerCase() === 'client') {
                await clientService.updateClient(user.unique_id, updates);
            } else {
                await advocateService.updateAdvocate(user.unique_id, updates);
            }
            refreshUser(updates as any);
            sessionStorage.setItem('hasSeenProfileUpdatePopup', 'true');
            setShowUpdatePopup(false);
        } catch (err) {
            console.error("Save failed", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePartnerProfilePopup = async (pid: string, uniqueId?: string, interaction?: any) => {
        setSelectedInteraction(interaction || null);
        // 1. Try finding in existing providers
        const found = providers.find(p =>
            String(p.id) === String(pid) ||
            String((p as any)._id) === String(pid) ||
            String((p as any).userId?._id || (p as any).userId) === String(pid) ||
            (uniqueId && p.unique_id === uniqueId)
        );
        if (found) {
            setSelectedProvider(found);
            return;
        }

        // 2. Otherwise fetch by ID
        try {
            setLoading(true);
            const res = await advocateService.getAdvocateById(uniqueId || pid);
            if (res.data.success && res.data.advocate) {
                setSelectedProvider(res.data.advocate);
            } else {
                alert("Profile details not found.");
            }
        } catch (err) {
            console.error("Error fetching partner profile:", err);
            alert("Could not load profile details.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllActivities = async () => {
        if (!isLoggedIn || !user?.id) return;
        try {
            const activities = await interactionService.getAllActivities(String(user.id));

            // Filter to show ONLY legal documentation related activities
            const filteredActivities = activities.filter((act: any) => {
                const uid = String(act.partnerUniqueId || '');
                const role = String(act.partnerRole || '').toLowerCase();
                const type = String(act.type || '');
                const isCase = type.startsWith('case_');
                // LSP IDs are documentation providers, others are checked by role/ID keywords or case type
                return uid.includes('LSP') || role.includes('provider') || role.includes('documentation') || uid.includes('LDP') || isCase;
            });

            setAllActivities(filteredActivities);

            const ids = new Set<string>();
            activities.forEach((act: any) => {
                const tId = String(act.partnerUserId || act.receiver || act.sender);
                if (act.isSender) {
                    ids.add(tId + ':' + act.type);
                    if (act.status === 'accepted') {
                        ids.add(tId + ':interest');
                        ids.add(tId + ':meet_request');
                    }
                } else if (act.status === 'accepted') {
                    ids.add(tId + ':interest');
                    ids.add(tId + ':meet_request');
                }
            });
            setSentInteractions(ids);
        } catch (err) {
            console.error("Error fetching activities:", err);
        }
    };

    const fetchAllCases = async () => {
        if (!isLoggedIn) return;
        try {
            const res = await api.get('/cases');
            if (res.data.success) {
                setAllCases(res.data.cases);
            }
        } catch (err) {
            console.error("Fetch cases error:", err);
        }
    };

    useEffect(() => {
        fetchAllActivities();
        fetchAllCases();
    }, [isLoggedIn, user]);

    // Support Form State
    const [queryForm, setQueryForm] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [submittingQuery, setSubmittingQuery] = useState(false);

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingQuery(true);
        try {
            const res = await api.post('/contact', {
                ...queryForm,
                category: activeNav !== 'home' ? `Legal Doc: ${activeNav}` : 'General Inquiry',
                subject: `Legal Query from Dashboard (${activeNav})`,
                source: 'Legal Documentation Dashboard'
            });
            if (res.data.success) {
                alert("Your query has been submitted successfully! Our experts will contact you soon.");
                setQueryForm({ name: '', phone: '', email: '', message: '' });
            }
        } catch (err) {
            console.error("Error submitting query:", err);
            alert("Failed to submit query. Please try again.");
        } finally {
            setSubmittingQuery(false);
        }
    };
    const [filters, setFilters] = useState({
        state: '',
        district: '',
        city: '',
        categories: [] as string[],
        type: '',
        subtype: '',
        experience: '',
        search: ''
    });

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const params: any = {
                state: filters.state,
                district: filters.district,
                city: filters.city,
                experience: filters.experience,
                search: filters.search,
                excludeInteracted: 'false',
                excludeSelf: 'false',
                verified: 'all'
            };

            const res = await advocateService.getAdvocates(params);
            if (res.data.success) {
                let fetchedProviders = res.data.advocates || [];

                // Filter by Documentation related specialists and strictly only verified ones
                fetchedProviders = fetchedProviders.filter(p => {
                    const role = String(((p as any).role || '')).toLowerCase();
                    const rawSpec = p.specialization || (p.practice as any)?.specialization || '';
                    const spec = (Array.isArray(rawSpec) ? rawSpec.join(' ') : String(rawSpec)).toLowerCase();

                    const specsArray = [
                        ...(p.specialties || []),
                        ...((p as any).legalDocumentation || []),
                        ...(Array.isArray(rawSpec) ? rawSpec : [String(rawSpec)])
                    ].filter(Boolean).map(s => String(s).toLowerCase());

                    const keywords = ['documentation', 'drafting', 'agreement', 'advisor', 'service provider', 'affidavit', 'notice', 'bond', 'registration', 'drafiting'];
                    const hasDocKeyword = keywords.some(k => spec.includes(k) || specsArray.some(s => s.includes(k)));

                    // Show if they are literally a Legal Service Provider role OR match the doc keywords
                    const isLegalProviderRole =
                        role === 'legal_provider' ||
                        role === 'legal provider' ||
                        role === 'legal_service_provider' ||
                        role === 'legal service provider';

                    const isSpecialist = hasDocKeyword || isLegalProviderRole;

                    // Show for now even if not verified (table/grid will show the Badge)
                    // This allows users to see their own profile after registration
                    return isSpecialist;
                });

                setProviders(fetchedProviders);
            }
        } catch (err) {
            console.error("Error fetching providers:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeNav !== 'home') {
            fetchProviders();
        }
    }, [activeNav, filters.state, filters.district, filters.city, filters.experience, filters.search]);

    // Secondary filter for categories in frontend
    const filteredProviders = providers.filter(p => {
        // Match against specialties, specialization, OR the specialized legalDocumentation array
        const rawSpec = p.specialization || (p.practice as any)?.specialization || '';
        const pSpecs = [
            ...(p.specialties || []),
            ...(Array.isArray(rawSpec) ? rawSpec : [String(rawSpec)]),
            ...((p as any).legalDocumentation || [])
        ].filter(Boolean).map(s => String(s).toLowerCase());

        // If no chips selected, filter by activeNav relevance
        if (filters.categories.length === 0) {
            if (activeNav === 'home') return true;

            const navKeywords: Record<string, string[]> = {
                'agreements': ['agreement', 'drafting', 'contract', 'deed', 'nda', 'mou'],
                'affidavits': ['affidavit', 'statement', 'sworn', 'bond'],
                'notices': ['notice', 'legal notice', 'warning', 'demand'],
                'legal-docs': ['documentation', 'legal-docs', 'service', 'advisor', 'will', 'power of attorney', 'trust', 'deed', 'registration', 'legal document', 'statutory']
            };

            const keywords = navKeywords[activeNav] || [];
            if (keywords.length === 0) return true;

            return pSpecs.some(spec => keywords.some(k => spec.includes(k)));
        }
        return filters.categories.some(cat => {
            const lowerCat = cat.toLowerCase();
            return pSpecs.some(spec => {
                const lowerSpec = spec.toLowerCase();
                // Match if spec contains category OR category contains spec (e.g. "Agreement Drafting" vs "Purchase Agreement")
                if (lowerSpec.includes(lowerCat) || lowerCat.includes(lowerSpec)) return true;

                // Special case: if category is a multi-word agreement, and provider has "Agreement" and "Drafting"
                if (lowerCat.includes('agreement') && lowerSpec.includes('agreement')) return true;
                if (lowerCat.includes('notice') && lowerSpec.includes('notice')) return true;
                if (lowerCat.includes('affidavit') && lowerSpec.includes('affidavit')) return true;

                return false;
            });
        });
    });

    useEffect(() => {
        setIsLoaded(true);
        // Task 1: auto-select and scroll based on incoming state
        if (location.state && (location.state as any).serviceId) {
            const sid = (location.state as any).serviceId;
            setActiveNav(sid);
            setTimeout(() => {
                const element = document.getElementById('providers-section');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300);
        }
    }, [location.state]);

    useEffect(() => {
        if (showUpdatePopup) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showUpdatePopup]);

    const navItems = [
        { id: 'home', label: 'Home', icon: <Home size={18} /> },
        { id: 'agreements', label: 'Agreement Drafting', icon: <FileText size={18} /> },
        { id: 'affidavits', label: 'Affidavits', icon: <ClipboardCheck size={18} /> },
        { id: 'notices', label: 'Legal Notices', icon: <Scale size={18} /> },
        { id: 'legal-docs', label: 'Legal Document Services', icon: <ScrollText size={18} /> },
        ...(isLoggedIn ? [
            { id: 'messages', label: 'Messages', icon: <Mail size={18} /> },
            { id: 'activity', label: 'Activity', icon: <ActivityIcon size={18} /> },
            { id: 'cases', label: 'My Cases', icon: <Briefcase size={18} /> },
        ] : [])
    ];

    const currentDetail = serviceDetails[activeNav];
    const isPremium = user?.isPremium || user?.plan === 'Pro' || user?.plan === 'Ultra';

    const renderProviderTable = () => (
        <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
                <table className={styles.providerTable}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Specialist (Name/ID)</th>
                            <th>Location</th>
                            <th>Expertise</th>
                            <th>Exp.</th>
                            <th>License ID</th>
                            <th>Verification</th>
                            <th>Starting Rate</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map((p, index) => {
                            const name = p.name || `${p.firstName} ${p.lastName}`;
                            const location = typeof p.location === 'object' ? (p.location as any).city : p.location;
                            const adv_id = p.unique_id || p.display_id || 'ADV-USER';
                            const license_id = p.licenseId || (p as any).bar_council_id || 'BCI-VERIFIED';
                            const image_url = p.profilePicPath ? formatImageUrl(p.profilePicPath) : p.image_url;

                            return (
                                <tr key={p.unique_id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className={styles.providerInfoCell}>
                                            <img src={image_url} alt="" className={styles.miniAvatar} />
                                            <div>
                                                <div className={styles.pName}>{name}</div>
                                                <div className={styles.pId}>{adv_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{location}</td>
                                    <td>
                                        <div className={styles.tableSpecBadge}>
                                            {activeNav === 'agreements' ? 'Agreement Specialist' :
                                                activeNav === 'affidavits' ? 'Affidavit Specialist' :
                                                    activeNav === 'notices' ? 'Notice Specialist' : 'Doc Specialist'}
                                        </div>
                                    </td>
                                    <td>{p.experience || '10+ yrs'}</td>
                                    <td>{license_id}</td>
                                    <td>
                                        <div className={styles.verifiedTag}>
                                            <CheckCircle2 size={14} /> Verified
                                        </div>
                                    </td>
                                    <td className={styles.rateCell}>₹2,500+</td>
                                    <td>
                                        <div className={styles.ratingCell}>
                                            <Star size={14} fill="#daa520" color="#daa520" />
                                            <span>{p.rating || '4.8'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.tableActions}>
                                            <button
                                                className={styles.tableViewDetail}
                                                onClick={() => setSelectedProvider(p)}
                                                title="View Full Profile"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                className={styles.tableQuickAction}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!isLoggedIn) {
                                                        openAuthModal('login');
                                                    } else {
                                                        try {
                                                            const targetId = String(p.userId?._id || p.userId || p.id || (p as any)._id);
                                                            await interactionService.recordActivity('advocate', targetId, 'interest', String(user?.id));
                                                            alert(`Interest for ${name} recorded!`);
                                                        } catch (err) {
                                                            console.error(err);
                                                        }
                                                    }
                                                }}
                                                title="Send Interest"
                                            >
                                                <Briefcase size={16} />
                                            </button>
                                            <button
                                                className={styles.tableQuickAction}
                                                onClick={(e) => { e.stopPropagation(); !isLoggedIn ? openAuthModal('login') : setChatTarget(p); }}
                                                title="Quick Chat"
                                            >
                                                <MessageCircle size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );



    // Helper logic to get current options based on state/district selection
    // Derived state for dropdown options
    const availableStates = Object.keys(LOCATION_DATA_RAW).sort();

    const availableDistricts = filters.state && LOCATION_DATA_RAW[filters.state]
        ? Object.keys(LOCATION_DATA_RAW[filters.state]).sort()
        : [];

    const availableCities = filters.state && filters.district && LOCATION_DATA_RAW[filters.state][filters.district]
        ? LOCATION_DATA_RAW[filters.state][filters.district].sort()
        : [];

    const renderServiceView = () => {
        if (!currentDetail) return null;

        return (
            <motion.div
                key={activeNav}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.serviceDetailContent}
            >
                <div className={styles.advancedFilterContainer}>
                    <div className={styles.filterBarTop}>
                        <div className={styles.filterInputWrapper}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search specialists..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        {/* STATE FILTER */}
                        <select
                            value={filters.state}
                            onChange={(e) => {
                                setFilters({
                                    ...filters,
                                    state: e.target.value,
                                    district: '', // Reset child filters
                                    city: ''
                                });
                            }}
                            className={styles.filterSelect}
                        >
                            <option value="">All States</option>
                            {availableStates.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>

                        {/* DISTRICT FILTER */}
                        <select
                            value={filters.district}
                            onChange={(e) => {
                                setFilters({
                                    ...filters,
                                    district: e.target.value,
                                    city: '' // Reset child filter
                                });
                            }}
                            className={styles.filterSelect}
                            disabled={!filters.state}
                        >
                            <option value="">{filters.state ? "All Districts" : "Select State First"}</option>
                            {availableDistricts.map(dist => (
                                <option key={dist} value={dist}>{dist}</option>
                            ))}
                        </select>

                        {/* CITY FILTER */}
                        <select
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            className={styles.filterSelect}
                            disabled={!filters.district}
                        >
                            <option value="">{filters.district ? "All Cities" : "Select District First"}</option>
                            {availableCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        <select
                            value={filters.experience}
                            onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                            className={styles.filterSelect}
                        >
                            <option value="">Experience (All)</option>
                            <option value="5">5+ Years</option>
                            <option value="10">10+ Years</option>
                            <option value="15">15+ Years</option>
                        </select>
                        <button className={styles.mainSearchButton}>Search</button>
                    </div>

                    <div className={styles.multiSelectFilterRow}>
                        <div className={styles.multiSelectSection}>
                            <div className={styles.filterHeaderRow}>
                                <div className={styles.filterLabelGroup}>
                                    <h3 className={styles.filterRowLabel}>Select Featured Services:</h3>
                                    {filters.categories.length > 0 && (
                                        <span className={styles.selectionCount}>
                                            ({filters.categories.length} selected)
                                        </span>
                                    )}
                                </div>
                                <div className={styles.secondarySearch}>
                                    <div className={styles.secSearchInput}>
                                        <Search size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search specific services..."
                                            onChange={(e) => { /* local search logic if needed */ }}
                                        />
                                    </div>
                                    <button className={styles.secSearchBtn}>Search</button>
                                </div>
                            </div>
                            <div className={styles.serviceChips}>
                                {currentDetail.categories.map(cat => {
                                    const isActive = filters.categories.includes(cat);
                                    return (
                                        <button
                                            key={cat}
                                            className={`${styles.categoryChip} ${isActive ? styles.chipActive : ''}`}
                                            onClick={() => {
                                                const newCategories = isActive
                                                    ? filters.categories.filter(c => c !== cat)
                                                    : [...filters.categories, cat];
                                                setFilters({ ...filters, categories: newCategories });
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div id="providers-section" className={styles.resultsSection}>
                    <div className={styles.resultsHeader}>
                        <div className={styles.resultsTitleArea}>
                            <h2>Available Specialists</h2>
                            <p>Found {filteredProviders.length} certified specialists for this service</p>
                        </div>
                        <div className={styles.viewToggle}>
                            <button
                                className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.toggleActive : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                Grid View
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.toggleActive : ''}`}
                                onClick={() => setViewMode('table')}
                            >
                                Table View
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                            <Zap className="animate-spin" size={40} color="#daa520" />
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className={styles.providersGrid}>
                                {filteredProviders.length > 0 ? (
                                    filteredProviders.map(p => {
                                        const tId = String(p.userId?._id || p.userId || p.id || (p as any)._id);
                                        const alreadyInterested = sentInteractions.has(tId + ':interest') || sentInteractions.has(tId + ':superInterest');
                                        const alreadyConsulted = sentInteractions.has(tId + ':meet_request');
                                        return (
                                            <ProviderCard
                                                key={p.unique_id}
                                                provider={p}
                                                isLoggedIn={isLoggedIn}
                                                onLogin={() => openAuthModal('login')}
                                                onClick={() => setSelectedProvider(p)}
                                                onChat={(p) => setChatTarget(p)}
                                                onConsult={(p) => setConsultTarget(p)}
                                                isAlreadyInterested={alreadyInterested}
                                                isAlreadyConsulted={alreadyConsulted}
                                                onInteractionSuccess={(type) => {
                                                    setSentInteractions(prev => new Set(prev).add(tId + ':' + type));
                                                }}
                                            />
                                        );
                                    })
                                ) : (
                                    <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                                        <Info size={48} color="#94a3b8" style={{ marginBottom: '20px' }} />
                                        <h3>No Specialists Found</h3>
                                        <p style={{ color: '#94a3b8' }}>Try adjusting your filters or search for {activeNav}.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.tableCard}>
                                <div className={styles.tableWrapper}>
                                    <table className={styles.providerTable}>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Specialist (Name/ID)</th>
                                                <th>Location</th>
                                                <th>Expertise</th>
                                                <th>Exp.</th>
                                                <th>License ID</th>
                                                <th>Verification</th>
                                                <th>Starting Rate</th>
                                                <th>Rating</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProviders.map((p, index) => {
                                                const name = p.name || `${p.firstName} ${p.lastName}`;
                                                const locationStr = typeof p.location === 'object' ? (p.location as any).city : p.location;
                                                const adv_id = p.unique_id || p.display_id || 'ADV-USER';
                                                const license_id = p.licenseId || (p as any).bar_council_id || 'BCI-VERIFIED';
                                                const image_url = p.profilePicPath ? formatImageUrl(p.profilePicPath) : p.image_url;
                                                const isVerified = (p as any).verified === true;

                                                return (
                                                    <tr key={p.unique_id} onClick={() => setSelectedProvider(p)} style={{ cursor: 'pointer' }}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <div className={styles.providerInfoCell}>
                                                                <img src={image_url} alt="" className={styles.miniAvatar} />
                                                                <div>
                                                                    <div className={styles.pName}>{name}</div>
                                                                    <div className={styles.pId}>{adv_id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{locationStr}</td>
                                                        <td>
                                                            <div className={styles.tableSpecBadge}>
                                                                {p.specialization || (p.practice as any)?.specialization || 'Specialist'}
                                                            </div>
                                                        </td>
                                                        <td>{p.experience || '10+ yrs'}</td>
                                                        <td>{license_id}</td>
                                                        <td>
                                                            {isVerified ? (
                                                                <div className={styles.verifiedTag}>
                                                                    <CheckCircle2 size={14} /> Verified
                                                                </div>
                                                            ) : (
                                                                <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                                    <Clock size={14} /> Pending
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className={styles.rateCell}>₹2,500+</td>
                                                        <td>
                                                            <div className={styles.ratingCell}>
                                                                <Star size={14} fill="#daa520" color="#daa520" />
                                                                <span>{p.rating || '4.8'}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className={styles.tableActions}>
                                                                <button
                                                                    className={styles.tableViewDetail}
                                                                    onClick={() => setSelectedProvider(p)}
                                                                >
                                                                    View
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </motion.div>
        );
    };

    const renderPaymentModal = (p: Advocate) => {
        const baseRate = 2500; // Simulated static rate or p.hourly_rate
        const platformFee = Math.round(baseRate * 0.19);
        const total = baseRate + platformFee;

        return (
            <div className={styles.popupOverlay} onClick={() => setPayingFor(null)}>
                <motion.div
                    className={styles.paymentModal}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className={styles.popupHeader}>
                        <h3>Service Payment</h3>
                        <button onClick={() => setPayingFor(null)}><X size={20} /></button>
                    </div>
                    <div className={styles.paymentContent}>
                        <div className={styles.paymentProviderInfo}>
                            <img src={p.profilePicPath ? formatImageUrl(p.profilePicPath) : p.image_url} alt="" />
                            <div>
                                <h4>{p.name || 'Specialist'}</h4>
                                <p>Legal Document Specialist</p>
                            </div>
                        </div>
                        <div className={styles.feeBreakdown}>
                            <div className={styles.feeRow}>
                                <span>Service Charges</span>
                                <span>₹{baseRate.toLocaleString()}</span>
                            </div>
                            <div className={styles.feeRow}>
                                <span>Platform Fee (19%)</span>
                                <span>₹{platformFee.toLocaleString()}</span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Total Amount</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                        <button
                            className={styles.payNowBtn}
                            onClick={() => {
                                alert(`Payment of ₹${total.toLocaleString()} successful! 19% platform fee (₹${platformFee.toLocaleString()}) has been deducted.`);
                                setPayingFor(null);
                            }}
                        >
                            <CreditCard size={18} /> Pay Now (₹{total.toLocaleString()})
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    };

    const renderMessagesView = () => {
        // Step 1: Group all communication activities by Partner ID
        const partnersMap = new Map<string, any[]>();
        allActivities.forEach(act => {
            const pid = act.partnerUserId;
            const isMsg = act.type === 'chat' || act.type === 'message_sent' || act.type === 'call' || act.type === 'meet_request';
            if (isMsg) {
                if (!partnersMap.has(pid)) partnersMap.set(pid, []);
                partnersMap.get(pid)!.push(act);
            }
        });

        // Step 2: Determine "Best State" for messages
        const deduplicated = Array.from(partnersMap.values()).map(acts => {
            // Priority: Call > Accepted > Sent/Received
            const call = acts.find(a => a.type === 'call' || a.type === 'meet_request');
            if (call) return { ...call, bestMsgTab: 'calls' };

            const accepted = acts.find(a => a.status === 'accepted');
            if (accepted) return { ...accepted, bestMsgTab: 'accepted' };

            const received = acts.find(a => !a.isSender);
            if (received) return { ...received, bestMsgTab: 'received' };

            return { ...acts[0], bestMsgTab: 'sent' };
        });

        const filtered = deduplicated.filter(act => {
            if (activeSubNav === 'calls') {
                if (act.bestMsgTab !== 'calls') return false;
                if (activeCallSubTab === 'all') return true;
                const cType = String(act.details?.callType || '').toLowerCase();
                if (activeCallSubTab === 'voice') return cType === 'voice' || cType === 'audio' || cType === '';
                if (activeCallSubTab === 'video') return cType === 'video';
                return false;
            }
            return act.bestMsgTab === activeSubNav;
        });

        return (
            <motion.div className={styles.dashboardView} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={styles.dashboardHeader}>
                    <h2>Messages & Communications</h2>
                    <div className={styles.subTabNav}>
                        <button className={activeSubNav === 'sent' ? styles.subTabActive : ''} onClick={() => setActiveSubNav('sent')}><Send size={14} /> Sent</button>
                        <button className={activeSubNav === 'received' ? styles.subTabActive : ''} onClick={() => setActiveSubNav('received')}><Inbox size={14} /> Received</button>
                        <button className={activeSubNav === 'accepted' ? styles.subTabActive : ''} onClick={() => setActiveSubNav('accepted')}><CheckCircle2 size={14} /> Accepted</button>
                        <button className={activeSubNav === 'calls' ? styles.subTabActive : ''} onClick={() => setActiveSubNav('calls')}><Phone size={14} /> Calls</button>
                    </div>
                </div>

                {activeSubNav === 'calls' && (
                    <div className={styles.subTabNav} style={{ marginTop: '-20px', marginBottom: '40px', background: 'rgba(255,255,255,0.01)' }}>
                        <button className={activeCallSubTab === 'all' ? styles.subTabActive : ''} onClick={() => setActiveCallSubTab('all')}>All Calls</button>
                        <button className={activeCallSubTab === 'voice' ? styles.subTabActive : ''} onClick={() => setActiveCallSubTab('voice')}>Voice</button>
                        <button className={activeCallSubTab === 'video' ? styles.subTabActive : ''} onClick={() => setActiveCallSubTab('video')}>Video</button>
                    </div>
                )}

                <div className={activeSubNav === 'calls' ? styles.callList : styles.messageList}>
                    {filtered.length > 0 ? filtered.map(act => {
                        const isCall = activeSubNav === 'calls';
                        const time = new Date(act.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const date = new Date(act.timestamp || Date.now()).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const advObj = {
                            id: act.partnerUserId,
                            unique_id: act.partnerUniqueId,
                            name: act.partnerName,
                            image_url: act.partnerImg,
                            location: act.partnerLocation || 'Verified Zone'
                        } as any;

                        if (isCall) {
                            return (
                                <div key={act._id} className={styles.callItem}>
                                    <img
                                        src={act.partnerImg ? formatImageUrl(act.partnerImg) : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                                        className={styles.callAvatar}
                                        onClick={(e) => { e.stopPropagation(); handlePartnerProfilePopup(act.partnerUserId, act.partnerUniqueId, act); }}
                                        alt=""
                                    />
                                    <div className={styles.messageInfo}>
                                        <div className={styles.messageTop}>
                                            <span className={styles.messageName} onClick={(e) => { e.stopPropagation(); handlePartnerProfilePopup(act.partnerUserId, act.partnerUniqueId, act); }}>
                                                {act.partnerName}
                                            </span>
                                        </div>
                                        <div className={styles.callStatusGroup}>
                                            <span className={styles.messageMeta}>{act.partnerUniqueId}</span>
                                            <span className={styles.messageMeta}>•</span>
                                            <span className={`${styles.callStatusLabel} ${act.isSender ? styles.outgoing : styles.incoming}`}>
                                                {act.isSender ? <Phone size={10} style={{ transform: 'rotate(135deg)' }} /> : <Phone size={10} />}
                                                {act.isSender ? 'OUTGOING' : 'INCOMING'}
                                            </span>
                                        </div>
                                        <div className={styles.callTypeDesc}>
                                            <Phone size={14} />
                                            <span>{act.details?.callType === 'video' ? 'VIDEO CALL' : 'AUDIO CALL'} - {act.status === 'accepted' ? 'COMPLETED' : 'RINGING'}</span>
                                        </div>
                                    </div>

                                    <div className={styles.messageTime} style={{ position: 'static', marginRight: '40px', color: '#64748b' }}>
                                        {date}, {time}
                                    </div>

                                    <div className={styles.callActions}>
                                        <button className={styles.callActionBtn} title="Audio Call" onClick={(e) => { e.stopPropagation(); setConsultTarget(advObj); }}><Phone size={22} strokeWidth={2.5} color="#facc15" /></button>
                                        <button className={styles.callActionBtn} title="Video Call" onClick={(e) => { e.stopPropagation(); setConsultTarget(advObj); }}><Video size={22} strokeWidth={2.5} color="#facc15" /></button>
                                        <button className={styles.callActionBtn} title="Deep Chat" onClick={(e) => { e.stopPropagation(); setChatTarget(advObj); }}><MessageCircle size={22} strokeWidth={2.5} color="#facc15" /></button>
                                        <button className={styles.callActionBtn} title="Schedule" onClick={(e) => { e.stopPropagation(); }}><Clock size={22} strokeWidth={2.5} color="#facc15" /></button>
                                        <button className={styles.callActionBtn} title="Information" onClick={(e) => { e.stopPropagation(); handlePartnerProfilePopup(act.partnerUserId, act.partnerUniqueId, act); }}><Info size={22} strokeWidth={2.5} color="#facc15" /></button>
                                    </div>
                                </div>
                            );
                        }

                        // Message List UI
                        return (
                            <div key={act._id} className={styles.messageItem} onClick={() => setChatTarget(advObj)}>
                                <img
                                    src={act.partnerImg ? formatImageUrl(act.partnerImg) : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                                    className={styles.messageAvatar}
                                    onClick={(e) => { e.stopPropagation(); handlePartnerProfilePopup(act.partnerUserId, act.partnerUniqueId, act); }}
                                    alt=""
                                />
                                <div className={styles.messageInfo}>
                                    <div className={styles.messageTop}>
                                        <span className={styles.messageName} onClick={(e) => { e.stopPropagation(); handlePartnerProfilePopup(act.partnerUserId, act.partnerUniqueId, act); }}>
                                            {act.partnerName}
                                        </span>
                                    </div>
                                    <div className={styles.messageMeta}>
                                        <span>{act.partnerUniqueId}</span>
                                        <span>•</span>
                                        <span>{act.partnerLocation || 'Nagari Andhra Pradesh'}</span>
                                    </div>
                                    <div className={styles.messagePreview}>
                                        {act.message || act.lastMessage || (act.type === 'interest' ? 'Expressed interest in your profile' : 'Started a conversation')}
                                    </div>
                                </div>
                                <div className={styles.messageTime}>{time}</div>
                            </div>
                        );
                    }) : (
                        <div className={styles.noActivity}>No items found in {activeSubNav} messages.</div>
                    )}
                </div>
            </motion.div>
        );
    };

    const renderActivityView = () => {
        // Step 1: Group all activities by Partner ID
        const partnersMap = new Map<string, any[]>();
        allActivities.forEach(act => {
            const pid = act.partnerUserId;
            if (!partnersMap.has(pid)) partnersMap.set(pid, []);
            partnersMap.get(pid)!.push(act);
        });

        // Step 2: Determine "Best State" for each partner across Activity view
        const deduplicated = Array.from(partnersMap.values()).map(acts => {
            // Priority: Case > Accepted (Interest) > Consultation > Interest (Pending) > Shortlisted
            const caseAct = acts.find(a => String(a.type).startsWith('case_'));
            if (caseAct) return { ...caseAct, bestActTab: 'cases' };

            const accepted = acts.find(a => a.status === 'accepted' && a.isSender && a.type === 'interest');
            if (accepted) return { ...accepted, bestActTab: 'accepted' };

            const consult = acts.find(a => a.type === 'meet_request' || a.type === 'consultation');
            if (consult) return { ...consult, bestActTab: 'consultation' };

            const interest = acts.find(a => a.isSender && a.type === 'interest');
            if (interest) return { ...interest, bestActTab: 'interest' };

            const shortlist = acts.find(a => a.type === 'shortlist');
            if (shortlist) return { ...shortlist, bestActTab: 'shortlisted' };

            return { ...acts[0], bestActTab: 'interest' };
        });

        const filtered = deduplicated.filter(act => act.bestActTab === activeSubNav);

        return (
            <motion.div className={styles.dashboardView} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={styles.dashboardHeader}>
                    <h2>Your Legal Activity</h2>
                    <div className={styles.subTabNav}>
                        <button className={activeSubNav === 'interest' ? styles.subTabActive : ''} onClick={() => setActiveSubNav('interest')}><Handshake size={14} /> Interest Sent</button>
                        <button className={activeSubNav === 'accepted' ? styles.subTabActive : ''} onClick={() => setActiveSubNav('accepted')}><CheckCircle2 size={14} /> Accepted</button>
                        <button className={activeSubNav === 'cases' ? styles.subTabActive : ''} onClick={() => setActiveSubNav('cases')}><Briefcase size={14} /> Cases</button>
                        <button className={activeSubNav === 'shortlisted' ? styles.subTabActive : ''} onClick={() => setActiveSubNav('shortlisted')}><Bookmark size={14} /> Shortlisted</button>
                        <button className={activeSubNav === 'consultation' ? styles.subTabActive : ''} onClick={() => setActiveSubNav('consultation')}><Clock size={14} /> Consultation</button>
                    </div>
                </div>

                <div className={styles.activityGrid}>
                    {filtered.length > 0 ? filtered.map(act => (
                        <div key={act._id} className={styles.activityCard} onClick={() => handlePartnerProfilePopup(act.partnerUserId, act.partnerUniqueId, act)} style={{ cursor: 'pointer' }}>
                            <div className={styles.activityImageWrapper}>
                                <img src={act.partnerImg ? formatImageUrl(act.partnerImg) : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className={styles.activityImage} alt="" />
                                <div className={styles.activityTypeBadge}>{act.status || act.type}</div>
                            </div>
                            <div className={styles.activityCardContent}>
                                <div>
                                    <h4>{act.partnerName}</h4>
                                    <div className={styles.activitySub}>
                                        <span className={styles.pIdSmall}>{act.partnerUniqueId}</span>
                                        <span className={styles.pLocSmall}><MapPin size={10} /> {act.partnerLocation || 'Authorized Zone'}</span>
                                    </div>
                                    <span className={styles.activityDate}>{new Date(act.timestamp || Date.now()).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.activityFooter}>
                                    {act.status === 'accepted' ? (
                                        <>
                                            <button
                                                className={styles.caseRequestBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const mockAdv: any = {
                                                        id: act.partnerUserId,
                                                        userId: { _id: act.partnerUserId },
                                                        name: act.partnerName,
                                                        unique_id: act.partnerUniqueId,
                                                        image_url: act.partnerImg,
                                                        location: act.partnerLocation
                                                    };
                                                    setCreateCaseTarget(mockAdv);
                                                }}
                                            >
                                                <Briefcase size={14} /> Case Request
                                            </button>
                                            {activeSubNav !== 'consultation' && (
                                                <button
                                                    className={styles.consultTabBtn}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const mockAdv: any = {
                                                            id: act.partnerUserId,
                                                            name: act.partnerName,
                                                            unique_id: act.partnerUniqueId,
                                                            image_url: act.partnerImg,
                                                            location: act.partnerLocation
                                                        };
                                                        setConsultTarget(mockAdv);
                                                    }}
                                                >
                                                    <Phone size={14} /> Consult
                                                </button>
                                            )}
                                            <button
                                                className={styles.chatTabBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const mockAdv: any = {
                                                        id: act.partnerUserId,
                                                        name: act.partnerName,
                                                        unique_id: act.partnerUniqueId,
                                                        image_url: act.partnerImg,
                                                        location: act.partnerLocation
                                                    };
                                                    setChatTarget(mockAdv);
                                                }}
                                            >
                                                <MessageCircle size={14} /> Chat
                                            </button>
                                        </>
                                    ) : (
                                        <button className={styles.viewDetailsBtn} onClick={(e) => { e.stopPropagation(); handlePartnerProfilePopup(act.partnerUserId, act.partnerUniqueId, act); }}>Details</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className={styles.noActivity}>No items found in {activeSubNav}.</div>
                    )}
                </div>
            </motion.div>
        );
    };
    const handleCasePayment = async (caseData: any) => {
        try {
            // Simulated Test Payment Flow
            alert("Switching to Test Payment Mode...");

            // Just directly call verify-payment with mock data
            const verifyRes = await api.post(`/cases/${caseData._id}/verify-payment`, {
                rzp_payment_id: "test_pay_" + Date.now(),
                rzp_order_id: "test_order_" + Date.now(),
                rzp_signature: "test_sig_mock"
            });

            if (verifyRes.data.success) {
                alert("Payment Successful (TEST MODE)! Case is now FUNDED. The advisor can now begin the work.");
                fetchAllCases();
                if (detailCase?._id === caseData._id) {
                    setDetailCase({ ...caseData, status: 'Funded' });
                }
            }
        } catch (err: any) {
            console.error("Payment error:", err);
            alert(err.message || "Failed to process payment");
        }
    };

    const renderCasesView = () => {
        const isClient = user?.role?.toLowerCase() === 'client';

        return (
            <motion.div
                className={styles.casesView}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className={styles.casesHeader}>
                    <h2>Legal Service Cases</h2>
                    <p>Track your active work, payments, and deliverables.</p>
                </div>

                <div className={styles.casesGrid}>
                    {allCases.length > 0 ? allCases.map(c => {
                        const partner = isClient ? c.advocateId : c.clientId;
                        const partnerName = partner?.name || "Advisor";
                        const status = c.status || 'Requested';

                        return (
                            <motion.div
                                key={c._id}
                                className={styles.caseCard}
                                whileHover={{ y: -5 }}
                                onClick={() => setDetailCase(c)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={styles.caseCardHeader}>
                                    <div className={styles.caseTypeBadge}>{c.category}</div>
                                    <div className={`${styles.statusBadge} ${styles['status' + status.replace(/\s/g, '')]}`}>
                                        {status}
                                    </div>
                                </div>
                                <h3 className={styles.caseTitle}>{c.title}</h3>
                                <p className={styles.caseDesc}>{c.description}</p>

                                {!isClient && status === 'Funded' && (
                                    <div className={styles.payoutAlert} style={{ marginBottom: '15px' }}>
                                        <Shield size={16} />
                                        <span>Payment received in escrow. Payout will be released after client approval.</span>
                                    </div>
                                )}

                                {!isClient && status === 'Completed' && (
                                    <div className={styles.payoutAlert} style={{ marginBottom: '15px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>
                                        <Info size={16} />
                                        <span>Payout initiated to your bank account. Processing may take 2–3 hours.</span>
                                    </div>
                                )}

                                <div className={styles.caseMeta}>
                                    <div className={styles.metaItem}>
                                        <Clock size={14} />
                                        <span>Updated: {new Date(c.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <Shield size={14} />
                                        <span>Case ID: {c.caseId}</span>
                                    </div>
                                </div>

                                <div className={styles.casePartition} />

                                <div className={styles.caseFooter}>
                                    <div className={styles.partnerInfo}>
                                        <img src={partner?.image_url || '/default-avatar.png'} alt="" />
                                        <div>
                                            <span className={styles.pLabel}>{isClient ? 'Dedicated Advisor' : 'Client'}</span>
                                            <span className={styles.pName}>{partnerName}</span>
                                        </div>
                                    </div>

                                    <div className={styles.caseActions} onClick={(e) => e.stopPropagation()}>
                                        <button className={styles.viewDetailsBtn} onClick={(e) => { e.stopPropagation(); setDetailCase(c); }}>Details</button>

                                        {isClient && status === 'Quoted' && (
                                            <button className={styles.payEscrowBtn} onClick={(e) => { e.stopPropagation(); handleCasePayment(c); }}>
                                                Accept & Pay (₹{c.paymentInfo?.totalPaid || 0})
                                            </button>
                                        )}

                                        {isClient && (status === 'Delivered' || status === 'Revision Requested') && (
                                            <>
                                                <button className={styles.approveBtn} onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm("Are you satisfied with the work provided? Clicking OK will release the escrow payment to the advisor and close the case. Proceed?")) {
                                                        const res: any = await api.post(`/cases/${c._id}/complete`);
                                                        alert(res.data.message || "All Good, Done! Case has been closed successfully. Thank you for using E-Advocate.");
                                                        fetchAllCases();
                                                    }
                                                }}>
                                                    All Good, Done! Close Case
                                                </button>
                                                {status === 'Delivered' && (
                                                    <button className={styles.rejectBtn} style={{ background: 'rgba(239, 68, 68, 0.05)' }} onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const reason = prompt("Describe what needs to be changed:");
                                                        if (reason) {
                                                            await api.post(`/cases/${c._id}/revision`, { reason });
                                                            alert("Revision request sent to advisor.");
                                                            fetchAllCases();
                                                        }
                                                    }}>
                                                        Request Revision
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {!isClient && status === 'Requested' && (
                                            <>
                                                <button className={styles.approveBtn} onClick={async (e) => {
                                                    e.stopPropagation();
                                                    await api.post(`/cases/${c._id}/accept`);
                                                    alert("Case accepted! Please send a quote now.");
                                                    fetchAllCases();
                                                }}>Accept</button>
                                                <button className={styles.rejectBtn} onClick={async (e) => {
                                                    e.stopPropagation();
                                                    const reason = prompt("Basis for rejection?");
                                                    if (reason) {
                                                        await api.post(`/cases/${c._id}/reject`, { reason });
                                                        alert("Case rejected.");
                                                        fetchAllCases();
                                                    }
                                                }}>Reject</button>
                                            </>
                                        )}

                                        {!isClient && status === 'Accepted' && (
                                            <button className={styles.quoteBtn} onClick={(e) => { e.stopPropagation(); setQuotingCase(c); }}>
                                                Construct Quote
                                            </button>
                                        )}

                                        {!isClient && (status === 'Funded' || status === 'In Progress' || status === 'Revision Requested') && (
                                            <button className={styles.deliverBtn} style={{ background: '#a855f7', color: '#fff' }} onClick={() => setDeliveringCase(c)}>
                                                Proceed to Submit Service Documents
                                            </button>
                                        )}

                                        <button className={styles.viewDocBtn} style={{ borderColor: 'rgba(255,255,255,0.1)' }} onClick={() => setChatTarget(partner)}>Chat</button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className={styles.noCases}>
                            <Briefcase size={48} />
                            <h3>No Active Cases</h3>
                            <p>Once you raise a case request from an advisor's profile, it will appear here.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    const renderHomeView = () => (
        <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <section className={styles.hero}>
                <motion.div
                    className={styles.heroContent}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className={styles.badge}>PREMIUM SERVICES</span>
                    <h1 className={styles.title}>Welcome to Our <span className={styles.highlight}>Premium</span> Legal Platform</h1>
                    <p className={styles.subtitle}>
                        We offer ultra-luxury legal documentation services, ensuring compliance with Bar Council of India (BCI) norms.
                        Our fees are reasonable and based on market values.
                    </p>
                    <div className={styles.heroStats}>
                        <div className={styles.statItem}><h3>10k+</h3> <p>Documents Drafted</p></div>
                        <div className={styles.statItem}><h3>500+</h3> <p>Verified Experts</p></div>
                        <div className={styles.statItem}><h3>24/7</h3> <p>Legal Support</p></div>
                    </div>
                </motion.div>
            </section>

            <section className={styles.servicesGrid}>
                {documentationServices.map((service, index) => (
                    <React.Fragment key={service.id}>
                        {/* ================= SERVICE CARD ================= */}
                        <motion.div
                            className={styles.serviceCard}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -6 }}
                            whileTap={{ scale: 0.98 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                setIsLoaded(false);
                                setActiveNav(service.id);
                                setTimeout(() => setIsLoaded(true), 100);
                                contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    setIsLoaded(false);
                                    setActiveNav(service.id);
                                    setTimeout(() => setIsLoaded(true), 100);
                                    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                                }
                            }}
                        >
                            {/* ---------- Header ---------- */}
                            <div className={styles.cardHeader}>
                                <div className={styles.headerLeft}>
                                    <div className={styles.iconWrapper}>{service.icon}</div>
                                    <h2 className={styles.cardTitle}>{service.title}</h2>
                                </div>
                            </div>

                            {/* ---------- Content ---------- */}
                            <div className={styles.cardMainGrid}>
                                <div className={styles.cardInfoCol}>
                                    <p className={styles.cardDescription}>{service.description}</p>

                                    {/* Ideal For */}
                                    <div className={styles.idealForList}>
                                        <span className={styles.label}>Ideal For:</span>
                                        <div className={styles.tagGroup}>
                                            {service.idealFor.map((item: string) => (
                                                <span key={item} className={styles.tag}>{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardDetailsCol}>
                                    <div className={styles.detailsSubGrid}>
                                        <div className={styles.detailsGroup}>
                                            <h4>Key Features</h4>
                                            <div className={styles.featuresList}>
                                                {service.features.map((feature: string) => (
                                                    <div key={feature} className={styles.featureItem}>
                                                        <CheckCircle2 size={16} className={styles.checkIcon} />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.detailsGroup}>
                                            <h4>Deliverables</h4>
                                            <div className={styles.featuresList}>
                                                {service.deliverables.map((item: string) => (
                                                    <div key={item} className={styles.featureItem}>
                                                        <Briefcase size={16} className={styles.deliverableIcon} />
                                                        <span>{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ---------- SERVICES COVERED PREVIEW ---------- */}
                            <div className={styles.servicesPreview}>
                                <h4 className={styles.servicesTitle}>Services Covered</h4>
                                <div className={styles.servicesChips}>
                                    {service.serviceOptions.map((opt: string) => (
                                        <span key={opt} className={styles.serviceChip}>
                                            <Bookmark size={12} />
                                            {opt}
                                        </span>
                                    ))}

                                    {service.serviceOptions.length > 6 && (
                                        <span className={styles.moreChip}>
                                            +{service.serviceOptions.length - 6} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ---------- CTA ---------- */}
                            <button
                                type="button"
                                className={styles.learnMoreBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLoaded(false);
                                    setActiveNav(service.id);
                                    setTimeout(() => setIsLoaded(true), 100);
                                    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            >
                                Explore Full Service Details & Specialists
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>

                        {/* ================= FULL SERVICES PANEL ================= */}
                        <AnimatePresence>
                            {activeNav === service.id && isLoaded && (
                                <motion.div
                                    className={styles.fullServicesPanel}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <h3 className={styles.panelTitle}>
                                        Complete List of {service.title}
                                    </h3>

                                    <div className={styles.fullServicesGrid}>
                                        {service.serviceOptions.map((opt: string) => (
                                            <div key={opt} className={styles.fullServiceItem}>
                                                <CheckCircle2 size={16} />
                                                <span>{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </React.Fragment>
                ))}
            </section>


            {/* NEW DETAILED 2x2 GRID SECTION */}
            <section className={styles.detailedGridSection}>
                <h2>Comprehensive Legal Drafting Solutions</h2>
                <div className={styles.detailedGrid}>
                    <div className={styles.detailedCard}>
                        <h3>Agreement Drafting Services</h3>
                        <p>
                            From business contracts to personal property tokens, we ensure every clause is legally bulletproof.
                            Our experts specialize in Indian Contract Act compliance, protecting your interests in every transaction.
                        </p>
                        <button
                            className={styles.detailedLearnMore}
                            onClick={() => {
                                setActiveNav('agreements');
                                contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            View Agreement Specialists <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className={styles.detailedCard}>
                        <h3>Affidavit Drafting Services</h3>
                        <p>
                            Get your facts legally sworn and verified. We handle all types of personal and court-related affidavits,
                            ensuring they meet the strictest evidentiary standards for government and judicial submissions.
                        </p>
                        <button
                            className={styles.detailedLearnMore}
                            onClick={() => {
                                setActiveNav('affidavits');
                                contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            View Affidavit Specialists <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className={styles.detailedCard}>
                        <h3>Legal Notice Drafting Services</h3>
                        <p>
                            Assert your rights with strategic legal communication. Our advocates draft high-impact notices
                            that initiate legal action or facilitate settlements, covering recovery, eviction, and contract breaches.
                        </p>
                        <button
                            className={styles.detailedLearnMore}
                            onClick={() => {
                                setActiveNav('notices');
                                contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            View Notice Specialists <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className={styles.detailedCard}>
                        <h3>Legal Document Preparation Services</h3>
                        <p>
                            Advanced preparation for complex legal documents including Wills, Power of Attorney, and Trust Deeds.
                            We guide you through the registration process and ensure state-specific stamp duty compliance.
                        </p>
                        <button
                            className={styles.detailedLearnMore}
                            onClick={() => {
                                setActiveNav('legal-docs');
                                contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            View Document Specialists <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            <section className={styles.benefitsSection}>
                <div className={styles.benefitsContainer}>
                    <div className={styles.benefitBox}>
                        <h3>Reasonable Pricing</h3>
                        <p>Transparent and fixed pricing for all documentation services.</p>
                    </div>
                    <div className={styles.benefitBox}>
                        <h3>BCI Norm Compliance</h3>
                        <p>All documents are drafted according to latest Bar Council guidelines.</p>
                    </div>
                    <div className={styles.benefitBox}>
                        <h3>Expert Verification</h3>
                        <p>Every document is reviewed by senior legal professionals.</p>
                    </div>
                    <div className={styles.benefitBox}><h3>Fast Delivery</h3><p>Get your digital copies within 24-48 hours of verification.</p></div>
                </div>
            </section>
        </motion.div>
    );

    return (
        <div className={`${styles.pageContainer} ${isEmbedded ? styles.embeddedMode : styles.publicView}`}>
            {!isLoggedIn && !isEmbedded && (
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        zIndex: 100
                    }}
                >
                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Home
                </button>
            )}
            <div className={styles.navBackground}>
                <nav className={styles.subNavBar}>
                    <div className={styles.subNavBarInner}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                className={`${styles.subNavButton} ${activeNav === item.id ? styles.subNavButtonActive : ''}`}
                                onClick={() => {
                                    setIsLoaded(false);
                                    setActiveNav(item.id);
                                    if (item.id === 'messages') setActiveSubNav('sent');
                                    if (item.id === 'activity') setActiveSubNav('interest');
                                    setTimeout(() => setIsLoaded(true), 100);
                                    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                <span className={styles.subNavIcon}>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>
            </div>

            <div className={styles.mainContent} ref={contentRef}>
                <AnimatePresence mode="wait">
                    {activeNav === 'home' ? renderHomeView() :
                        activeNav === 'messages' ? renderMessagesView() :
                            activeNav === 'activity' ? renderActivityView() :
                                activeNav === 'cases' ? renderCasesView() :
                                    (isLoaded && renderServiceView())}
                </AnimatePresence>

                {(activeNav === 'home' || !['messages', 'activity'].includes(activeNav)) && (
                    <div className={styles.taskExtensions}>
                        <section className={styles.bottomSupportSection}>
                            <div className={styles.supportGrid}>
                                <div className={styles.queryFormCard}>
                                    <h3>Submit a Legal Query</h3>
                                    <p>Our experts will get back to you within 24 hours.</p>
                                    <form className={styles.supportForm} onSubmit={handleQuerySubmit}>
                                        <div className={styles.formRow}>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={queryForm.name}
                                                onChange={(e) => setQueryForm({ ...queryForm, name: e.target.value })}
                                                required
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={queryForm.phone}
                                                onChange={(e) => setQueryForm({ ...queryForm, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={queryForm.email}
                                            onChange={(e) => setQueryForm({ ...queryForm, email: e.target.value })}
                                            required
                                        />
                                        <textarea
                                            placeholder="Describe your legal requirement or query..."
                                            rows={4}
                                            value={queryForm.message}
                                            onChange={(e) => setQueryForm({ ...queryForm, message: e.target.value })}
                                            required
                                        ></textarea>
                                        <button
                                            type="submit"
                                            className={styles.formSubmitBtn}
                                            disabled={submittingQuery}
                                        >
                                            {submittingQuery ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </form>
                                </div>

                                <div className={styles.fraudAlertCard}>
                                    <div className={styles.alertHeader}>
                                        <div className={styles.alertIcon}><Zap size={32} /></div>
                                        <h3>Fraud Alert & Safety</h3>
                                    </div>
                                    <div className={styles.alertContent}>
                                        <p className={styles.warningText}>
                                            <strong>Important:</strong> E-Advocate Services never asks for sensitive otp or bank details over phone.
                                            Always verify the advocate's unique ID on our portal before making any payments.
                                        </p>
                                        <ul className={styles.safetyList}>
                                            <li>Pay only through secured gateway.</li>
                                            <li>Ask for a digitally signed receipt.</li>
                                            <li>Report suspicious activity immediately.</li>
                                        </ul>
                                        <div className={styles.contactDetails}>
                                            <div className={styles.contactItem}>
                                                <Clock size={18} />
                                                <span>Support:+91 70937 04706

                                                </span>
                                            </div>
                                            <div className={styles.contactItem}>
                                                <MessageCircle size={18} />
                                                <span>Email: support@tatitoprojects.com



                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
            {/* NEW POPUPS */}
            <AnimatePresence>
                {chatTarget && (
                    <ChatPopup
                        provider={chatTarget}
                        service={currentDetail?.title || 'General Legal Inquiry'}
                        onClose={() => setChatTarget(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {consultTarget && (
                    <ConsultationPopup
                        provider={consultTarget}
                        service={currentDetail?.title || 'General Legal Consultation'}
                        onClose={() => setConsultTarget(null)}
                        onInteractionSuccess={(type) => {
                            const tId = String((consultTarget as any).userId?._id || (consultTarget as any).userId || consultTarget.id || (consultTarget as any)._id);
                            setSentInteractions(prev => new Set(prev).add(tId + ':' + type));
                        }}
                    />
                )}
            </AnimatePresence>

            {/* DETAILED PROFILE MODAL */}
            <AnimatePresence>
                {selectedProvider && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedProvider(null)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ y: 50, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 50, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.closeModal} onClick={() => setSelectedProvider(null)}>
                                <ChevronDown size={28} />
                            </button>

                            <div style={{ padding: '60px' }}>
                                {/* Detailed Profile View for All Users */}
                                <div style={{ display: 'flex', gap: '40px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={selectedProvider.profilePicPath ? formatImageUrl(selectedProvider.profilePicPath) : selectedProvider.image_url}
                                            style={{ width: '220px', height: '220px', borderRadius: '24px', objectFit: 'cover', border: '2px solid rgba(218, 165, 32, 0.3)' }}
                                            alt={selectedProvider.name}
                                        />
                                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#daa520', color: '#000', padding: '5px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>
                                            {selectedProvider.unique_id || 'VERIFIED'}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h1 style={{ fontSize: '3.5rem', fontFamily: 'Playfair Display', margin: 0, color: '#fff' }}>
                                                    {selectedProvider.name || `${selectedProvider.firstName} ${selectedProvider.lastName}`}
                                                </h1>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                                                    <p style={{ color: '#daa520', fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                                                        {selectedProvider.specialization || (selectedProvider.practice as any)?.specialization || 'Legal Specialist'}
                                                    </p>
                                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }}></span>
                                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>
                                                        <MapPin size={14} style={{ marginRight: '5px' }} />
                                                        {typeof selectedProvider.location === 'object' ? (selectedProvider.location as any).city : selectedProvider.location}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>{selectedProvider.experience || '12+'}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#daa520', fontWeight: '900', textTransform: 'uppercase' }}>Years Experience</div>
                                            </div>
                                        </div>

                                        <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginTop: '20px', maxWidth: '800px' }}>
                                            {selectedProvider.bio || 'Professional legal consultant specializing in comprehensive documentation, contract drafting, and statutory compliance. Committed to providing precise and legally bulletproof solutions for corporate and individual clients.'}
                                        </p>

                                        {/* Premium Multi-Specialization Tags */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
                                            {(selectedProvider.specialties || [selectedProvider.specialization || 'Documentation']).map((spec: string) => (
                                                <span key={spec} style={{ background: 'rgba(218, 165, 32, 0.1)', border: '1px solid rgba(218, 165, 32, 0.2)', color: '#daa520', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Scheduled Consultation Details */}
                                        {selectedInteraction?.metadata?.meetingDetails && (
                                            <div style={{
                                                marginTop: '25px',
                                                padding: '20px',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(16, 185, 129, 0.2)'
                                            }}>
                                                <div style={{ fontWeight: 800, color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                                                    <Calendar size={18} /> Scheduled Consultation
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    <div>
                                                        <span style={{ display: 'block', color: '#64748b', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>Mode</span>
                                                        <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{selectedInteraction.metadata.meetingDetails.type}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ display: 'block', color: '#64748b', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>When</span>
                                                        <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{selectedInteraction.metadata.meetingDetails.date} at {selectedInteraction.metadata.meetingDetails.time}</span>
                                                    </div>
                                                    <div style={{ gridColumn: '1 / -1' }}>
                                                        <span style={{ display: 'block', color: '#64748b', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{selectedInteraction.metadata.meetingDetails.type === 'Online' ? 'Meeting Link' : 'Office Address'}</span>
                                                        <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500, wordBreak: 'break-all' }}>{selectedInteraction.metadata.meetingDetails.linkOrAddress}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Professional Contact Info Section */}
                                        <div style={{ marginTop: '35px', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(218, 165, 32, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#daa520' }}>
                                                    <Shield size={18} />
                                                </div>
                                                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', letterSpacing: '0.5px' }}>Verified Contact Details</h4>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                                                <div style={{ position: 'relative', paddingLeft: '15px', borderLeft: '2px solid rgba(218, 165, 32, 0.3)' }}>
                                                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Professional Email</span>
                                                    <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>
                                                        {selectedProvider.contactInfo?.email || selectedProvider.email || (selectedProvider as any).userId?.email || 'N/A'}
                                                    </span>
                                                </div>
                                                <div style={{ position: 'relative', paddingLeft: '15px', borderLeft: '2px solid rgba(218, 165, 32, 0.3)' }}>
                                                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Phone / WhatsApp</span>
                                                    <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>
                                                        {selectedProvider.contactInfo?.mobile || selectedProvider.phone || (selectedProvider as any).userId?.phone || 'N/A'}
                                                    </span>
                                                </div>
                                                <div style={{ position: 'relative', paddingLeft: '15px', borderLeft: '2px solid rgba(218, 165, 32, 0.3)' }}>
                                                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Bar Council License</span>
                                                    <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>
                                                        {selectedProvider.licenseId || (selectedProvider as any).bar_council_id || 'BCI-VERIFIED'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '15px', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', marginRight: '10px' }}>Direct Connect:</div>
                                                <MessageCircle size={18} style={{ color: '#4ade80', cursor: 'pointer' }} />
                                                <Phone size={18} style={{ color: '#60a5fa', cursor: 'pointer' }} />
                                                <Mail size={18} style={{ color: '#f87171', cursor: 'pointer' }} />
                                                <FileText size={18} style={{ color: '#daa520', cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.modalActionBar} style={{ marginTop: '40px' }}>
                                    <button
                                        className={`${styles.modalActionBtn} ${(sentInteractions.has(String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id) + ':interest') || sentInteractions.has(String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id) + ':superInterest')) ? styles.actionDisabled : ''}`}
                                        disabled={sentInteractions.has(String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id) + ':interest') || sentInteractions.has(String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id) + ':superInterest')}
                                        onClick={async () => {
                                            if (!isLoggedIn) {
                                                openAuthModal('login');
                                            } else {
                                                try {
                                                    const targetId = String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id || (selectedProvider as any)._id);
                                                    await interactionService.recordActivity('advocate', targetId, 'interest', String(user?.id));
                                                    alert(`Interest recorded!`);
                                                    setSentInteractions(prev => new Set(prev).add(targetId + ':interest'));
                                                } catch (err: any) {
                                                    console.error(err);
                                                    if (err.response?.data?.error === 'ALREADY_SENT') {
                                                        alert("Interest already sent.");
                                                        setSentInteractions(prev => new Set(prev).add(String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id) + ':interest'));
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <Briefcase size={20} />
                                        <span>{(sentInteractions.has(String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id) + ':interest') || sentInteractions.has(String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id) + ':superInterest')) ? 'Interest Sent' : 'Express Interest'}</span>
                                    </button>
                                    <button className={styles.modalActionBtnPrimary} onClick={() => { !isLoggedIn ? openAuthModal('login') : setChatTarget(selectedProvider); }}>
                                        <MessageCircle size={20} />
                                        <span>Instant Message</span>
                                    </button>
                                    <button
                                        className={`${styles.modalActionBtn} ${sentInteractions.has(String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id) + ':meet_request') ? styles.actionDisabled : ''}`}
                                        disabled={sentInteractions.has(String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id) + ':meet_request')}
                                        onClick={() => { !isLoggedIn ? openAuthModal('login') : setConsultTarget(selectedProvider); }}
                                    >
                                        <Clock size={20} />
                                        <span>{sentInteractions.has(String(selectedProvider.userId?._id || selectedProvider.userId || selectedProvider.id) + ':meet_request') ? 'Booking Sent' : 'Schedule Consultation'}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* --- Profile Update Popup --- */}
            <AnimatePresence>
                {showUpdatePopup && (
                    <motion.div
                        className={styles.pPopupOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={styles.pPopupContent}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                        >
                            <button className={styles.pPopupClose} onClick={() => setShowUpdatePopup(false)}><X />X</button>

                            <div className={styles.pPopupHeader}>
                                <Sparkles className={styles.pPopupIcon} />
                                <h3>Update your detailed profile</h3>
                                <p>Which legal services do you want to appear in your detailed profile to appear to legal service providers?</p>
                            </div>

                            <div className={styles.pPopupBodyWrapper}>
                                <div className={styles.pPopupBody}>
                                    {documentationServices.map(service => (
                                        <div key={service.id} className={styles.pPopupItem}>
                                            <div
                                                className={styles.pPopupItemHeader}
                                                onClick={() => setExpandedCategory(expandedCategory === service.id ? null : service.id)}
                                            >
                                                <div className={styles.pPopupItemTitle}>
                                                    {service.icon}
                                                    <span>{service.title}</span>
                                                </div>
                                                <ChevronDown
                                                    size={20}
                                                    style={{
                                                        transform: expandedCategory === service.id ? 'rotate(180deg)' : 'none',
                                                        transition: 'transform 0.3s'
                                                    }}
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {expandedCategory === service.id && (
                                                    <motion.div
                                                        className={styles.pPopupOptions}
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                    >
                                                        <div className={styles.pPopupGrid}>
                                                            {service.serviceOptions.map(opt => {
                                                                const isSel = selectedProfileServices.includes(opt);
                                                                return (
                                                                    <button
                                                                        key={opt}
                                                                        className={`${styles.pPopupOption} ${isSel ? styles.pPopupOptionActive : ''}`}
                                                                        onClick={() => {
                                                                            setSelectedProfileServices(prev =>
                                                                                isSel ? prev.filter(x => x !== opt) : [...prev, opt]
                                                                            );
                                                                        }}
                                                                    >
                                                                        <span className={styles.optionText}>{opt}</span>
                                                                        {isSel && <X size={14} className={styles.deselectIcon} />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.pPopupFooter}>
                                <div className={styles.pPopupCount}>
                                    {selectedProfileServices.length} services selected
                                </div>
                                <button
                                    className={styles.pPopupSave}
                                    onClick={handleSaveProfileServices}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Updating...' : 'Update Profile & Continue'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {createCaseTarget && (
                    <CreateCaseModal
                        provider={createCaseTarget}
                        onClose={() => setCreateCaseTarget(null)}
                        onSuccess={() => {
                            setCreateCaseTarget(null);
                            fetchAllActivities();
                            fetchAllCases();
                        }}
                    />
                )}
                {quotingCase && (
                    <QuoteCaseModal
                        caseData={quotingCase}
                        onClose={() => setQuotingCase(null)}
                        onSuccess={() => {
                            setQuotingCase(null);
                            fetchAllCases();
                        }}
                    />
                )}
                {deliveringCase && (
                    <DeliverWorkModal
                        caseData={deliveringCase}
                        onClose={() => setDeliveringCase(null)}
                        onSuccess={() => {
                            setDeliveringCase(null);
                            fetchAllCases();
                        }}
                    />
                )}
                {detailCase && (
                    <CaseDetailModal
                        caseData={detailCase}
                        onClose={() => setDetailCase(null)}
                        onChat={(p) => setChatTarget(p)}
                        onPay={(c) => handleCasePayment(c)}
                        onRefresh={() => fetchAllCases()}
                    />
                )}
            </AnimatePresence>
            {payingFor && renderPaymentModal(payingFor)}
        </div>
    );
};

export default DashboardLegalDocs;
