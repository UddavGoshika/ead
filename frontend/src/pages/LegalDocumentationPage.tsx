import React, { useState, useEffect } from 'react';
import styles from './LegalDocumentationPage.module.css';
import {
    FileText, ClipboardCheck, Scale, ScrollText, CheckCircle2,
    ArrowRight, Home, MapPin, Search, Filter, Briefcase, Award, Star, Clock, Info, ChevronDown, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// --- Types ---

interface Provider {
    id: string;
    name: string;
    image_url?: string;
    location: string;
    specialization: string;
    experience: string;
    rating: number;
    reviews: number;
    hourly_rate: string;
    isPremium: boolean;
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
        description: 'Custom agreements tailored to your specific legal requirements, ensuring full compliance with BCI standards and Indian contract laws.',
        price: '₹5,000 - ₹10,000',
        icon: <FileText size={32} />,
        features: ['Business Contracts', 'Property Agreements', 'Service Level Agreements', 'Partnership Deeds']
    },
    {
        id: 'affidavits',
        title: 'Affidavits',
        description: 'Professional drafting of legal affidavits for all purposes, including identity verification, name change, and court declarations.',
        price: '₹4,000 - ₹8,000',
        icon: <ClipboardCheck size={32} />,
        features: ['Name Change Affidavits', 'Address Proof Oaths', 'Legal Heir Declarations', 'Financial Statements']
    },
    {
        id: 'notices',
        title: 'Legal Notices',
        description: 'Accurate and compelling legal notices drafted with precision to protect your interests and initiate formal legal proceedings.',
        price: '₹3,000 - ₹6,000',
        icon: <Scale size={32} />,
        features: ['Recovery Notices', 'Breach of Contract', 'Tenant Eviction', 'Consumer Complaints']
    },
    {
        id: 'legal-docs',
        title: 'Document Preparation',
        description: 'Comprehensive preparation of any specialized legal documents required for government, regulatory, or judicial processes.',
        price: '₹6,000 - ₹12,000',
        icon: <ScrollText size={32} />,
        features: ['Will Drafting', 'Power of Attorney', 'Lease Documents', 'Trust Deeds']
    }
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
        categories: ['Commercial', 'Real Estate', 'Marital', 'Intellectual Property', 'Digital Services'],
        types: ['Contracts', 'Deeds', 'Memos', 'Bylaws'],
        subtypes: ['Standard', 'Urgent', 'Bilingual', 'International']
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
        categories: ['Personal', 'Academic', 'Employment', 'Legal Heir'],
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
        categories: ['Debt Recovery', 'Tenant Disputes', 'Consumer Rights', 'Contractual Breach'],
        types: ['Demand Notice', 'Show Cause', 'Disclaimer'],
        subtypes: ['Standard Letter', 'Advocate Notified']
    },
    'legal-docs': {
        id: 'legal-docs',
        title: 'Specialized Legal Documentation',
        description: 'Advanced document preparation for complex legal needs, including Wills, POA, and Trust Deeds.',
        howItWorks: [
            'Detailed requirement gathering with a senior partner',
            'Drafting according to specific state laws',
            'Compliance check with regulatory authorities',
            'Final signatures and legal filing assistance'
        ],
        howToUse: [
            'Search for document specialists in your state',
            'Share the objectives of the document',
            'Provide supporting proofs for drafting',
            'Finalize document after expert validation'
        ],
        categories: ['Succession', 'Estate Planning', 'Organization', 'Social Cause'],
        types: ['Will', 'Power of Attorney', 'Lease', 'Trust Deed'],
        subtypes: ['Individual', 'Joint', 'Global']
    }
};

const mockProviders: Provider[] = [
    {
        id: 'p1',
        name: 'Rajesh Kumar',
        location: 'Delhi, India',
        specialization: 'Civil & Documentation',
        experience: '12 Years',
        rating: 4.8,
        reviews: 124,
        hourly_rate: '₹2,500',
        isPremium: true
    },
    {
        id: 'p2',
        name: 'Sneha Sharma',
        location: 'Mumbai, Maharashtra',
        specialization: 'Corporate Contracts',
        experience: '8 Years',
        rating: 4.9,
        reviews: 86,
        hourly_rate: '₹3,200',
        isPremium: true
    },
    {
        id: 'p3',
        name: 'Vikas Mehra',
        location: 'Bangalore, Karnataka',
        specialization: 'Property Laws',
        experience: '15 Years',
        rating: 4.7,
        reviews: 210,
        hourly_rate: '₹4,000',
        isPremium: false
    }
];

// --- Helpers ---
const maskString = (str: string) => {
    if (str.length <= 2) return str;
    return str.substring(0, 2) + '*'.repeat(str.length - 2);
};

// --- Sub-Components ---

