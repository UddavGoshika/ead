import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import {
    Menu,
    X,
    LogIn,
    UserPlus,
    LogOut,
    Bell,
    User,
    Settings,
    LayoutDashboard,
    Search as SearchIcon
} from "lucide-react";
import styles from "./Navbar.module.css";

import { useEffect } from "react";

const placeholderTexts = [
    "Search Advocate Profiles...",
    "Search Case Status...",
    "Search Court...",
    "Search Lawyer...",
    "Search Blogs...",
    "Search Faq...",
    "Search About...",
    "Search Contact...",
    "Search Browse Profiles...",
    "Search File a Case...",
    "Search Case Status...",
    "Case a File...",
    "Search Clients..."
];

function useTypingPlaceholder(speed = 100, pause = 1500) {
    const [placeholder, setPlaceholder] = useState("");
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentText = placeholderTexts[textIndex];
        let timeout: ReturnType<typeof setTimeout>;

        if (!isDeleting && charIndex < currentText.length) {
            timeout = setTimeout(() => {
                setPlaceholder(currentText.slice(0, charIndex + 1));
                setCharIndex((prev) => prev + 1);
            }, speed);
        }
        else if (!isDeleting && charIndex === currentText.length) {
            timeout = setTimeout(() => setIsDeleting(true), pause);
        }
        else if (isDeleting && charIndex > 0) {
            timeout = setTimeout(() => {
                setPlaceholder(currentText.slice(0, charIndex - 1));
                setCharIndex((prev) => prev - 1);
            }, speed / 2);
        }
        else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setTextIndex((prev) => (prev + 1) % placeholderTexts.length);
        }

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, textIndex, speed, pause]);

    return placeholder;
}

