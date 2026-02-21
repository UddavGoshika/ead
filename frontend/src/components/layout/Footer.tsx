import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Footer.module.css';
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaPinterestP, FaYoutube, FaXTwitter, FaThreads, FaTelegram, FaWhatsapp } from "react-icons/fa6";
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const FOOTER_DEFAULTS: any[] = [
    // Explore
    { title: "Home Page", route: "/", status: "Published", category: "Explore", content: "" },
    { title: "Browse Profiles", route: "/dashboard?page=all-advocates", status: "Published", category: "Explore", content: "" },
    { title: "File a Case", route: "https://filing.ecourts.gov.in/pdedev/", status: "Published", category: "Explore", content: "" },
    { title: "Case Status", route: "https://services.ecourts.gov.in/ecourtindia_v6/", status: "Published", category: "Explore", content: "" },
    { title: "Create Blog", route: "/blogs", status: "Published", category: "Explore", content: "" },
    // More
    { title: "Premium Services", route: "/premium-services", status: "Published", category: "More", content: "" },
    { title: "Careers", route: "/careers", status: "Published", category: "More", content: "" },
    { title: "How it Works", route: "/how-it-works", status: "Published", category: "More", content: "" },
    { title: "Documentation - How It Works", route: "/documentation-how-it-works", status: "Published", category: "More", content: "" },
    { title: "Credits", route: "#credits", status: "Published", category: "More", content: "" },
    { title: "Site Map", route: "/site-map", status: "Published", category: "More", content: "" },
    { title: "About Us", route: "/about", status: "Published", category: "More", content: "" },
    // For Advocates
    { title: "Find Advocates", route: "#search-advocates", status: "Published", category: "For Advocates", content: "" },
    { title: "Advocate How it Works", route: "/advocate-how-it-works", status: "Published", category: "For Advocates", content: "" },
    // For Clients
    { title: "Find Clients", route: "#search-clients", status: "Published", category: "For Clients", content: "" },
    { title: "Client How it Works", route: "/client-how-it-works", status: "Published", category: "For Clients", content: "" },
    // Help
    { title: "Help", route: "#help", status: "Published", category: "Help", content: "" },
    { title: "E-Advocate Centers", route: "/centers", status: "Published", category: "Help", content: "" },
    // Legal
    { title: "Fraud Alert", route: "/fraud-alert", status: "Published", category: "Legal", content: "" },
    { title: "Terms of Use", route: "/terms", status: "Published", category: "Legal", content: "" },
    { title: "Third Party Terms of Use", route: "/third-party-terms", status: "Published", category: "Legal", content: "" },
    { title: "Privacy Policy", route: "/privacy", status: "Published", category: "Legal", content: "" },
    { title: "Cookie Policy", route: "/cookie-policy", status: "Published", category: "Legal", content: "" },
    // Privacy Features
    { title: "Summons / Notices", route: "/summons-and-notices", status: "Published", category: "Privacy Features", content: "" },
    { title: "Grievances", route: "/grievance-redressal", status: "Published", category: "Privacy Features", content: "" },
    { title: "Refund Policy", route: "/refund", status: "Published", category: "Privacy Features", content: "" },
];