const ProviderCard: React.FC<{ provider: Provider; isLoggedIn: boolean; onLogin: () => void }> = ({ provider, isLoggedIn, onLogin }) => (
    <motion.div
        className={`${styles.pCard} ${!isLoggedIn ? styles.blurredCard : ''}`}
        whileHover={{ translateY: -5 }}
    >
        <div className={styles.pCardHeader}>
            <div className={styles.pAvatar}>
                {provider.image_url ? <img src={provider.image_url} alt={isLoggedIn ? provider.name : 'Provider'} /> : <span>{provider.name.charAt(0)}</span>}
            </div>
            {provider.isPremium && <span className={styles.premiumBadge}>Premium Expert</span>}
        </div>
        <div className={styles.pCardBody}>
            <h3>{isLoggedIn ? provider.name : maskString(provider.name)}</h3>
            <p className={styles.pLoc}><MapPin size={14} /> {isLoggedIn ? provider.location : maskString(provider.location)}</p>
            <p className={styles.pSpec}>{provider.specialization}</p>
            <div className={styles.pMeta}>
                <span>{provider.experience} Exp.</span>
                <span className={styles.pRating}><Star size={14} fill="#facc15" color="#facc15" /> {provider.rating} ({provider.reviews})</span>
            </div>
        </div>

        {!isLoggedIn && (
            <div className={styles.maskOverlay}>
                <Lock size={20} />
                <p>Login to View details</p>
                <button onClick={onLogin} className={styles.maskLoginBtn}>Login Now</button>
            </div>
        )}

        <div className={styles.pCardFooter}>
            <span className={styles.pPrice}>{provider.hourly_rate} / service</span>
            <button className={styles.pBookBtn} onClick={() => !isLoggedIn && onLogin()}>
                {isLoggedIn ? 'Book Service' : 'Login to Book'}
            </button>
        </div>
    </motion.div>
);

const FilterSection: React.FC<{ label: string; options: string[] }> = ({ label, options }) => (
    <div className={styles.filterGroup}>
        <label>{label}</label>
        <div className={styles.selectWrapper}>
            <select>
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={16} />
        </div>
    </div>
);

// --- Main Page Component ---

const LegalDocumentationPage: React.FC = () => {
    const { isLoggedIn, openAuthModal } = useAuth();
    const [activeNav, setActiveNav] = useState('home');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const navItems = [
        { id: 'home', label: 'Home', icon: <Home size={18} /> },
        { id: 'agreements', label: 'Agreement Drafting', icon: <FileText size={18} /> },
        { id: 'affidavits', label: 'Affidavits', icon: <ClipboardCheck size={18} /> },
        { id: 'notices', label: 'Legal Notices', icon: <Scale size={18} /> },
        { id: 'legal-docs', label: 'Legal Docu Services', icon: <ScrollText size={18} /> },
    ];

    const currentDetail = serviceDetails[activeNav];

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
                <div className={styles.detailHero}>
                    <div className={styles.detailHeroInfo}>
                        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{currentDetail.title}</motion.h1>
                        <p>{currentDetail.description}</p>
                    </div>
                    <div className={styles.howSections}>
                        <div className={styles.howBox}>
                            <h4><Clock size={18} /> How it Works</h4>
                            <ul>
                                {currentDetail.howItWorks.map((step, i) => <li key={i}>{step}</li>)}
                            </ul>
                        </div>
                        <div className={styles.howBox}>
                            <h4><Info size={18} /> How to Use</h4>
                            <ul>
                                {currentDetail.howToUse.map((step, i) => <li key={i}>{step}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.searchFilterBar}>
                    <div className={styles.searchInner}>
                        <div className={styles.filterHeader}>
                            <Filter size={20} />
                            <h3>Refine Your Selection</h3>
                        </div>
                        <div className={styles.filtersGrid}>
                            <FilterSection label="State" options={['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu']} />
                            <FilterSection label="City" options={['Mumbai', 'Pune', 'Bangalore', 'Chennai']} />
                            <FilterSection label="Category" options={currentDetail.categories} />
                            <FilterSection label="Type" options={currentDetail.types} />
                            <FilterSection label="Sub-type" options={currentDetail.subtypes} />
                        </div>
                        <div className={styles.searchAction}>
                            <div className={styles.searchInputGroup}>
                                <Search size={18} />
                                <input type="text" placeholder="Search by name or keyword..." />
                            </div>
                            <button className={styles.searchBtn}>Apply Filters</button>
                        </div>
                    </div>
                </div>

                <div className={styles.resultsSection}>
                    <div className={styles.resultsHeader}>
                        <h2>Available Specialists</h2>
                        <p>Found 14 certified advocates for this service</p>
                    </div>
                    <div className={styles.providersGrid}>
                        {mockProviders.map(p => (
                            <ProviderCard
                                key={p.id}
                                provider={p}
                                isLoggedIn={isLoggedIn}
                                onLogin={() => openAuthModal('login')}
                            />
                        ))}
                    </div>
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
                    <motion.div
                        key={service.id}
                        className={styles.serviceCard}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        onClick={() => {
                            setIsLoaded(false);
                            setActiveNav(service.id);
                            setTimeout(() => setIsLoaded(true), 100);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>{service.icon}</div>
                            <span className={styles.price}>{service.price}</span>
                        </div>
                        <h2 className={styles.cardTitle}>{service.title}</h2>
                        <p className={styles.cardDescription}>{service.description}</p>

                        <div className={styles.featuresList}>
                            {service.features.map(feature => (
                                <div key={feature} className={styles.featureItem}>
                                    <CheckCircle2 size={16} className={styles.checkIcon} />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button className={styles.learnMoreBtn}>
                            Explore Specialists <ArrowRight size={18} />
                        </button>
                    </motion.div>
                ))}

                {/* Lawyer Listing Card */}

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
        <div className={styles.pageContainer}>
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
                                    setTimeout(() => setIsLoaded(true), 100);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                <span className={styles.subNavIcon}>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>
            </div>

            <div className={styles.mainContent}>
                <AnimatePresence mode="wait">
                    {activeNav === 'home' ? renderHomeView() : (isLoaded && renderServiceView())}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LegalDocumentationPage;
