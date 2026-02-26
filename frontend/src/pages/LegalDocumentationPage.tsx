import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { useLocation } from 'react-router-dom';
import styles from './LegalDocumentationPage.module.css';
import {
    FileText, ClipboardCheck, Scale, ScrollText, CheckCircle2, Zap, Bookmark, MessageCircle,
    ArrowRight, Home, MapPin, Search, Handshake, Filter, Briefcase, Award, Star, Clock, Info, ChevronDown, Shield, Lock, X, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { interactionService } from '../services/interactionService';
import { LOCATION_DATA_RAW } from '../components/layout/statesdis';
import { clientService, advocateService } from '../services/api';

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
    },
    home: {
        id: 'home',
        title: 'All Legal Documentation Specialists',
        description: 'Browse all verified specialists for agreements, affidavits, and formal legal notices.',
        howItWorks: ['Select a service category', 'Find a specialist', 'Connect and get drafted'],
        howToUse: ['Use filters to narrow down', 'Check verified badges'],
        categories: [],
        types: [],
        subtypes: []
    }
};

const mockProviders: Provider[] = [
    {
        id: 'p1',
        adv_id: 'ADV-100000',
        license_id: 'TS/1428/5256',
        name: 'Rajesh Kumar',
        age: 27,
        location: 'Delhi, India',
        specialization: 'Civil & Documentation',
        experience: '12 Years',
        rating: 4.8,
        reviews: 124,
        hourly_rate: '₹2,500',
        isPremium: true,
        isVerified: true,
        image_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=800',
        specializations: ['Agreement drafting', 'Affidavits', 'Legal Notices']
    },
    {
        id: 'p2',
        adv_id: 'ADV-100001',
        license_id: 'MH/4521/8765',
        name: 'Sneha Sharma',
        age: 31,
        location: 'Mumbai, Maharashtra',
        specialization: 'Corporate Contracts',
        experience: '8 Years',
        rating: 4.9,
        reviews: 86,
        hourly_rate: '₹3,200',
        isPremium: true,
        isVerified: true,
        image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
        specializations: ['Agreements', 'Corporate Docs']
    },
    {
        id: 'p3',
        adv_id: 'ADV-100002',
        license_id: 'KA/2219/3341',
        name: 'Vikas Mehra',
        age: 42,
        location: 'Bangalore, Karnataka',
        specialization: 'Property Laws',
        experience: '15 Years',
        rating: 4.7,
        reviews: 210,
        hourly_rate: '₹4,000',
        isPremium: false,
        isVerified: true,
        image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
        specializations: ['Property Deeds', 'Wills', 'Notices']
    }
];

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

const ProviderCard: React.FC<{
    provider: Provider;
    isLoggedIn: boolean;
    onLogin: () => void;
    onClick: () => void;
    onChat: (p: Provider) => void;
    onConsult: (p: Provider) => void;
}> = ({ provider, isLoggedIn, onLogin, onClick, onChat, onConsult }) => {
    const { user } = useAuth();
    const { name, age, location, experience, specialization, license_id, adv_id, image_url, specializations } = provider;

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
                        <div className={styles.checkInner}>
                            <CheckCircle2 size={12} />
                        </div>
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
                    className={styles.actionItem}
                    onClick={async (e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) {
                            onLogin();
                        } else {
                            try {
                                await interactionService.recordActivity('advocate', provider.id, 'interest', String(user?.id));
                                alert(`Interest for ${provider.name} recorded!`);
                            } catch (err) {
                                console.error("Error recording interest:", err);
                                alert("Action failed. Please try again.");
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
                                await interactionService.recordActivity('advocate', provider.id, 'shortlist', String(user?.id));
                                alert(`${provider.name} added to your shortlist!`);
                            } catch (err) {
                                console.error("Error shortlisting:", err);
                            }
                        }
                    }}
                >
                    <div className={styles.actionIcon}><Bookmark size={20} /></div>
                    <span>Shortlist</span>
                </button>
                <button className={styles.actionItem} onClick={(e) => { e.stopPropagation(); !isLoggedIn ? onLogin() : onConsult(provider); }}>
                    <div className={styles.actionIcon}><Clock size={20} /></div>
                    <span>Consultation</span>
                </button>
            </div>
        </motion.div>
    );
};

