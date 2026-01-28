import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Footer.module.css';
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaPinterestP, FaYoutube, FaXTwitter, FaThreads, FaTelegram, FaWhatsapp } from "react-icons/fa6";
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const Footer: React.FC = () => {
    const { settings } = useSettings();
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
            details: [], // Keeping for backward compatibility if needed by other components, but we'll use sections
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
            navigate(`/dashboard/${role.toLowerCase()}?page=blogs`);
        } else {
            openAuthModal('login');
        }
    };

    const handleSearchClick = (e: React.MouseEvent, role?: 'advocates' | 'clients') => {
        e.preventDefault();
        if (role) setSearchRole(role);

        // If on home page, scroll. Otherwise navigate home.
        if (window.location.pathname === '/') {
            const element = document.getElementById('search');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById('search');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Top Row Links */}
                <div className={styles.linksGrid}>
                    <div className={styles.column}>
                        <h3>{settings?.site_name || "E-Advocate Services"}</h3>
                        <p>{settings?.site_title || "India's premier legal platform connecting advocates and clients with trust and transparency."}</p>
                    </div>
                    <div className={styles.column}>
                        <h3>Explore</h3>
                        <ul>
                            <li><Link to="/HeroSection">Home</Link></li>
                            <li><Link to="#search" onClick={(e) => handleSearchClick(e)}>Browse Profiles</Link></li>
                            <li><Link to="" onClick={() =>
                                window.open("https://filing.ecourts.gov.in/pdedev/", "_blank", "noopener,noreferrer")
                            }>File a Case</Link></li>
                            <li><Link to="" onClick={() =>
                                window.open("https://services.ecourts.gov.in/ecourtindia_v6/", "_blank", "noopener,noreferrer")
                            }>Case Status</Link></li>
                            <li><Link to="/blogs" onClick={handleCreateBlog}>Create Blog</Link></li>
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h3>More</h3>
                        <ul>
                            <li><Link to="/premium-services">Premium Services</Link></li>
                            <li><Link to="/careers">Careers</Link></li>
                            <li><Link to="/how-it-works">How it Works</Link></li>
                            <li><Link to="#" onClick={(e) => { e.preventDefault(); openModal('credits'); }}>Credits</Link></li>
                            <li><Link to="/site-map">Site Map</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h3>For Advocates</h3>
                        <ul>
                            <li><Link to="#search" onClick={(e) => handleSearchClick(e, 'clients')}>Find Clients</Link></li>
                            <li><Link to="/advocate-how-it-works">How it Works</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Middle Row Links */}
                <div className={styles.linksGrid}>
                    <div className={styles.column}>
                        <h3>For Clients</h3>
                        <ul>
                            <li><Link to="#search" onClick={(e) => handleSearchClick(e, 'advocates')}>Find Advocates</Link></li>
                            <li><Link to="/client-how-it-works">How it Works</Link></li>
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h3>Help</h3>
                        <ul>
                            <li><Link to="" onClick={(e) => { e.preventDefault(); openHelpModal(); }}>Help</Link></li>
                            <li><Link to="/centers">E-Advocate Centers</Link></li>
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h3>Legal</h3>
                        <ul>
                            <li><Link to="/fraud-alert">Fraud Alert</Link></li>
                            <li><Link to="/terms">Terms of Use</Link></li>
                            <li><Link to="/third-party-terms">Third Party Terms of Use</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/cookie-policy">Cookie Policy</Link></li>
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h3>Privacy Features</h3>
                        <ul>
                            <li><Link to="/summons">Summons / Notices</Link></li>
                            <li><Link to="/grievances">Grievances</Link></li>
                            <li><Link to="/refund">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Branding Grid */}
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
                    {/* LEFT */}
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

                    {/* RIGHT */}
                    <div className={styles.right}>
                        <h3 className={styles.heading}>Connect With Us</h3>

                        <div className={styles.socials}>
                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/e_advocate_services/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className={styles.social}
                            >
                                <FaInstagram />
                            </a>

                            {/* Facebook */}
                            <a
                                href="https://www.facebook.com/eadvocateservices"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className={styles.social}
                            >
                                <FaFacebookF />
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="https://www.linkedin.com/in/e-advocate-services/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className={styles.social}
                            >
                                <FaLinkedinIn />
                            </a>

                            {/* Pinterest */}
                            <a
                                href="https://www.pinterest.com/eadvocateservices/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Pinterest"
                                className={styles.social}
                            >
                                <FaPinterestP />
                            </a>

                            {/* YouTube */}
                            <a
                                href="https://www.youtube.com/channel/UCkl_3tG975FVRBEmleOZRng"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className={styles.social}
                            >
                                <FaYoutube />
                            </a>

                            {/* Twitter / X */}
                            <a
                                href="https://x.com/eadvocateservic"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter X"
                                className={styles.social}
                            >
                                <FaXTwitter />
                            </a>

                            {/* Threads */}
                            <a
                                href="https://www.threads.com/@e_advocate_services"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Threads"
                                className={styles.social}
                            >
                                <FaThreads />
                            </a>

                            {/* Telegram */}
                            <a
                                href="https://t.me/tatitoprojects"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Telegram"
                                className={styles.social}
                            >
                                <FaTelegram />
                            </a>

                            {/* WhatsApp */}
                            <a
                                href="https://wa.me/917093704706"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="WhatsApp"
                                className={styles.social}
                            >
                                <FaWhatsapp />
                            </a>
                        </div>

                        <div className={styles.contact}>
                            <p>📧 {settings?.contact_email || "info.eadvocateservices@gmail.com"}</p>
                            <p>
                                📧 support@tatitoprojects.com |
                                support@eadvocateservices.com
                            </p>
                        </div>
                    </div>
                </div>

                {/* DIVIDER */}
                <div className={styles.divider} />

                {/* BOTTOM */}
                <div className={styles.bottom}>
                    <p>{settings?.footer_text || "© 2025 E-Advocate Services. All Rights Reserved."}</p>
                    <p>
                        Developed by <span className={styles.heart}>❤</span> ILN Technology Team | © ILN INDIA – Group of Companies
                        <br></br>

                    </p>
                </div>








            </div>

            {/* Detailed Info Modal */}
            {modalData && (
                <div className={styles.modalOverlay} onClick={() => setModalData(null)}>
                    <div className={styles.modalBody} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setModalData(null)}>&times;</button>

                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>{modalData.title}</h2>
                            <p className={styles.modalText}>{modalData.content}</p>

                            {/* Rendering dynamic sections if they exist (for Credits) */}
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
