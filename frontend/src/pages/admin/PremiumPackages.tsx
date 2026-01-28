import React, { useState, useEffect } from "react";
import styles from "./PremiumPackages.module.css";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import {
    Plus, Edit2, Trash2, X, Loader2, Save, Info, Crown, Gem, Zap,
    ShieldCheck, Mail, Phone, UserCheck, RefreshCw, Check, Star,
    Shield, Award, Sparkles, TrendingUp, Users, Eye, Filter
} from "lucide-react";
import axios from "axios";

/* ================= ENHANCED TYPES ================= */
interface Tier {
    _id?: string;
    name: string;
    price: number;
    coins: number | "unlimited";
    support?: "Chat Support" | "Call Support" | "Personal Agent" | "VIP Concierge" | string;
    description?: string;
    active: boolean;
    features?: string[];
    badgeColor?: string;
    glowColor?: string;
    popular?: boolean;
}

interface Package {
    _id?: string;
    memberType: "advocate" | "client";
    category: string;
    description?: string;
    icon?: string;
    gradient?: string;
    tiers: Tier[];
    featured?: boolean;
    sortOrder?: number;
}

interface SelectedTier {
    packageId: string;
    category: string;
    tier: Tier;
}

/* ================= ENHANCED DEFAULT DATA ================= */
const advocateDefaults: Package[] = [
    {
        category: "Free",
        memberType: "advocate",
        description: "Basic access with essential features",
        icon: "zap",
        gradient: "from-blue-50 to-gray-50",
        tiers: [],
        featured: false,
        sortOrder: 1,
    },
    {
        category: "Pro Lite",
        memberType: "advocate",
        description: "Enhanced features for growing practices",
        icon: "shield-check",
        gradient: "from-blue-100 to-indigo-50",
        tiers: [
            {
                name: "Silver",
                price: 500,
                coins: 50,
                active: true,
                features: ["Basic Analytics", "Email Support", "5 Case Templates"],
                badgeColor: "#C0C0C0",
                glowColor: "rgba(192, 192, 192, 0.2)",
                popular: false
            },
            {
                name: "Gold",
                price: 1000,
                coins: 100,
                active: true,
                features: ["Advanced Analytics", "Priority Support", "15 Case Templates", "Client Portal"],
                badgeColor: "#FFD700",
                glowColor: "rgba(255, 215, 0, 0.2)",
                popular: true
            },
            {
                name: "Platinum",
                price: 1500,
                coins: 150,
                active: true,
                features: ["Full Analytics Suite", "24/7 Support", "Unlimited Templates", "Custom Branding"],
                badgeColor: "#E5E4E2",
                glowColor: "rgba(229, 228, 226, 0.2)",
                popular: false
            },
        ],
        featured: true,
        sortOrder: 2,
    },
    {
        category: "Pro",
        memberType: "advocate",
        description: "Advanced tools for established professionals",
        icon: "crown",
        gradient: "from-blue-200 to-purple-50",
        tiers: [
            {
                name: "Silver",
                price: 5000,
                coins: 500,
                active: true,
                features: ["AI Case Analysis", "Team Collaboration", "Custom Reports"],
                badgeColor: "#C0C0C0",
                glowColor: "rgba(192, 192, 192, 0.3)",
                popular: false
            },
            {
                name: "Gold",
                price: 10000,
                coins: 1000,
                active: true,
                features: ["AI + Human Review", "API Access", "White Label", "Advanced Security"],
                badgeColor: "#FFD700",
                glowColor: "rgba(255, 215, 0, 0.3)",
                popular: true
            },
            {
                name: "Platinum",
                price: 15000,
                coins: 1500,
                active: true,
                features: ["Enterprise Solutions", "Dedicated Manager", "Custom Development", "SLA Guarantee"],
                badgeColor: "#E5E4E2",
                glowColor: "rgba(229, 228, 226, 0.3)",
                popular: false
            },
        ],
        featured: true,
        sortOrder: 3,
    },
    {
        category: "Ultra Pro",
        memberType: "advocate",
        description: "Elite suite for top-tier law firms",
        icon: "gem",
        gradient: "from-blue-900 via-blue-800 to-indigo-900",
        tiers: [
            {
                name: "Basic Luxury",
                price: 25000,
                coins: "unlimited",
                support: "VIP Concierge",
                active: true,
                features: ["Unlimited Everything", "Personal Account Manager", "Custom AI Training"],
                badgeColor: "#8A2BE2",
                glowColor: "rgba(138, 43, 226, 0.3)",
                popular: false
            },
            {
                name: "Elite Access",
                price: 35000,
                coins: "unlimited",
                support: "24/7 Executive Support",
                active: true,
                features: ["All Luxury Features", "Quarterly Strategy Sessions", "Market Analysis"],
                badgeColor: "#4169E1",
                glowColor: "rgba(65, 105, 225, 0.3)",
                popular: true
            },
            {
                name: "Personal Butler",
                price: 50000,
                coins: "unlimited",
                support: "Personal Agent",
                active: true,
                features: ["Dedicated Support Team", "Custom Integrations", "Executive Training", "Guaranteed ROI"],
                badgeColor: "#00008B",
                glowColor: "rgba(0, 0, 139, 0.3)",
                popular: false
            },
        ],
        featured: true,
        sortOrder: 4,
    },
];

