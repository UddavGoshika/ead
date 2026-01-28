import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import styles from './ManagerSidebar.module.css';

import {
    MdDashboard,
    MdPeople,
    MdWorkspacePremium,
    MdPayments,
    MdAccountBalanceWallet,
    MdArticle,
    MdCampaign,
    MdEmail,
    MdSyncAlt,
    MdSupportAgent,
    MdSecurity,
    MdAccountBalance,
    MdFolder,
    MdSettings,
    MdGroup,
    MdAdminPanelSettings,
    MdEngineering,
    MdPsychology,
    MdAssessment,
    MdIosShare,
    MdHistoryEdu,
    MdComputer,
    MdExtension
} from "react-icons/md";

export interface MenuItem {
    id: string;
    name: string;
    icon?: any;
    path: string;
    badge?: string;
    children?: MenuItem[];
    isAdminOnly?: boolean;
}

export const MANAGER_MENU_SCHEMA: MenuItem[] = [
    {
        id: "dashboard",
        name: "Dashboard",
        icon: MdDashboard,
        path: "/manager/dashboard",
    },
    {
        id: "oversight",
        name: "Operations Oversight",
        icon: MdEngineering,
        path: "/manager/oversight",
        children: [
            {
                id: "tl-performance",
                name: "Team Lead Stats",
                icon: MdAssessment,
                path: "/manager/oversight/team-lead",
            },
            {
                id: "hr-progress",
                name: "HR Operations",
                icon: MdPsychology,
                path: "/manager/oversight/hr",
            },
            {
                id: "role-reports",
                name: "Role Intelligence",
                icon: MdHistoryEdu,
                path: "/manager/oversight/reports",
            }
        ]
    },
    {
        id: "communications",
        name: "Communications",
        icon: MdIosShare,
        path: "/manager/communications",
        children: [
            {
                id: "inform-admin",
                name: "Inform Super Admin",
                icon: MdAdminPanelSettings,
                path: "/manager/communications/inform-admin",
            }
        ]
    },
    {
        id: "members",
        name: "Members",
        icon: MdPeople,
        path: "/manager/members",
        children: [
            { id: "free-members", name: "Free Members", path: "/manager/members/free" },
            { id: "premium-members", name: "Premium Members", path: "/manager/members/premium" },
            { id: "approved-members", name: "Approved Members", path: "/manager/members/approved" },
            { id: "unapproved-profile-pictures", name: "Unapproved Profile", path: "/manager/members/unapproved-pictures" },
            { id: "pending-members", name: "Pending Members", path: "/manager/members/pending" },
            { id: "deactivated-members", name: "Deactivated Members", path: "/manager/members/deactivated" },
            { id: "blocked-members", name: "Blocked Members", path: "/manager/members/blocked" },
            { id: "reported-members", name: "Reported Members", path: "/manager/members/reported" },
            { id: "deleted-members", name: "Deleted Members", path: "/manager/members/deleted" },
            { id: "bulk-member-add", name: "Bulk Member Add", path: "/manager/members/bulk-add" },
            {
                id: "profile-attributes",
                name: "Profile Attributes",
                path: "/manager/members/attributes",
                children: [
                    { id: "practice-areas", name: "Practice Areas", path: "/manager/attributes/practice-areas" },
                    { id: "courts", name: "Courts", path: "/manager/attributes/courts" },
                    { id: "specializations", name: "Specializations", path: "/manager/attributes/specializations" },
                    { id: "case-types", name: "Case Types", path: "/manager/attributes/case-types" },
                    { id: "member-language", name: "Member Language", path: "/manager/attributes/language" },
                    { id: "country", name: "Country", path: "/manager/attributes/country" },
                    { id: "state", name: "State", path: "/manager/attributes/state" },
                    { id: "city", name: "City", path: "/manager/attributes/city" },
                    { id: "id-proof-types", name: "ID Proof Types", path: "/manager/attributes/id-proof" },
                    { id: "experience-levels", name: "Experience Levels", path: "/manager/attributes/experience" },
                ],
            },
            { id: "profile-sections", name: "Profile Sections", path: "/manager/members/profile-sections" },
            { id: "member-verification-form", name: "Member Verification Form", path: "/manager/members/verification" },
        ],
    },
    {
        id: "premium-packages",
        name: "Premium Packages",
        icon: MdWorkspacePremium,
        path: "/manager/premium-packages",
    },
    {
        id: "package-payments",
        name: "Package Payments",
        icon: MdPayments,
        path: "/manager/package-payments",
    },
    {
        id: "wallet",
        name: "Wallet",
        icon: MdAccountBalanceWallet,
        path: "/manager/wallet",
        children: [
            { id: "wallet-transaction-history", name: "Wallet Transaction History", path: "/manager/wallet/history" },
            { id: "manual-wallet-recharge-request", name: "Manual Wallet Recharge Request", path: "/manager/wallet/recharge" },
        ],
    },
    {
        id: "blog-system",
        name: "Blog System",
        icon: MdArticle,
        path: "/manager/blog",
        children: [
            { id: "all-posts", name: "All Posts", path: "/manager/blog/posts" },
            { id: "categories", name: "Categories", path: "/manager/blog/categories" },
        ],
    },
    {
        id: "marketing",
        name: "Marketing",
        icon: MdCampaign,
        path: "/manager/marketing",
        children: [{ id: "newsletter", name: "Newsletter", path: "/manager/marketing/newsletter" }],
    },
    {
        id: "contact-us-queries",
        name: "Contact Us Queries",
        icon: MdEmail,
        path: "/manager/contact-queries",
    },
    {
        id: "referral",
        name: "Referral (Addon)",
        icon: MdSyncAlt,
        badge: "ADDON",
        path: "/manager/referral",
        children: [
            { id: "set-referral-commission", name: "Referral users commission", path: "/manager/referral/commission" },
            { id: "referral-users", name: "Referral Users", path: "/manager/referral/users" },
            { id: "referral-earnings", name: "Referral Earnings", path: "/manager/referral/earnings" },
            { id: "wallet-withdraw-request", name: "Wallet Withdraw Request", path: "/manager/referral/withdraw" },
        ],
    },
    {
        id: "support-ticket",
        name: "Support Ticket (Addon)",
        icon: MdSupportAgent,
        badge: "ADDON",
        path: "/manager/support",
        children: [
            { id: "active-tickets", name: "Active Tickets", path: "/manager/support/active" },
            {
                id: "support-settings",
                name: "Support Settings",
                path: "/manager/support/settings",
                children: [
                    { id: "category", name: "Category", path: "/manager/support/settings/category" },
                    { id: "default-assigned-agent", name: "Default Assigned Agent", path: "/manager/support/settings/agent" },
                ],
            },
        ],
    },
    {
        id: "otp-system",
        name: "OTP System (Addon)",
        icon: MdSecurity,
        badge: "ADDON",
        path: "/manager/otp",
        children: [
            { id: "sms-templates", name: "SMS Templates", path: "/manager/otp/templates" },
            { id: "set-otp-credentials", name: "Set OTP Credentials", path: "/manager/otp/credentials" },
            { id: "send-sms", name: "Send SMS", path: "/manager/otp/send" },
        ],
    },
    {
        id: "offline-payment-system",
        name: "Offline Payment System",
        icon: MdAccountBalance,
        path: "/manager/offline-payments",
        children: [
            {
                id: "manual-payment-methods",
                name: "Manual Payment Methods",
                path: "/manager/offline-payments/manual",
                isAdminOnly: true
            }
        ],
    },
    {
        id: "uploaded-files",
        name: "Uploaded Files",
        icon: MdFolder,
        path: "/manager/uploaded-files",
    },
    {
        id: "website-setup",
        name: "Website Setup",
        icon: MdSettings,
        path: "/manager/website-setup",
        isAdminOnly: true,
        children: [
            { id: "header", name: "Header", path: "/manager/setup/header" },
            { id: "footer", name: "Footer", path: "/manager/setup/footer" },
            { id: "pages", name: "Pages", path: "/manager/setup/pages" },
            { id: "appearance", name: "Appearance", path: "/manager/setup/appearance" },
            { id: "ecosystem", name: "Ecosystem", path: "/manager/setup/ecosystem" },
        ],
    },
    {
        id: "settings",
        name: "Settings",
        icon: MdSettings,
        path: "/manager/settings",
        isAdminOnly: true,
        children: [
            { id: "general-settings", name: "General Settings", path: "/manager/settings/general" },
            { id: "language", name: "Language", path: "/manager/settings/language" },
            { id: "currency", name: "Currency", path: "/manager/settings/currency" },
            { id: "payment-methods", name: "Payment Methods", path: "/manager/settings/payments" },
            { id: "smtp-settings", name: "SMTP Settings", path: "/manager/settings/smtp" },
            { id: "email-templates", name: "Email Templates", path: "/manager/settings/email-templates" },
            { id: "third-party-settings", name: "Third Party Settings", path: "/manager/settings/third-party" },
            { id: "social-media-login", name: "Social Media Login", path: "/manager/settings/social-login" },
            { id: "firebase-push-notification", name: "Firebase Push Notification", path: "/manager/settings/push-notification" },
        ],
    },
    {
        id: "staffs",
        name: "Staffs",
        icon: MdGroup,
        path: "/manager/staffs",
        children: [
            { id: "all-staffs", name: "All Staffs", path: "/manager/staffs/all" },
            { id: "staff-roles", name: "Staff Roles", path: "/manager/staffs/roles", isAdminOnly: true },
            { id: "outsourced-personnel", name: "Outsourced Personnel", path: "/manager/staffs/outsourced" },
            { id: "super-onboarding", name: "Ecosystem Onboarding", path: "/manager/staffs/registration" },
        ],
    },
    {
        id: "system",
        name: "System",
        icon: MdComputer,
        path: "/manager/system",
        isAdminOnly: true,
        children: [
            { id: "update", name: "Update", path: "/manager/system/update" },
            { id: "server-status", name: "Server Status", path: "/manager/system/status" },
        ],
    },
    {
        id: "addon-manager",
        name: "Addon Manager",
        icon: MdExtension,
        path: "/manager/addon-manager",
        isAdminOnly: true,
    },
];