const Navbar: React.FC = () => {
    const { isLoggedIn, user, logout, openAuthModal, openFilterModal } = useAuth();
    const { settings } = useSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const dynamicPlaceholder = useTypingPlaceholder();

    const handleSearch = () => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return;

        if (query === "home" || query === "main") {
            navigate("/");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (query.includes("about")) {
            navigate("/about");
        } else if (query.includes("blog")) {
            navigate("/blogs");
        } else if (query.includes("faq") || query.includes("help")) {
            navigate("/faq");
        } else if (query.includes("case") || query.includes("file")) {
            navigate("/file-a-case");
        } else if (query.includes("status")) {
            navigate("/case-status");
        } else if (query.includes("contact")) {
            if (window.location.pathname === "/") {
                const element = document.getElementById("contact");
                element?.scrollIntoView({ behavior: "smooth" });
            } else {
                navigate("/");
                setTimeout(() => {
                    const element = document.getElementById("contact");
                    element?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } else if (/^adv-\d+$/.test(query)) {
            // If it's an advocate ID, go to profile
            navigate(`/profile/${searchTerm.toUpperCase().trim()}`);
        } else {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
        setSearchTerm("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const goToDashboard = () => {
        if (user?.role) {
            const role = user.role.toLowerCase();
            if (role === 'admin' || role === 'verifier' || role === 'finance' || role === 'support') {
                navigate(`/dashboard/${role}`);
            } else if (role === 'client') {
                navigate("/dashboard/client");
            } else if (role === 'advocate') {
                navigate("/dashboard/advocate");
            }
        }
    };

    const goToSettings = () => {
        if (user?.role) {
            const role = user.role.toLowerCase();
            if (role === 'client') {
                navigate("/dashboard/client", { state: { initialPage: 'account-settings' } });
            } else if (role === 'advocate') {
                navigate("/dashboard/advocate", { state: { initialPage: 'account-settings' } });
            } else {
                // For staff roles, maybe they have a different settings page or it's within their dashboard
                navigate(`/dashboard/${role}`);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className={styles.navbar}>
            {/* LEFT FULL-HEIGHT LOGO */}
            <div className={styles.leftDock}>
                {/* <Scale size={42} /> */}
                <div className={styles.leftLogo}>
                    <a href="#home"> <img src={settings?.logo_url_left || "/assets/eadvocate.webp"} alt="Left Logo" /></a>
                </div>
            </div>

            {/* CENTER : ALL 3 BARS */}
            <div className={styles.centerStack}>
                {/* Mobile Logo Only */}
                <div className={styles.mobileLogoMain}>
                    <img src={settings?.logo_url_left || "/assets/eadvocate.webp"} alt="Logo" onClick={() => navigate("/")} />
                </div>

                {/* TOP BAR */}
                <div className={styles.topBar}>
                    <div className={styles.inner}>
                        <div className={styles.marquee}>
                            <span>{settings?.marquee_text || "• Verified Advocates • 24/7 Legal Consultation • Secure Platform"}</span>
                        </div>

                        <div className={styles.accessibility}>
                            <button>A-</button>
                            <button>A</button>
                            <button>A+</button>
                            <select>
                                <option>EN</option>
                                <option>HI</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* MAIN NAV */}
                <div className={styles.mainNav}>
                    <div className={styles.inner}>
                        <nav className={styles.navLinks}>
                            <button onClick={() => navigate("/")}>Home</button>

                            {settings?.header_menu && settings.header_menu.length > 0 ? (
                                settings.header_menu.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (item.label.toLowerCase() === "browse profiles") {
                                                openFilterModal();
                                            } else if (item.link.startsWith("http")) {
                                                window.open(item.link, "_blank", "noopener,noreferrer");
                                            } else {
                                                navigate(item.link);
                                            }
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                ))
                            ) : (
                                <>
                                    <button onClick={openFilterModal}>Browse Profiles</button>
                                    <button onClick={() => window.open("https://filing.ecourts.gov.in/pdedev/", "_blank", "noopener,noreferrer")}>File Case</button>
                                    <button onClick={() => window.open("https://services.ecourts.gov.in/ecourtindia_v6/", "_blank", "noopener,noreferrer")}>Case Status</button>
                                    <button onClick={() => navigate("/blogs")}>Blogs</button>
                                    <button onClick={() => navigate("/legal-documentation")}>Legal Documentation</button>
                                    <button onClick={() => navigate("/about")}>About</button>
                                </>
                            )}


                            {/* <div className={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder="Search keywords..."
                                    className={styles.search}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className={styles.searchButtons} onClick={handleSearch}>
                                    <SearchIcon size={16} />
                                </button>
                            </div> */}

                            <div className={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder={dynamicPlaceholder}
                                    className={styles.search}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className={styles.searchButtons} onClick={handleSearch}>
                                    <SearchIcon size={16} />
                                </button>
                            </div>



                        </nav>

                        <div className={styles.actions}>
                            {isLoggedIn ? (
                                <div className={styles.userActionGroup}>
                                    <button className={styles.notificationBtn}>
                                        <Bell size={20} />
                                    </button>
                                    <div className={styles.userProfile}>
                                        <div className={styles.avatar}>
                                            <User size={20} />
                                        </div>
                                        <span className={styles.userName}>{user?.name}</span>

                                        <div className={styles.dropdown}>
                                            <button className={styles.dropdownItem} onClick={goToDashboard}>
                                                <LayoutDashboard size={16} /> Dashboard
                                            </button>
                                            <button className={styles.dropdownItem} onClick={goToSettings}>
                                                <Settings size={16} /> Settings
                                            </button>
                                            <div className={styles.dropdownDivider} />
                                            <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button id="nav-login-btn" className={styles.login} onClick={() => openAuthModal("login")}>
                                        <LogIn size={18} /> <span>Login</span>
                                    </button>
                                    <button id="nav-register-btn" className={styles.register} onClick={() => openAuthModal("register")}>
                                        <UserPlus size={18} /> <span>Register</span>
                                    </button>
                                </>
                            )}

                            <button
                                className={styles.mobileToggle}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ECOSYSTEM BAR - Hidden on mobile, shown in menu if needed, or kept as is for tablet+ */}
                <div className={styles.ecoBar}>
                    <div className={styles.inner}>
                        {settings?.ecosystem_links && settings.ecosystem_links.length > 0 ? (
                            settings.ecosystem_links.map((link, idx) => (
                                <a key={idx} href={link.link}>
                                    <img src={link.icon_url} className={styles.ecoimages} alt={link.label} />
                                    {link.label} ↗
                                </a>
                            ))
                        ) : (
                            <>
                                <a href="#"><img src="/assets/edverse.webp" className={styles.ecoimages} />Tatito Edverse ↗</a>
                                <a href="#"><img src="/assets/carrer.webp" className={styles.ecoimages} />Tatito Carrer Hub ↗</a>
                                <a href="#"><img src="/assets/nexus.webp" className={styles.ecoimages} />Tatito Nexus ↗</a>
                                <a href="#"><img src="/assets/civic.webp" className={styles.ecoimages} />Tatito Civic One ↗</a>
                                <a href="#"><img src="/assets/eadvocate.webp" className={styles.ecoimages} />E-Advocate Services ↗</a>
                                <a href="#"><img src="/assets/fashion.webp" className={styles.ecoimages} />Tatito Fashions ↗</a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT FULL-HEIGHT LOGO */}
            <div className={styles.rightDock}>
                {/* <Shield size={42} /> */}
                <div className={styles.rightLogo}>
                    {/* <span>e-Advocate</span>
                    <small>SERVICES</small> */}
                    <a href="#home"> <img src={settings?.logo_url_right || "/assets/civic.webp"} alt="Right Logo" /></a>
                </div>
            </div>

            {/* MOBILE OVERLAY MENU */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ""}`}>
                <div className={styles.mobileMenuHeader}>
                    <div className={styles.mobileLogo}>
                        <img src={settings?.logo_url_left || "/assets/eadvocate.webp"} alt="Logo" />
                    </div>
                    <button className={styles.closeMenu} onClick={() => setIsMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.mobileSearch}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder={dynamicPlaceholder}
                            className={styles.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className={styles.searchButtons} onClick={() => { handleSearch(); setIsMenuOpen(false); }}>
                            <SearchIcon size={16} />
                        </button>
                    </div>
                </div>

                <nav className={styles.mobileNavLinks}>
                    <button onClick={() => { navigate("/"); setIsMenuOpen(false); }}>Home</button>
                    {settings?.header_menu && settings.header_menu.length > 0 ? (
                        settings.header_menu.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (item.label.toLowerCase() === "browse profiles") {
                                        openFilterModal();
                                    } else if (item.link.startsWith("http")) {
                                        window.open(item.link, "_blank", "noopener,noreferrer");
                                    } else {
                                        navigate(item.link);
                                    }
                                    setIsMenuOpen(false);
                                }}
                            >
                                {item.label}
                            </button>
                        ))
                    ) : (
                        <>
                            <button onClick={() => { openFilterModal(); setIsMenuOpen(false); }}>Browse Profiles</button>
                            <button onClick={() => { window.open("https://filing.ecourts.gov.in/pdedev/", "_blank", "noopener,noreferrer"); setIsMenuOpen(false); }}>File Case</button>
                            <button onClick={() => { window.open("https://services.ecourts.gov.in/ecourtindia_v6/", "_blank", "noopener,noreferrer"); setIsMenuOpen(false); }}>Case Status</button>
                            <button onClick={() => { navigate("/blogs"); setIsMenuOpen(false); }}>Blogs</button>
                            <button onClick={() => { navigate("/legal-documentation"); setIsMenuOpen(false); }}>Legal Documentation</button>
                            <button onClick={() => { navigate("/about"); setIsMenuOpen(false); }}>About</button>
                        </>
                    )}
                </nav>

                <div className={styles.mobileActions}>
                    {isLoggedIn ? (
                        <div className={styles.mobileUserGroup}>
                            <button className={styles.mobileActionBtn} onClick={() => { goToDashboard(); setIsMenuOpen(false); }}>
                                <LayoutDashboard size={20} /> Dashboard
                            </button>
                            <button className={styles.mobileActionBtn} onClick={() => { goToSettings(); setIsMenuOpen(false); }}>
                                <Settings size={20} /> Settings
                            </button>
                            <button className={`${styles.mobileActionBtn} ${styles.logout}`} onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                                <LogOut size={20} /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className={styles.mobileAuthGroup}>
                            <button className={styles.mobileLogin} onClick={() => { openAuthModal("login"); setIsMenuOpen(false); }}>
                                <LogIn size={18} /> Login
                            </button>
                            <button className={styles.mobileRegister} onClick={() => { openAuthModal("register"); setIsMenuOpen(false); }}>
                                <UserPlus size={18} /> Register
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.mobileEcoLinks}>
                    <p>Our Ecosystem</p>
                    <div className={styles.ecoGrid}>
                        {(settings?.ecosystem_links && settings.ecosystem_links.length > 0) ? (
                            settings.ecosystem_links.map((link, idx) => (
                                <a key={idx} href={link.link} target="_blank" rel="noopener noreferrer">
                                    <img src={link.icon_url} alt={link.label} />
                                    <span>{link.label}</span>
                                </a>
                            ))
                        ) : (
                            <>
                                <a href="#"><img src="/assets/edverse.webp" alt="Edverse" /><span>Edverse</span></a>
                                <a href="#"><img src="/assets/carrer.webp" alt="Careers" /><span>Careers</span></a>
                                <a href="#"><img src="/assets/nexus.webp" alt="Nexus" /><span>Nexus</span></a>
                                <a href="#"><img src="/assets/civic.webp" alt="Civic" /><span>Civic</span></a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