const clientDefaults: Package[] = advocateDefaults
    .filter(pkg => pkg.category !== "Ultra Pro")
    .map(pkg => ({
        ...pkg,
        memberType: "client",
        description: pkg.description?.replace("professionals", "clients").replace("law firms", "businesses")
    }));

/* ================= ENHANCED COMPONENT ================= */
const PremiumPackages: React.FC = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [memberType, setMemberType] = useState<"advocate" | "client">("advocate");
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [selectedTiers, setSelectedTiers] = useState<SelectedTier[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [filterActive, setFilterActive] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<Package | null>(null);
    const [formData, setFormData] = useState<Package>({
        category: "",
        memberType: "advocate",
        description: "",
        icon: "info",
        gradient: "from-blue-50 to-gray-50",
        tiers: [],
        featured: false,
        sortOrder: 0,
    });

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `/api/admin/packages?memberType=${memberType}`
            );
            if (res.data.success && res.data.packages.length > 0) {
                const mapped = res.data.packages.map((pkg: any) => ({
                    ...pkg,
                    category: pkg.name
                }));
                setPackages(mapped.sort((a: Package, b: Package) => (a.sortOrder || 0) - (b.sortOrder || 0)));
            } else {
                setPackages(memberType === "advocate" ? advocateDefaults : clientDefaults);
            }
        } catch {
            setPackages(memberType === "advocate" ? advocateDefaults : clientDefaults);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("This will delete ALL existing packages for this member type and reset them to factory defaults. Continue?")) return;
        try {
            setLoading(true);
            for (const pkg of packages) {
                if (pkg._id) {
                    await axios.delete(`/api/admin/packages/${pkg._id}`);
                }
            }

            const defaults = memberType === "advocate" ? advocateDefaults : clientDefaults;
            for (const d of defaults) {
                const payload = { ...d, name: d.category, memberType };
                await axios.post("/api/admin/packages", payload);
            }

            fetchPackages();
            setSelectedTiers([]);
        } catch {
            alert("Error during reset. Some packages might not have been restored.");
        } finally {
            setLoading(false);
        }
    };

    const toggleTierActive = async (pkg: Package, tierIndex: number) => {
        const updatedTiers = [...pkg.tiers];
        updatedTiers[tierIndex].active = !updatedTiers[tierIndex].active;
        try {
            const payload = {
                ...pkg,
                name: pkg.category,
                tiers: updatedTiers,
                id: pkg._id
            };
            const res = await axios.post("/api/admin/packages", payload);
            if (res.data.success) {
                fetchPackages();
            }
        } catch {
            alert("Error updating tier status.");
        }
    };

    const toggleTierSelection = (pkg: Package, tier: Tier) => {
        const tierKey = `${pkg._id || pkg.category}-${tier.name}`;
        setSelectedTiers(prev => {
            const existingIndex = prev.findIndex(t =>
                `${t.packageId}-${t.tier.name}` === tierKey
            );
            if (existingIndex >= 0) {
                return prev.filter((_, i) => i !== existingIndex);
            } else {
                return [...prev, {
                    packageId: pkg._id || pkg.category,
                    category: pkg.category,
                    tier
                }];
            }
        });
    };

    const isTierSelected = (pkg: Package, tier: Tier) => {
        return selectedTiers.some(t =>
            t.packageId === (pkg._id || pkg.category) && t.tier.name === tier.name
        );
    };

    const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
        if (selectedTiers.length === 0) {
            alert("No tiers selected");
            return;
        }

        if (action === 'delete') {
            if (!window.confirm(`Delete ${selectedTiers.length} selected tier(s)?`)) return;
        }

        // Implement bulk actions here
        alert(`${action} action triggered for ${selectedTiers.length} tier(s)`);
    };

    useEffect(() => {
        fetchPackages();
    }, [memberType]);

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                name: formData.category,
                memberType,
                id: currentPackage?._id
            };
            const res = await axios.post(
                "/api/admin/packages",
                payload
            );
            if (res.data.success) {
                fetchPackages();
                setIsModalOpen(false);
            }
        } catch {
            alert("Error saving package. Please check your network connection.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this main package category?")) return;
        try {
            const res = await axios.delete(
                `/api/admin/packages/${id}`
            );
            if (res.data.success) {
                setPackages((prev) => prev.filter((p) => p._id !== id));
                setSelectedTiers(prev => prev.filter(t => t.packageId !== id));
            }
        } catch {
            alert("Error deleting package");
        }
    };

    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpenEdit = (pkg: Package) => {
        setCurrentPackage(pkg);
        setFormData({ ...pkg });
        setIsModalOpen(true);
    };

    const handleOpenAdd = () => {
        setCurrentPackage(null);
        setFormData({
            category: "",
            memberType,
            description: "",
            icon: "info",
            gradient: "from-blue-50 to-gray-50",
            tiers: [],
            featured: false,
            sortOrder: packages.length + 1,
        });
        setIsModalOpen(true);
    };

    const addTier = () => {
        setFormData({
            ...formData,
            tiers: [
                ...formData.tiers,
                {
                    name: "",
                    price: 0,
                    coins: 0,
                    support: "",
                    active: true,
                    features: [],
                    popular: false,
                    badgeColor: "#3b82f6",
                    glowColor: "rgba(59, 130, 246, 0.2)"
                },
            ],
        });
    };

    const updateTier = (idx: number, key: keyof Tier, value: any) => {
        const updated = [...formData.tiers];
        updated[idx] = { ...updated[idx], [key]: value };
        setFormData({ ...formData, tiers: updated });
    };

    const removeTier = (idx: number) => {
        setFormData({
            ...formData,
            tiers: formData.tiers.filter((_, i) => i !== idx),
        });
    };

    const getIcon = (iconName?: string) => {
        switch (iconName) {
            case "zap": return <Zap size={20} className={styles.freeIcon} />;
            case "shield-check": return <ShieldCheck size={20} className={styles.proLiteIcon} />;
            case "crown": return <Crown size={20} className={styles.proIcon} />;
            case "gem": return <Gem size={20} className={styles.ultraProIcon} />;
            default: return <Info size={20} />;
        }
    };

    const getSupportIcon = (support?: string) => {
        if (support?.includes("Chat")) return <Mail size={14} />;
        if (support?.includes("Call")) return <Phone size={14} />;
        if (support?.includes("Agent") || support?.includes("Concierge")) return <UserCheck size={14} />;
        return null;
    };

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = searchQuery === "" ||
            pkg.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = !filterActive || pkg.tiers.some(tier => tier.active);
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.spinner} />
                <p>Loading Premium Packages...</p>
                <span className={styles.loadingSubtitle}>Curating your premium experience</span>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Premium Packages Management"
                onSearch={(query) => setSearchQuery(query)}
                placeholder="Search packages..."
                showRoleFilter
                onRoleChange={(role) => setMemberType(role === 'all' ? 'advocate' : role)}
            />

            {/* Enhanced Top Actions Bar */}
            <div className={styles.topActions}>
                <div className={styles.infoGlowBox}>
                    <Sparkles size={16} />
                    <div>
                        <p className={styles.infoTitle}>Premium Package Dashboard</p>
                        <p className={styles.infoSubtitle}>
                            Manage {memberType} membership tiers with visual customization.
                            Changes reflect instantly on the front-end.
                        </p>
                    </div>
                </div>

                <div className={styles.controlPanel}>
                    <div className={styles.viewControls}>
                        <button
                            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeView : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Eye size={16} /> Grid
                        </button>
                        <button
                            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.activeView : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <Eye size={16} /> List
                        </button>
                    </div>

                    <button
                        className={styles.filterBtn}
                        onClick={() => setFilterActive(!filterActive)}
                    >
                        <Filter size={16} />
                        {filterActive ? "Show All" : "Active Only"}
                    </button>

                    {selectedTiers.length > 0 && (
                        <div className={styles.bulkActions}>
                            <span className={styles.bulkBadge}>
                                {selectedTiers.length} selected
                            </span>
                            <button
                                className={styles.bulkBtn}
                                onClick={() => handleBulkAction('activate')}
                            >
                                <Check size={14} /> Activate
                            </button>
                            <button
                                className={styles.bulkBtn}
                                onClick={() => handleBulkAction('deactivate')}
                            >
                                <X size={14} /> Deactivate
                            </button>
                        </div>
                    )}

                    <button className={styles.resetBtn} onClick={handleReset} title="Reset to Factory Defaults">
                        <RefreshCw size={18} /> Reset
                    </button>
                    <button className={styles.addMainBtn} onClick={handleOpenAdd}>
                        <Plus size={20} /> New Category
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Award size={20} />
                    </div>
                    <div>
                        <h3>{packages.length}</h3>
                        <p>Total Categories</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Users size={20} />
                    </div>
                    <div>
                        <h3>{packages.reduce((acc, pkg) => acc + pkg.tiers.length, 0)}</h3>
                        <p>Total Tiers</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3>{packages.reduce((acc, pkg) => acc + pkg.tiers.filter(t => t.active).length, 0)}</h3>
                        <p>Active Tiers</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Star size={20} />
                    </div>
                    <div>
                        <h3>{packages.reduce((acc, pkg) => acc + pkg.tiers.filter(t => t.popular).length, 0)}</h3>
                        <p>Popular Tiers</p>
                    </div>
                </div>
            </div>

            {/* Enhanced Category Grid/List */}
            <div className={`${styles.categoryContainer} ${styles[viewMode]}`}>
                {filteredPackages.map((pkg) => (
                    <div
                        key={pkg._id || pkg.category}
                        className={`${styles.categoryCard} ${pkg.featured ? styles.featuredCard : ''} ${pkg.category === "Ultra Pro" ? styles.ultraCard : ''}`}
                    >
                        <div className={styles.cardGlow}></div>

                        <div className={styles.cardHeader} onClick={() => toggleExpand(pkg._id || pkg.category)}>
                            <div className={styles.headerLeft}>
                                <div className={styles.categoryIcon}>
                                    {getIcon(pkg.icon)}
                                    {pkg.featured && <Star size={12} className={styles.featuredStar} />}
                                </div>
                                <div className={styles.headerText}>
                                    <div className={styles.categoryTitle}>
                                        <h3>{pkg.category}</h3>
                                        {pkg.featured && <span className={styles.featuredBadge}>Featured</span>}
                                    </div>
                                    <p className={styles.categoryDesc}>{pkg.description}</p>
                                    <div className={styles.tierStats}>
                                        <span className={styles.tierCount}>
                                            <Users size={12} /> {pkg.tiers.length} tiers
                                        </span>
                                        <span className={styles.activeCount}>
                                            <Check size={12} /> {pkg.tiers.filter(t => t.active).length} active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.headerRight}>
                                <div className={styles.packageActions}>
                                    <button
                                        className={`${styles.actionBtn} ${styles.selectBtn}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEdit(pkg);
                                        }}
                                        title="Edit Package"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (pkg._id) handleDelete(pkg._id);
                                        }}
                                        title="Delete Package"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        className={styles.expandBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand(pkg._id || pkg.category);
                                        }}
                                    >
                                        {expanded[pkg._id || pkg.category] ? "−" : "+"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {expanded[pkg._id || pkg.category] && (
                            <div className={styles.cardContent}>
                                {pkg.tiers.length === 0 ? (
                                    <div className={styles.emptyTiers}>
                                        <Shield size={32} />
                                        <p>No sub-packages defined for this category.</p>
                                        <button className={styles.addTierBtn} onClick={() => handleOpenEdit(pkg)}>
                                            <Plus size={16} /> Add Tiers
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.tiersGrid}>
                                        {pkg.tiers.map((tier, idx) => (
                                            <div
                                                key={idx}
                                                className={`${styles.tierCard} ${tier.active ? styles.activeTier : styles.inactiveTier} ${isTierSelected(pkg, tier) ? styles.selectedTier : ''} ${tier.popular ? styles.popularTier : ''}`}
                                                onClick={() => toggleTierSelection(pkg, tier)}
                                                style={{
                                                    '--tier-glow': tier.glowColor || 'rgba(59, 130, 246, 0.2)',
                                                    '--tier-badge': tier.badgeColor || '#3b82f6'
                                                } as React.CSSProperties}
                                            >
                                                {tier.popular && (
                                                    <div className={styles.popularBadge}>
                                                        <Star size={12} /> Most Popular
                                                    </div>
                                                )}

                                                {isTierSelected(pkg, tier) && (
                                                    <div className={styles.selectionIndicator}>
                                                        <Check size={20} />
                                                    </div>
                                                )}

                                                <div className={styles.tierHeader}>
                                                    <div className={styles.tierName}>
                                                        <span
                                                            className={styles.tierBadge}
                                                            style={{ backgroundColor: tier.badgeColor }}
                                                        >
                                                            {tier.name}
                                                        </span>
                                                        <h4>{tier.name}</h4>
                                                    </div>
                                                    <div className={styles.tierPrice}>
                                                        <span className={styles.priceAmount}>₹{tier.price.toLocaleString()}</span>
                                                        <span className={styles.pricePeriod}>/month</span>
                                                    </div>
                                                </div>

                                                <div className={styles.tierDetails}>
                                                    <div className={styles.coinBadge}>
                                                        {tier.coins === "unlimited" ? (
                                                            <><Zap size={14} /> Unlimited Coins</>
                                                        ) : (
                                                            <><Gem size={14} /> {tier.coins} Coins</>
                                                        )}
                                                    </div>

                                                    {tier.support && (
                                                        <div className={styles.supportBadge}>
                                                            {getSupportIcon(tier.support)}
                                                            <span>{tier.support}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {tier.features && tier.features.length > 0 && (
                                                    <ul className={styles.featuresList}>
                                                        {tier.features.slice(0, 3).map((feature, i) => (
                                                            <li key={i}>
                                                                <Check size={12} />
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                        {tier.features.length > 3 && (
                                                            <li className={styles.moreFeatures}>
                                                                +{tier.features.length - 3} more features
                                                            </li>
                                                        )}
                                                    </ul>
                                                )}

                                                <div className={styles.tierActions}>
                                                    <label className={styles.switch}>
                                                        <input
                                                            type="checkbox"
                                                            checked={tier.active}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                toggleTierActive(pkg, idx);
                                                            }}
                                                        />
                                                        <span className={styles.slider}></span>
                                                        <span className={styles.statusText}>
                                                            {tier.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </label>

                                                    <button
                                                        className={styles.quickEditBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenEdit(pkg);
                                                        }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Enhanced Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitle}>
                                <h2>{currentPackage ? "Customize Package" : "Create New Category"}</h2>
                                <p>Design premium experiences for your {memberType}s</p>
                            </div>
                            <div className={styles.modalActions}>
                                <button className={styles.previewBtn} onClick={() => setIsPreviewOpen(true)}>
                                    <Eye size={16} /> Preview
                                </button>
                                <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.formSection}>
                                    <label>Category Name</label>
                                    <input
                                        placeholder="e.g. Pro Lite, Elite, etc."
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({ ...formData, category: e.target.value })
                                        }
                                        className={styles.formInput}
                                    />
                                </div>

                                <div className={styles.formSection}>
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Brief description of this package category..."
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        className={styles.formTextarea}
                                        rows={2}
                                    />
                                </div>

                                <div className={styles.formSection}>
                                    <label>Icon</label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) =>
                                            setFormData({ ...formData, icon: e.target.value })
                                        }
                                        className={styles.formSelect}
                                    >
                                        <option value="info">Info</option>
                                        <option value="zap">Zap (Free)</option>
                                        <option value="shield-check">Shield (Pro Lite)</option>
                                        <option value="crown">Crown (Pro)</option>
                                        <option value="gem">Gem (Ultra Pro)</option>
                                    </select>
                                </div>

                                <div className={styles.formSection}>
                                    <label>Gradient Background</label>
                                    <select
                                        value={formData.gradient}
                                        onChange={(e) =>
                                            setFormData({ ...formData, gradient: e.target.value })
                                        }
                                        className={styles.formSelect}
                                    >
                                        <option value="from-blue-50 to-gray-50">Light Blue</option>
                                        <option value="from-blue-100 to-indigo-50">Medium Blue</option>
                                        <option value="from-blue-200 to-purple-50">Blue-Purple</option>
                                        <option value="from-blue-900 via-blue-800 to-indigo-900">Dark Blue</option>
                                        <option value="from-green-50 to-emerald-50">Green</option>
                                        <option value="from-purple-50 to-pink-50">Purple-Pink</option>
                                    </select>
                                </div>

                                <div className={styles.formSection}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) =>
                                                setFormData({ ...formData, featured: e.target.checked })
                                            }
                                        />
                                        <span>Featured Category</span>
                                    </label>
                                </div>

                                <div className={styles.formSection}>
                                    <label>Sort Order</label>
                                    <input
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={(e) =>
                                            setFormData({ ...formData, sortOrder: parseInt(e.target.value) })
                                        }
                                        className={styles.formInput}
                                    />
                                </div>
                            </div>

                            <div className={styles.tiersSection}>
                                <div className={styles.tiersHeader}>
                                    <div>
                                        <h3>Sub-Packages</h3>
                                        <p>Define pricing tiers and features</p>
                                    </div>
                                    <button className={styles.addTierBtn} onClick={addTier}>
                                        <Plus size={16} /> Add Sub-Package
                                    </button>
                                </div>

                                <div className={styles.tiersList}>
                                    {formData.tiers.map((tier, idx) => (
                                        <div key={idx} className={styles.tierEditCard}>
                                            <div className={styles.tierEditHeader}>
                                                <div className={styles.tierTitle}>
                                                    <input
                                                        placeholder="Tier Name (e.g., Silver, Gold, Platinum)"
                                                        value={tier.name}
                                                        onChange={(e) => updateTier(idx, "name", e.target.value)}
                                                        className={styles.tierNameInput}
                                                    />
                                                    <div className={styles.tierColorPicker}>
                                                        <label>Badge Color:</label>
                                                        <input
                                                            type="color"
                                                            value={tier.badgeColor || "#3b82f6"}
                                                            onChange={(e) => updateTier(idx, "badgeColor", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    className={styles.removeTierBtn}
                                                    onClick={() => removeTier(idx)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className={styles.tierEditGrid}>
                                                <div className={styles.inputGroup}>
                                                    <label>Price (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={tier.price}
                                                        onChange={(e) => updateTier(idx, "price", Number(e.target.value))}
                                                        className={styles.formInput}
                                                    />
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <label>Coins</label>
                                                    <input
                                                        placeholder="Enter number or 'unlimited'"
                                                        value={tier.coins}
                                                        onChange={(e) =>
                                                            updateTier(
                                                                idx,
                                                                "coins",
                                                                e.target.value.toLowerCase() === "unlimited"
                                                                    ? "unlimited"
                                                                    : Number(e.target.value)
                                                            )
                                                        }
                                                        className={styles.formInput}
                                                    />
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <label>Support Level</label>
                                                    <select
                                                        value={tier.support || ""}
                                                        onChange={(e) => updateTier(idx, "support", e.target.value)}
                                                        className={styles.formSelect}
                                                    >
                                                        <option value="">None</option>
                                                        <option value="Chat Support">Chat Support</option>
                                                        <option value="Call Support">Call Support</option>
                                                        <option value="Personal Agent">Personal Agent</option>
                                                        <option value="VIP Concierge">VIP Concierge</option>
                                                        <option value="24/7 Executive Support">24/7 Executive Support</option>
                                                    </select>
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <label>Glow Color</label>
                                                    <input
                                                        type="color"
                                                        value={tier.glowColor || "rgba(59, 130, 246, 0.2)"}
                                                        onChange={(e) => updateTier(idx, "glowColor", e.target.value)}
                                                        className={styles.colorInput}
                                                    />
                                                </div>
                                            </div>

                                            <div className={styles.tierOptions}>
                                                <label className={styles.checkboxLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={tier.active}
                                                        onChange={(e) => updateTier(idx, "active", e.target.checked)}
                                                    />
                                                    <span>Active</span>
                                                </label>

                                                <label className={styles.checkboxLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={tier.popular}
                                                        onChange={(e) => updateTier(idx, "popular", e.target.checked)}
                                                    />
                                                    <span>Mark as Popular</span>
                                                </label>
                                            </div>

                                            <div className={styles.featuresSection}>
                                                <label>Features (one per line)</label>
                                                <textarea
                                                    placeholder="List key features for this tier..."
                                                    value={tier.features?.join('\n') || ''}
                                                    onChange={(e) => updateTier(idx, "features", e.target.value.split('\n'))}
                                                    className={styles.featuresInput}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {formData.tiers.length === 0 && (
                                        <div className={styles.emptyEditState}>
                                            <Sparkles size={32} />
                                            <p>No sub-packages yet. Start by adding one above.</p>
                                            <small>Each sub-package represents a pricing tier within this category</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            <button className={styles.saveBtn} onClick={handleSave}>
                                <Save size={18} /> {currentPackage ? "Update Package" : "Create Package"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.previewContent}>
                        <div className={styles.previewHeader}>
                            <h2>Package Preview</h2>
                            <button className={styles.closeBtn} onClick={() => setIsPreviewOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.previewBody}>
                            {/* Preview content would go here */}
                            <p>Preview functionality to be implemented...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PremiumPackages;