// --- Form & Popup Components ---

const ChatPopup: React.FC<{ provider: Provider; service: string; onClose: () => void }> = ({ provider, service, onClose }) => {
    const [msg, setMsg] = useState('');
    const { user } = useAuth();
    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <motion.div className={styles.chatPopup} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} onClick={e => e.stopPropagation()}>
                <div className={styles.popupHeader}>
                    <div className={styles.popupProviderInfo}>
                        <img src={provider.image_url} alt="" />
                        <div>
                            <h4>Chat with {provider.name}</h4>
                            <p>Ref: {service}</p>
                        </div>
                    </div>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className={styles.chatMessages}>
                    <div className={styles.systemNote}>Logged in messenger: {service} service initiated</div>
                </div>
                <form className={styles.chatInput} onSubmit={async e => {
                    e.preventDefault();
                    if (!user) return alert("Please login to send messages");
                    const currentUserId = String(user.id || (user as any)._id);
                    const targetId = String((provider as any).userId?._id || (provider as any).userId || provider.id || (provider as any)._id);

                    if (msg.trim()) {
                        try {
                            await interactionService.sendMessage(currentUserId, targetId, msg);
                            alert(`Message sent to ${provider.name} regarding ${service}`);
                            setMsg('');
                            onClose();
                            // Background task
                            interactionService.recordActivity('advocate', targetId, 'chat', currentUserId).catch(console.error);
                        } catch (err) {
                            console.error("Chat error:", err);
                            alert("Failed to send message. Please try again.");
                        }
                    }
                }}>
                    <input type="text" placeholder="Type message..." value={msg} onChange={e => setMsg(e.target.value)} />
                    <button type="submit"><Zap size={18} /></button>
                </form>
            </motion.div>
        </div>
    );
};