interface SidebarProps {
    collapsed: boolean;
}

const MenuItemComponent: React.FC<{ item: MenuItem; depth?: number; search: string; collapsed: boolean }> = ({ item, depth = 0, search, collapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const matchesSearch = (item: MenuItem): boolean => {
        if (item.name.toLowerCase().includes(search.toLowerCase())) return true;
        if (item.children) return item.children.some(child => matchesSearch(child));
        return false;
    };

    if (search && !matchesSearch(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isActive = location.pathname === item.path || (hasChildren && location.pathname.startsWith(item.path));

    const { settings } = useSettings();
    const permissions = settings?.manager_permissions || {};

    // An item is restricted if:
    // 1. It is explicitly marked as isAdminOnly
    // 2. Its ID is explicitly set to false in permissions
    const isRestricted = item.isAdminOnly || permissions[item.id] === false;

    const toggle = (e: React.MouseEvent) => {
        if (isRestricted) {
            e.preventDefault();
            return;
        }
        if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className={styles.menuItemWrapper}>
            <NavLink
                to={isRestricted ? '#' : item.path}
                className={({ isActive: linkActive }) =>
                    `${styles.menuItem} ${(linkActive || isActive) ? styles.activeItem : ''} ${depth > 0 ? styles.subItem : ''} ${collapsed ? styles.collapsedItem : ''} ${isRestricted ? styles.restricted : ''}`
                }
                onClick={toggle}
                title={isRestricted ? 'Restricted to Admin' : (collapsed ? item.name : '')}
            >
                <div className={styles.itemContent}>
                    {item.icon && (
                        <span className={styles.icon}>
                            {typeof item.icon === 'string' ? item.icon : <item.icon />}
                        </span>
                    )}
                    {!collapsed && <span>{item.name}</span>}
                    {!collapsed && item.badge && <span className={styles.badge}>{item.badge}</span>}
                    {!collapsed && isRestricted && <span className={styles.adminOnlyTag}>Admin Only</span>}
                </div>
                {!collapsed && hasChildren && (
                    <span className={`${styles.chevron} ${isOpen || isActive ? styles.chevronOpen : ''}`}>▶</span>
                )}
            </NavLink>

            {hasChildren && !collapsed && (isOpen || isActive || search) && (
                <div className={styles.childrenContainer}>
                    {item.children?.map(child => (
                        <MenuItemComponent
                            key={child.id}
                            item={isRestricted ? { ...child, isAdminOnly: true } : child}
                            depth={depth + 1}
                            search={search}
                            collapsed={collapsed}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ManagerSidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const [search, setSearch] = useState('');

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.header}>
                {!collapsed ? (
                    <>
                        <div className={styles.logo}>E-Advocate</div>
                        <div className={styles.logoSubtitle}>MANAGER PANEL</div>
                    </>
                ) : (
                    <div className={styles.logoCollapsed}>M</div>
                )}
            </div>

            {!collapsed && (
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search operations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            <nav className={styles.menuContainer}>
                {MANAGER_MENU_SCHEMA.map(item => (
                    <MenuItemComponent key={item.id} item={item} search={search} collapsed={collapsed} />
                ))}
            </nav>
        </aside>
    );
};

export default ManagerSidebar;