const Footer: React.FC = () => {
    const { settings, pages } = useSettings();
    const activePages = React.useMemo(() => {
        const basePages = pages || [];
        const dbRouteMap = new Map(basePages.map(p => [p.route, p]));
        const dbTitleMap = new Map(basePages.map(p => [p.title, p]));
        const defaultRoutes = new Set(FOOTER_DEFAULTS.map(d => d.route));
        const defaultTitles = new Set(FOOTER_DEFAULTS.map(d => d.title));

        const combined: any[] = [];
        const addedDbIds = new Set<string>();

        // 1. Maintain original order of FOOTER_DEFAULTS
        // Favor DB entries that match by route, then by title
        FOOTER_DEFAULTS.forEach(def => {
            let pageToAdd = dbRouteMap.get(def.route) || dbTitleMap.get(def.title);

            if (pageToAdd) {
                combined.push(pageToAdd);
                if (pageToAdd._id) addedDbIds.add(pageToAdd._id);
            } else {
                combined.push({ ...def, _id: `default-${def.route}` });
            }
        });

        // 2. Append any truly custom pages (no match in defaults)
        basePages.forEach(p => {
            if (p._id && !addedDbIds.has(p._id) && !defaultRoutes.has(p.route) && !defaultTitles.has(p.title)) {
                combined.push(p);
            }
        });

        return combined;
    }, [pages]);
    const { isLoggedIn, user, openAuthModal, setSearchRole, openHelpModal } = useAuth();
    const [modalData, setModalData] = React.useState<{ title: string; content: string; details: string[]; icons?: string[]; sections?: { subtitle: string; points: string[] }[] } | null>(null);
    const navigate = useNavigate();

    const infoDetails = {
        approved: {
            title: "Official Approvals & Compliance",
            content: "E-Advocate Services is built on the foundation of the Digital India initiative, aiming to transform the legal landscape of India through technology and transparency.",
            details: [
                "Strict adherence to the Digital India e-Governance Standards.",
                "Compliance with the Information Technology Act, 2000 for electronic records.",
                "Integration with India.gov.in for direct access to official citizen services.",
                "Authorized platform for digitizing advocate-client interactions under local laws."
            ],
            icons: ["https://upload.wikimedia.org/wikipedia/en/9/95/Digital_India_logo.svg", "/assets/Indiagovin.webp"]
        },
        partnership: {
            title: "Departmental Partnerships",
            content: "We collaborate with essential legal departments to ensure that our platform provides real-time, accurate judicial information to all our users.",
            details: [
                "Strategic alignment with the Department of Justice (DoJ) for legal data accessibility.",
                "Deep integration with the eCommittee Supreme Court of India systems.",
                "Support for e-Filing 3.0 protocols used across District and High Courts.",
                "Direct syncing with the National Judicial Data Grid (NJDG)."
            ],
            icons: ["/assets/doj.webp", "/assets/ecomitte.webp"]
        },
        collaboration: {
            title: "Technological Collaborations",
            content: "Our infrastructure and legislative data are supported by India's leading technology and legal code repositories.",
            details: [
                "Infrastructure support inspired by the National Informatics Centre (NIC) data security protocols.",
                "Direct reference to the 'India Code' portal for all Central and State legislations.",
                "Collaboration with open-source legal tech communities for innovative feature development.",
                "Cloud-secured data hosting using ISO-certified standards."
            ],
            icons: ["/assets/nic.webp", "/assets/india_code.webp"]
        },
        association: {
            title: "Institutional Associations",
            content: "We are proud members of various legal and digital transformation bodies that govern the ethics of legal services in the digital age.",
            details: [
                "Association with Advocate Bar Associations for ethical practice guidelines.",
                "Membership in Startup India and Digital Transformation councils.",
                "Alignment with BCI (Bar Council of India) digital outreach protocols.",
                "Collaboration with the Legal Aid Authorities for socio-legal empowerment."
            ],
            icons: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/100px-Ashoka_Chakra.svg.png", "https://upload.wikimedia.org/wikipedia/en/9/95/Digital_India_logo.svg"]
        },
        credits: {
            title: "Our Institutional Foundation & Credits",
            content: "E-Advocate Services is built on a foundation of trust, official compliance, and technical excellence. Here is a detailed overview of our collaborations and approvals.",
            sections: [
                {
                    subtitle: "1. Official Approvals & Compliance",
                    points: [
                        "Strict adherence to Digital India e-Governance Standards.",
                        "Compliance with the Information Technology Act, 2000.",
                        "Direct integration with India.gov.in official services.",
                        "Authorized platform for digitizing advocate-client interactions."
                    ]
                },
                {
                    subtitle: "2. Departmental Partnerships",
                    points: [
                        "Strategic alignment with the Department of Justice (DoJ).",
                        "Deep integration with eCommittee Supreme Court of India.",
                        "Support for e-Filing 3.0 protocols across District and High Courts.",
                        "Real-time syncing with National Judicial Data Grid (NJDG)."
                    ]
                },
                {
                    subtitle: "3. Technological Collaborations",
                    points: [
                        "Infrastructure inspired by NIC data security protocols.",
                        "Legislation data sourced from 'India Code' portal.",
                        "Collaboration with open-source legal tech communities.",
                        "ISO-certified secure cloud data hosting."
                    ]
                },
                {
                    subtitle: "4. Institutional Associations",
                    points: [
                        "Association with Bar Associations for ethical guidelines.",
                        "Membership in Startup India and Digital Transformation councils.",
                        "Alignment with BCI (Bar Council of India) digital protocols.",
                        "Collaboration with Legal Aid Authorities."
                    ]
                },
                {
                    subtitle: "Platform Credits",
                    points: [
                        "Technical Architecture: Ilearn Nexus Technology Team.",
                        "Design: Modern high-accessibility standards.",
                        "Icons: Lucide-React & FontAwesome communities."
                    ]
                }
            ],
            details: [],
            icons: []
        }
    };

    const openModal = (key: keyof typeof infoDetails) => {
        setModalData(infoDetails[key]);
    };

    const handleCreateBlog = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isLoggedIn) {
            const role = user?.role || 'client';
            const uid = user?.unique_id || user?.id;
            navigate(`/dashboard/${role.toLowerCase()}/${uid}?page=blogs`);
        } else {
            openAuthModal('login');
        }
    };

    const handleSearchClick = (e: React.MouseEvent, role?: 'advocates' | 'clients') => {
        e.preventDefault();
        if (role) setSearchRole(role);

        if (window.location.pathname === '/' || window.location.pathname === '/home') {
            const element = document.getElementById('search');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById('search');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 600);
        }
    };

    const getIconComponent = (iconName: string) => {
        const name = iconName.toLowerCase();
        if (name.includes('insta')) return <FaInstagram />;
        if (name.includes('facebook') || name.includes('fb')) return <FaFacebookF />;
        if (name.includes('linkedin')) return <FaLinkedinIn />;
        if (name.includes('pinterest')) return <FaPinterestP />;
        if (name.includes('youtube')) return <FaYoutube />;
        if (name.includes('twitter') || name.includes('x')) return <FaXTwitter />;
        if (name.includes('threads')) return <FaThreads />;
        if (name.includes('telegram')) return <FaTelegram />;
        if (name.includes('whatsapp')) return <FaWhatsapp />;
        return <FaInstagram />;
    };

    const renderLink = (page: { title: string; route: string }) => {
        const title = page.title.toLowerCase();
        const route = page.route;

        if (title.includes("browse profiles") || route === "#search-advocates") {
            return <Link to="#search" onClick={(e) => handleSearchClick(e, 'advocates')}>{page.title}</Link>;
        }
        if (route === "#search-clients") {
            return <Link to="#search" onClick={(e) => handleSearchClick(e, 'clients')}>{page.title}</Link>;
        }
        if (route === "#search" || title === "browse profiles") {
            return <Link to="#search" onClick={(e) => handleSearchClick(e)}>{page.title}</Link>;
        }
        if (title === "create blog" || route === "/blogs") {
            return <Link to="/blogs" onClick={handleCreateBlog}>{page.title}</Link>;
        }
        if (route === "#help" || title === "help") {
            return <Link to="#" onClick={(e) => { e.preventDefault(); openHelpModal(); }}>{page.title}</Link>;
        }
        if (route === "#credits" || title === "credits") {
            return <Link to="#" onClick={(e) => { e.preventDefault(); openModal('credits'); }}>{page.title}</Link>;
        }
        if (route.startsWith("http")) {
            return <Link to="" onClick={() => window.open(route, "_blank", "noopener,noreferrer")}>{page.title}</Link>;
        }
        if (route === "/") {
            return <Link to="/" onClick={() => { if (window.location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{page.title}</Link>;
        }

        return <Link to={route}>{page.title}</Link>;
    };

    const getPagesByCategory = (category: string) => {
        return activePages.filter((p: any) => p.category === category && p.status === "Published");
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.linksGrid}>
                    <div className={styles.column}>
                        <h3>{settings?.site_name || "E-Advocate Services"}</h3>
                        <p>{settings?.site_title || "India's premier legal platform connecting advocates and clients with trust and transparency."}</p>
                    </div>

                    <div className={styles.column}>
                        <h3>Explore</h3>
                        <ul>
                            {getPagesByCategory("Explore").map((p: any, idx: number) => <li key={p._id || idx}>{renderLink(p)}</li>)}
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3>More</h3>
                        <ul>
                            {getPagesByCategory("More").map((p: any, idx: number) => <li key={p._id || idx}>{renderLink(p)}</li>)}
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3>For Advocates</h3>
                        <ul>
                            {getPagesByCategory("For Advocates").map((p: any, idx: number) => <li key={p._id || idx}>{renderLink(p)}</li>)}
                        </ul>
                    </div>
                </div>

                <div className={styles.linksGrid}>
                    <div className={styles.column}>
                        <h3>For Clients</h3>
                        <ul>
                            {getPagesByCategory("For Clients").map((p: any, idx: number) => <li key={p._id || idx}>{renderLink(p)}</li>)}
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h3>Help</h3>
                        <ul>
                            {getPagesByCategory("Help").map((p: any, idx: number) => <li key={p._id || idx}>{renderLink(p)}</li>)}
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h3>Legal</h3>
                        <ul>
                            {getPagesByCategory("Legal").map((p: any, idx: number) => <li key={p._id || idx}>{renderLink(p)}</li>)}
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h3>Privacy Features</h3>
                        <ul>
                            {getPagesByCategory("Privacy Features").map((p: any, idx: number) => <li key={p._id || idx}>{renderLink(p)}</li>)}
                        </ul>
                    </div>
                </div>

                <div className={styles.brandingGrid}>
                    <div className={styles.brandBox} onClick={() => openModal('approved')}>
                        <span>APPROVED BY</span>
                        <div className={styles.brandLogos}>
                            <img src="https://upload.wikimedia.org/wikipedia/en/9/95/Digital_India_logo.svg" alt="Digital India" className={styles.brandLogo} />
                            <img src="/assets/Indiagovin.webp" alt="India Gov" className={styles.brandLogo} />
                        </div>
                    </div>
                    <div className={styles.brandBox} onClick={() => openModal('partnership')}>
                        <span>PARTNERSHIP</span>
                        <div className={styles.brandLogos}>
                            <img src="/assets/doj.webp" alt="Ministry of Law" className={styles.brandLogo} />
                            <img src="/assets/ecomitte.webp" alt="eCommittee" className={styles.brandLogo} />
                        </div>
                    </div>
                    <div className={styles.brandBox} onClick={() => openModal('collaboration')}>
                        <span>COLLABORATION</span>
                        <div className={styles.brandLogos}>
                            <img src="/assets/nic.webp" alt="NIC" className={styles.brandLogo} />
                            <img src="/assets/india_code.webp" alt="India Code" className={styles.brandLogo} />
                        </div>
                    </div>
                    <div className={styles.brandBox} onClick={() => openModal('association')}>
                        <span>ASSOCIATION</span>
                        <div className={styles.brandLogos}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/100px-Ashoka_Chakra.svg.png" alt="Gov Of India" className={styles.brandLogo} />
                            <img src="https://upload.wikimedia.org/wikipedia/en/9/95/Digital_India_logo.svg" alt="Digital India" className={styles.brandLogo} />
                        </div>
                    </div>
                </div>

                <div className={styles.topSection}>
                    <div className={styles.left}>
                        <h3 className={styles.heading}>Download Our App</h3>
                        <div className={styles.storeButtons}>
                            <div className={styles.storeBtn}>
                                <img src="/assets/apple-store.jpg" alt="App Store" />
                            </div>
                            <div className={styles.storeBtn}>
                                <img src="/assets/google-play.png" alt="Google Play" />
                            </div>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <h3 className={styles.heading}>Connect With Us</h3>
                        <div className={styles.socials}>
                            {(settings?.social_links && Array.isArray(settings.social_links) ? settings.social_links : (settings?.social_links ? Object.entries(settings.social_links as any).map(([k, v]) => ({ platform: k, url: v as string, icon: k, active: true })) : [])).filter((l: any) => l.active && l.url && l.url !== '#').map((link: any, idx: number) => (
                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.platform} className={styles.social}>
                                    {getIconComponent(link.icon || link.platform)}
                                </a>
                            ))}
                        </div>
                        <div className={styles.contact}>
                            <p>📧 {settings?.contact_email || "info.eadvocateservices@gmail.com"}</p>
                            <p>📧 support@tatitoprojects.com | support@eadvocateservices.com</p>
                        </div>
                    </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.bottom}>
                    <p>{settings?.footer_text || "© 2025 E-Advocate Services. All Rights Reserved."}</p>
                    <p>Developed by <span className={styles.heart}>❤</span> ILN Technology Team | © ILN INDIA – Group of Companies</p>
                </div>
            </div>

            {modalData && (
                <div className={styles.modalOverlay} onClick={() => setModalData(null)}>
                    <div className={styles.modalBody} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setModalData(null)}>&times;</button>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>{modalData.title}</h2>
                            <p className={styles.modalText}>{modalData.content}</p>
                            {modalData.sections ? (
                                <div className={styles.modalSectionsGrid}>
                                    {modalData.sections.map((section: any, sIdx: number) => (
                                        <div key={sIdx} className={styles.modalInfoSection}>
                                            <h3>{section.subtitle}</h3>
                                            <ul>
                                                {section.points.map((point: string, pIdx: number) => (
                                                    <li key={pIdx}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.modalDetails}>
                                    <h3>Key Points:</h3>
                                    <ul>
                                        {modalData.details.map((detail, idx) => (
                                            <li key={idx}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {modalData.icons && modalData.icons.length > 0 && (
                                <div className={styles.modalLogos}>
                                    {modalData.icons.map((icon, idx) => (
                                        <img key={idx} src={icon} alt="Brand Logo" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;
