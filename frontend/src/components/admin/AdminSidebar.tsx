import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdLogout } from 'react-icons/md';
import styles from './AdminSidebar.module.css';

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
    MdComputer,
    MdExtension,
    MdAdminPanelSettings
} from "react-icons/md";

export interface MenuItem {
    id: string;
    name: string;
    icon?: any; // Changed from string to any to support react-icons components
    path: string;
    badge?: string;
    children?: MenuItem[];
}

export const MENU_SCHEMA: MenuItem[] = [
    {
        id: "dashboard",
        name: "Dashboard",
        icon: MdDashboard,
        path: "/admin/dashboard",
    },
    {
        id: "members",
        name: "Members",
        icon: MdPeople,
        path: "/admin/members",
        children: [
            { id: "free-members", name: "Free Members", path: "/admin/members/free" },
            { id: "premium-members", name: "Premium Members", path: "/admin/members/premium" },
            { id: "approved-members", name: "Approved Members", path: "/admin/members/approved" },
            { id: "unapproved-profile-pictures", name: "Unapproved Profile", path: "/admin/members/unapproved-pictures" },

            { id: "pending-members", name: "Pending Members", path: "/admin/members/pending" },
            { id: "deactivated-members", name: "Deactivated Members", path: "/admin/members/deactivated" },
            { id: "blocked-members", name: "Blocked Members", path: "/admin/members/blocked" },
            { id: "reported-members", name: "Reported Members", path: "/admin/members/reported" },

            { id: "deleted-members", name: "Deleted Members", path: "/admin/members/deleted" },
            { id: "bulk-member-add", name: "Bulk Member Add", path: "/admin/members/bulk-add" },

            {
                id: "profile-attributes",
                name: "Profile Attributes",
                path: "/admin/members/attributes",
                children: [
                    { id: "practice-areas", name: "Practice Areas", path: "/admin/attributes/practice-areas" },
                    { id: "courts", name: "Courts", path: "/admin/attributes/courts" },
                    { id: "specializations", name: "Specializations", path: "/admin/attributes/specializations" },
                    { id: "case-types", name: "Case Types", path: "/admin/attributes/case-types" },
                    { id: "member-language", name: "Member Language", path: "/admin/attributes/language" },
                    { id: "country", name: "Country", path: "/admin/attributes/country" },
                    { id: "state", name: "State", path: "/admin/attributes/state" },
                    { id: "city", name: "City", path: "/admin/attributes/city" },
                    { id: "id-proof-types", name: "ID Proof Types", path: "/admin/attributes/id-proof" },
                    { id: "experience-levels", name: "Experience Levels", path: "/admin/attributes/experience" },
                ],
            },
            { id: "profile-sections", name: "Profile Sections", path: "/admin/members/profile-sections" },
            { id: "member-verification-form", name: "Member Verification Form", path: "/admin/members/verification" },
            { id: "login-member-details", name: "Login Member Details", path: "/admin/members/login-details" },
        ],
    },
    {
        id: "premium-packages",
        name: "Premium Packages",
        icon: MdWorkspacePremium,
        path: "/admin/premium-packages",
    },
    {
        id: "package-payments",
        name: "Package Payments",
        icon: MdPayments,
        path: "/admin/package-payments",
    },
    {
        id: "legal-documentation",
        name: "Legal Documentation",
        icon: MdFolder,
        path: "/admin/legal-docs",
        children: [
            { id: "agreements", name: "Agreements", path: "/admin/legal-docs/agreements", badge: "1240" },
            { id: "affidavits", name: "Affidavits", path: "/admin/legal-docs/affidavits", badge: "3892" },
            { id: "notices", name: "Notices", path: "/admin/legal-docs/notices", badge: "5120" },
            { id: "providers", name: "Service Providers", path: "/admin/legal-docs/providers", badge: "Active" },
            { id: "legal-doc-services", name: "Legal Document Services", path: "/admin/legal-docs/services", badge: "New" },
        ],
    },
    {
        id: "wallet",
        name: "Wallet",
        icon: MdAccountBalanceWallet,
        path: "/admin/wallet",
        children: [
            { id: "wallet-transaction-history", name: "Wallet Transaction History", path: "/admin/wallet/history" },
            { id: "manual-wallet-recharge-request", name: "Manual Wallet Recharge Request", path: "/admin/wallet/recharge" },
        ],
    },
    {
        id: "blog-system",
        name: "Blog System",
        icon: MdArticle,
        path: "/admin/blog",
        children: [
            { id: "all-posts", name: "All Posts", path: "/admin/blog/posts" },
            { id: "categories", name: "Categories", path: "/admin/blog/categories" },
        ],
    },
    {
        id: "marketing",
        name: "Marketing",
        icon: MdCampaign,
        path: "/admin/marketing",
        children: [{ id: "newsletter", name: "Newsletter", path: "/admin/marketing/newsletter" }],
    },
    {
        id: "contact-us-queries",
        name: "Contact Us Queries",
        icon: MdEmail,
        path: "/admin/contact-queries",
    },
    {
        id: "referral",
        name: "Referral (Addon)",
        icon: MdSyncAlt,
        badge: "ADDON",
        path: "/admin/referral",
        children: [
            { id: "set-referral-commission", name: "Referral users commission", path: "/admin/referral/commission" },
            { id: "referral-users", name: "Referral Users", path: "/admin/referral/users" },
            { id: "referral-earnings", name: "Referral Earnings", path: "/admin/referral/earnings" },
            { id: "wallet-withdraw-request", name: "Wallet Withdraw Request", path: "/admin/referral/withdraw" },
        ],
    },
    {
        id: "support-ticket",
        name: "Support Ticket (Addon)",
        icon: MdSupportAgent,
        badge: "ADDON",
        path: "/admin/support",
        children: [
            { id: "active-tickets", name: "Active Tickets", path: "/admin/support/active" },
            {
                id: "support-settings",
                name: "Support Settings",
                path: "/admin/support/settings",
                children: [
                    { id: "category", name: "Category", path: "/admin/support/settings/category" },
                    { id: "default-assigned-agent", name: "Default Assigned Agent", path: "/admin/support/settings/agent" },
                ],
            },
        ],
    },
    {
        id: "otp-system",
        name: "OTP System (Addon)",
        icon: MdSecurity,
        badge: "ADDON",
        path: "/admin/otp",
        children: [
            { id: "sms-templates", name: "SMS Templates", path: "/admin/otp/templates" },
            { id: "set-otp-credentials", name: "Set OTP Credentials", path: "/admin/otp/credentials" },
            { id: "send-sms", name: "Send SMS", path: "/admin/otp/send" },
        ],
    },
    {
        id: "offline-payment-system",
        name: "Offline Payment System",
        icon: MdAccountBalance,
        path: "/admin/offline-payments",
        children: [{ id: "manual-payment-methods", name: "Manual Payment Methods", path: "/admin/offline-payments/manual" }],
    },
    {
        id: "uploaded-files",
        name: "Uploaded Files",
        icon: MdFolder,
        path: "/admin/uploaded-files",
    },
    {
        id: "website-setup",
        name: "Website Setup",
        icon: MdSettings,
        path: "/admin/website-setup",
        children: [
            { id: "header", name: "Header", path: "/admin/setup/header" },
            { id: "footer", name: "Footer", path: "/admin/setup/footer" },
            { id: "pages", name: "Pages", path: "/admin/setup/pages" },
            { id: "appearance", name: "Appearance", path: "/admin/setup/appearance" },
            { id: "ecosystem", name: "Ecosystem", path: "/admin/setup/ecosystem" },
        ],
    },
    {
        id: "settings",
        name: "Settings",
        icon: MdSettings,
        path: "/admin/settings",
        children: [
            { id: "general-settings", name: "General Settings", path: "/admin/settings/general" },
            { id: "language", name: "Language", path: "/admin/settings/language" },
            { id: "currency", name: "Currency", path: "/admin/settings/currency" },
            { id: "payment-methods", name: "Payment Methods", path: "/admin/settings/payments" },
            { id: "smtp-settings", name: "SMTP Settings", path: "/admin/settings/smtp" },
            { id: "email-templates", name: "Email Templates", path: "/admin/settings/email-templates" },
            { id: "third-party-settings", name: "Third Party Settings", path: "/admin/settings/third-party" },
            { id: "social-media-login", name: "Social Media Login", path: "/admin/settings/social-login" },
            { id: "firebase-push-notification", name: "Firebase Push Notification", path: "/admin/settings/push-notification" },
        ],
    },
    {
        id: "staffs",
        name: "Staffs",
        icon: MdGroup,
        path: "/admin/staffs",
        children: [
            { id: "all-staffs", name: "All Staffs", path: "/admin/staffs/all" },
            { id: "staff-roles", name: "Staff Roles", path: "/admin/staffs/roles" },
            { id: "outsourced-personnel", name: "Outsourced Personnel", path: "/admin/staffs/outsourced" },
            { id: "super-onboarding", name: "Ecosystem Onboarding", path: "/admin/staffs/registration" },
        ],
    },
    {
        id: "system",
        name: "System",
        icon: MdComputer,
        path: "/admin/system",
        children: [
            { id: "update", name: "Update", path: "/admin/system/update" },
            { id: "server-status", name: "Server Status", path: "/admin/system/status" },
        ],
    },
    {
        id: "manager-permissions",
        name: "Manager Permissions",
        icon: MdAdminPanelSettings,
        path: "/admin/manager-permissions",
    },
    {
        id: "addon-manager",
        name: "Addon Manager",
        icon: MdExtension,
        path: "/admin/addon-manager",
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const MenuItem: React.FC<{ item: MenuItem; depth?: number; search: string; collapsed: boolean }> = ({ item, depth = 0, search, collapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Check if this item or any of its children match the search
    const matchesSearch = (item: MenuItem): boolean => {
        if (item.name.toLowerCase().includes(search.toLowerCase())) return true;
        if (item.children) return item.children.some(child => matchesSearch(child));
        return false;
    };

    if (search && !matchesSearch(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isActive = location.pathname === item.path || (hasChildren && location.pathname.startsWith(item.path));

    const toggle = (e: React.MouseEvent) => {
        if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className={styles.menuItemWrapper}>
            <NavLink
                to={item.path}
                className={({ isActive: linkActive }) =>
                    `${styles.menuItem} ${(linkActive || isActive) ? styles.activeItem : ''} ${depth > 0 ? styles.subItem : ''} ${collapsed ? styles.collapsedItem : ''}`
                }
                onClick={toggle}
                title={collapsed ? item.name : ''}
            >
                <div className={styles.itemContent}>
                    {item.icon && (
                        <span className={styles.icon}>
                            {typeof item.icon === 'string' ? item.icon : <item.icon />}
                        </span>
                    )}
                    {!collapsed && <span>{item.name}</span>}
                    {!collapsed && item.badge && <span className={styles.badge}>{item.badge}</span>}
                </div>
                {!collapsed && hasChildren && (
                    <span className={`${styles.chevron} ${isOpen || isActive ? styles.chevronOpen : ''}`}>▶</span>
                )}
            </NavLink>

            {hasChildren && !collapsed && (isOpen || isActive || search) && (
                <div className={styles.childrenContainer}>
                    {item.children?.map(child => (
                        <MenuItem key={child.id} item={child} depth={depth + 1} search={search} collapsed={collapsed} />
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminSidebar: React.FC<Pick<SidebarProps, 'collapsed'>> = ({ collapsed }) => {
    const [search, setSearch] = useState('');
    const { logout } = useAuth();

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.header}>
                {!collapsed ? (
                    <>
                        <div className={styles.logo}>E-Advocate</div>
                        <div className={styles.logoSubtitle}>SUPER ADMIN</div>
                    </>
                ) : (
                    <div className={styles.logoCollapsed}>E</div>
                )}
            </div>

            {!collapsed && (
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search menu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            <nav className={styles.menuContainer}>
                {MENU_SCHEMA.map(item => (
                    <MenuItem key={item.id} item={item} search={search} collapsed={collapsed} />
                ))}
            </nav>

            <div className={styles.footer}>
                <button
                    className={styles.logoutBtn}
                    onClick={() => logout()}
                    title={collapsed ? "Logout" : ""}
                >
                    <MdLogout className={styles.logoutIcon} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