const ConsultationPopup: React.FC<{ provider: Provider; service: string; onClose: () => void }> = ({ provider, service, onClose }) => {
    const [form, setForm] = useState({ service, reason: '' });
    const { user } = useAuth();
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
                    const targetId = String((provider as any).userId?._id || (provider as any).userId || provider.id || (provider as any)._id);
                    try {
                        await interactionService.recordActivity('advocate', targetId, 'meet_request', currentUserId, { service });
                        alert(`Consultation request for ${service} sent to ${provider.name}`);
                        onClose();
                    } catch (err) {
                        console.error("Consultation error:", err);
                        alert("Failed to submit request.");
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

// --- Main Page Component ---

const LegalDocumentationPage: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
    const { isLoggedIn, openAuthModal, user, refreshUser } = useAuth();
    const location = useLocation();

    // --- Popup States ---
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [selectedProfileServices, setSelectedProfileServices] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Trigger Popup after 3 seconds for logged in Clients/Advocates
    useEffect(() => {
        if (isLoggedIn && (user?.role === 'client' || user?.role === 'advocate')) {
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
            if (user.role === 'client') {
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
    const [activeNav, setActiveNav] = useState(isEmbedded ? 'agreements' : 'home');
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [chatTarget, setChatTarget] = useState<Provider | null>(null);
    const [consultTarget, setConsultTarget] = useState<Provider | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [realProviders, setRealProviders] = useState<Provider[]>([]);
    const [isLoadingProviders, setIsLoadingProviders] = useState(false);
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

    useEffect(() => {
        const fetchRealProviders = async () => {
            setIsLoadingProviders(true);
            try {
                // Fetch only legal_provider role advocates
                const res = await axios.get('/api/advocates', {
                    params: {
                        role: 'legal_provider',
                        verified: 'true'
                    }
                });
                if (res.data.success && Array.isArray(res.data.advocates)) {
                    // Map back to our Provider interface
                    const mapped: Provider[] = res.data.advocates.map((adv: any) => ({
                        id: adv.id || adv._id,
                        adv_id: adv.unique_id || adv.display_id,
                        license_id: adv.bar_council_id || adv.licenseId || 'N/A',
                        name: adv.name || 'Unknown Specialist',
                        age: 30,
                        image_url: adv.image_url || adv.img,
                        location: adv.location || 'Unknown',
                        specialization: adv.specialization || 'Legal Services',
                        experience: adv.experience || '0 Years',
                        rating: 4.5 + (Math.random() * 0.5),
                        reviews: Math.floor(Math.random() * 200),
                        hourly_rate: '₹2,500',
                        isPremium: adv.isFeatured || adv.isPremium,
                        isVerified: adv.verified !== false,
                        specializations: adv.legalDocumentation || adv.specialties || []
                    }));
                    setRealProviders(mapped);
                }
            } catch (err) {
                console.error("Error fetching providers:", err);
            } finally {
                setIsLoadingProviders(false);
            }
        };

        fetchRealProviders();
    }, []);

    const filteredProviders = realProviders.filter(p => {
        const matchesSearch = !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.adv_id.toLowerCase().includes(filters.search.toLowerCase());
        const matchesState = !filters.state || p.location.toLowerCase().includes(filters.state.toLowerCase());
        const matchesCity = !filters.city || p.location.toLowerCase().includes(filters.city.toLowerCase());
        const matchesExp = !filters.experience || parseInt(p.experience) >= parseInt(filters.experience);
        const matchesCat = filters.categories.length === 0 || filters.categories.some(cat => p.specializations?.includes(cat));

        return matchesSearch && matchesState && matchesCity && matchesExp && matchesCat;
    });


    // --- Query Form State ---
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            // 1. Send to Backend (Non-blocking / "Best Effort")
            try {
                // Use relative path so Vite proxy handles it correctly regardless of env
                await axios.post('/api/contact', {
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    source: 'Legal Documentation Page'
                });
            } catch (backendError) {
                console.warn('Backend logging failed, proceeding with email:', backendError);
                // Do not throw; proceed to email
            }

            // 2. Open User's Mail App with pre-filled details
            const subject = encodeURIComponent(`Legal Query from ${formData.fullName} - E-Advocate Services`);
            const body = encodeURIComponent(
                `Name: ${formData.fullName}\n` +
                `Phone: ${formData.phone}\n` +
                `Email: ${formData.email}\n\n` +
                `Query/Message:\n${formData.message}`
            );

            window.location.href = `mailto:info.eadvocateservices@gmail.com?subject=${subject}&body=${body}`;

            setStatus('success');
            setFormData({ fullName: '', phone: '', email: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Submission failed', error);
            setStatus('error');
        }
    };

    // --- Fraud Form State ---
    const [fraudData, setFraudData] = useState({
        name: '',
        email: '',
        phone: '',
        description: '',
        evidence: false
    });
    const [fraudStatus, setFraudStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleFraudSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFraudStatus('loading');
        try {
            await axios.post('/api/contact/fraud', fraudData);
            setFraudStatus('success');
            setFraudData({ name: '', email: '', phone: '', description: '', evidence: false });
            setTimeout(() => setFraudStatus('idle'), 5000);
        } catch (err) {
            console.error(err);
            setFraudStatus('error');
        }
    };

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

    const navItems = [
        { id: 'home', label: 'Home', icon: <Home size={18} /> },
        { id: 'agreements', label: 'Agreement Drafting', icon: <FileText size={18} /> },
        { id: 'affidavits', label: 'Affidavits', icon: <ClipboardCheck size={18} /> },
        { id: 'notices', label: 'Legal Notices', icon: <Scale size={18} /> },
        { id: 'legal-docs', label: 'Legal Document Services', icon: <ScrollText size={18} /> },
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
                        {filteredProviders.map((p, index) => (
                            <tr key={p.id}>
                                <td>{index + 1}</td>
                                <td>
                                    <div className={styles.providerInfoCell}>
                                        <img src={p.image_url} alt="" className={styles.miniAvatar} />
                                        <div>
                                            <div className={styles.pName}>{p.name}</div>
                                            <div className={styles.pId}>{p.adv_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{p.location}</td>
                                <td>
                                    <div className={styles.tableSpecBadge}>
                                        {activeNav === 'agreements' ? 'Agreement Specialist' :
                                            activeNav === 'affidavits' ? 'Affidavit Specialist' :
                                                activeNav === 'notices' ? 'Notice Specialist' : 'Doc Specialist'}
                                    </div>
                                    <div className={styles.pSub} style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                                        Matching: {currentDetail.categories[0]} & more
                                    </div>
                                </td>
                                <td>{p.experience}</td>
                                <td>{p.license_id}</td>
                                <td>
                                    {p.isVerified ? (
                                        <div className={styles.verifiedTag}>
                                            <CheckCircle2 size={14} /> Verified
                                        </div>
                                    ) : (
                                        <span className={styles.pendingTag}>Pending</span>
                                    )}
                                </td>
                                <td className={styles.rateCell}>{p.hourly_rate}</td>
                                <td>
                                    <div className={styles.ratingCell}>
                                        <Star size={14} fill="#daa520" color="#daa520" />
                                        <span>{p.rating}</span>
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
                                            onClick={(e) => { e.stopPropagation(); !isLoggedIn ? openAuthModal('login') : console.log('Interest'); }}
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
                        ))}
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
                                            onChange={(e) => {/* Add local search logic if needed */ }}
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
                            <p>Found {filteredProviders.length} certified advocates for this service</p>
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

                    {viewMode === 'grid' ? (
                        <div className={styles.providersGrid}>
                            {isLoadingProviders ? (
                                <div style={{ color: '#fff' }}>Loading real providers...</div>
                            ) : filteredProviders.length > 0 ? (
                                filteredProviders.map(p => (
                                    <ProviderCard
                                        key={p.id}
                                        provider={p}
                                        isLoggedIn={isLoggedIn}
                                        onLogin={() => openAuthModal('login')}
                                        onClick={() => setSelectedProvider(p)}
                                        onChat={(p) => setChatTarget(p)}
                                        onConsult={(p) => setConsultTarget(p)}
                                    />
                                ))
                            ) : (
                                <div style={{ color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                                    No specialists found matching your search criteria.
                                </div>
                            )}
                        </div>
                    ) : renderProviderTable()}
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
            {!isEmbedded && <div className={styles.navBackground}>
                <nav className={styles.subNavBar}>
                    <div className={styles.subNavBarInner}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                className={`${styles.subNavButton} ${activeNav === item.id ? styles.subNavButtonActive : ''}`}
                                onClick={() => {
                                    setIsLoaded(false);
                                    setActiveNav(item.id);
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
            </div>}

            <div className={styles.mainContent} ref={contentRef}>
                <AnimatePresence mode="wait">
                    {activeNav === 'home' ? (isEmbedded ? renderServiceView() : renderHomeView()) : (isLoaded && renderServiceView())}
                </AnimatePresence>

                {/* Task 3 & 4: Full Grid and Bottom Support */}
                <div className={styles.taskExtensions}>
                    <section className={styles.bottomSupportSection}>
                        <div className={styles.supportGrid}>
                            <div className={styles.queryFormCard}>
                                <h3>Submit a Legal Query</h3>
                                <p>Our experts will get back to you within 24 hours.</p>
                                <form className={styles.supportForm} onSubmit={handleSubmit}>
                                    <div className={styles.formRow}>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Describe your legal requirement or query..."
                                        rows={4}
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                    <button type="submit" className={styles.formSubmitBtn} disabled={status === 'loading'}>
                                        {status === 'loading' ? 'Sending...' : 'Send Message'}
                                    </button>
                                    {status === 'success' && <p style={{ color: '#4ade80', marginTop: '10px', fontSize: '0.9rem' }}>Query sent successfully! We will contact you shortly.</p>}
                                    {status === 'error' && <p style={{ color: '#ef4444', marginTop: '10px', fontSize: '0.9rem' }}>Failed to send query. Please try again.</p>}
                                </form>
                            </div>

                            <div className={styles.fraudAlertCard}>
                                <div className={styles.alertHeader}>
                                    <div className={styles.alertIcon}><Zap size={32} /></div>
                                    <h3>Fraud Alert & Safety</h3>
                                </div>
                                <div className={styles.alertContent}>
                                    <p className={styles.warningText}>
                                        <strong>Important:</strong> Report any suspicious activity, impersonation, or unauthorized payment requests immediately.
                                    </p>

                                    <form className={styles.supportForm} onSubmit={handleFraudSubmit} style={{ marginTop: '15px' }}>
                                        <div className={styles.formRow}>
                                            <input
                                                type="text"
                                                placeholder="Your Name"
                                                required
                                                value={fraudData.name}
                                                onChange={e => setFraudData({ ...fraudData, name: e.target.value })}
                                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone"
                                                required
                                                value={fraudData.phone}
                                                onChange={e => setFraudData({ ...fraudData, phone: e.target.value })}
                                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Describe the suspicious activity..."
                                            rows={2}
                                            required
                                            value={fraudData.description}
                                            onChange={e => setFraudData({ ...fraudData, description: e.target.value })}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                        ></textarea>
                                        <button type="submit" className={styles.formSubmitBtn} disabled={fraudStatus === 'loading'} style={{ background: '#ef4444' }}>
                                            {fraudStatus === 'loading' ? 'Reporting...' : 'Report Fraud Alert'}
                                        </button>
                                        {fraudStatus === 'success' && <p style={{ color: '#4ade80', marginTop: '10px', fontSize: '0.9rem' }}>Report submitted. High priority ticket created.</p>}
                                    </form>

                                    <div className={styles.contactDetails} style={{ marginTop: '20px' }}>
                                        <div className={styles.contactItem}>
                                            <Clock size={16} />
                                            <span>Urgent Line: +91 70937 04706</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
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
                                    <img
                                        src={selectedProvider.image_url}
                                        style={{ width: '200px', height: '200px', borderRadius: '24px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h1 style={{ fontSize: '3rem', fontFamily: 'Playfair Display' }}>{selectedProvider.name}</h1>
                                        <p style={{ color: '#daa520', fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedProvider.specialization}</p>
                                        <p style={{ color: '#94a3b8' }}>{selectedProvider.location} • {selectedProvider.experience} experience</p>

                                        {/* Masked Contact Info */}
                                        <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                                            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Contact Information</h4>
                                            <div style={{ display: 'flex', gap: '20px', color: '#ccc' }}>
                                                <div>
                                                    <span style={{ color: '#888', display: 'block', fontSize: '0.8rem' }}>Email</span>
                                                    <span>
                                                        {isLoggedIn
                                                            ? `${selectedProvider.name.replace(/\s+/g, '.').toLowerCase()}@eadvocate.in`
                                                            : `${selectedProvider.name.substring(0, 2).toLowerCase()}*******@eadvocate.in`}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span style={{ color: '#888', display: 'block', fontSize: '0.8rem' }}>Phone</span>
                                                    <span>
                                                        {isLoggedIn
                                                            ? '+91 98765 43210'
                                                            : '+91 98********'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span style={{ color: '#888', display: 'block', fontSize: '0.8rem' }}>License ID</span>
                                                    <span>
                                                        {isLoggedIn
                                                            ? selectedProvider.license_id
                                                            : `${selectedProvider.license_id.substring(0, 2)}*******`}
                                                    </span>
                                                </div>
                                            </div>
                                            {!isLoggedIn && (
                                                <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#daa520' }}>
                                                    * Login to view full contact details
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.modalActionBar}>
                                    <button className={styles.modalActionBtn} onClick={() => { !isLoggedIn ? openAuthModal('login') : console.log('Interest'); }}>
                                        <Briefcase size={20} />
                                        <span>Express Interest</span>
                                    </button>
                                    <button className={styles.modalActionBtnPrimary} onClick={() => { !isLoggedIn ? openAuthModal('login') : setChatTarget(selectedProvider); }}>
                                        <MessageCircle size={20} />
                                        <span>Direct Chat</span>
                                    </button>
                                    <button className={styles.modalActionBtn} onClick={() => { !isLoggedIn ? openAuthModal('login') : setConsultTarget(selectedProvider); }}>
                                        <Clock size={20} />
                                        <span>Book Consultation</span>
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
                            <button className={styles.pPopupClose} onClick={() => setShowUpdatePopup(false)}><X /></button>

                            <div className={styles.pPopupHeader}>
                                <Sparkles className={styles.pPopupIcon} />
                                <h3>Update your detailed profile</h3>
                                <p>Which legal services do you want to appear in your detailed profile to appear to legal service providers?</p>
                            </div>

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
                                                                    {opt}
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

        </div>
    );
};

export default LegalDocumentationPage;
