import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdLogout } from 'react-icons/md';
import styles from '../admin/AdminSidebar.module.css';

import {
    MdPeople,
    MdEmail,
    MdPayments,
    MdHeadsetMic
} from "react-icons/md";

export interface MenuItem {
    id: string;
    name: string;
    icon?: any;
    path: string;
    badge?: string;
    children?: MenuItem[];
}

export const CUSTOMER_CARE_MENU: MenuItem[] = [
    {
        id: "support-workspace",
        name: "Support Workspace",
        icon: MdHeadsetMic,
        path: "/customer-care/workspace",
        badge: "LIVE"
    },
    {
        id: "queries",
        name: "Contact Queries",
        icon: MdEmail,
        path: "/customer-care/queries",
    },
    {
        id: "payments",
        name: "Package Payments",
        icon: MdPayments,
        path: "/customer-care/payments",
    },
    {
        id: "members",
        name: "Members",
        icon: MdPeople,
        path: "/customer-care/members",
        children: [
            { id: "all-members", name: "All Members", path: "/customer-care/members/all" },
            { id: "free-members", name: "Free Members", path: "/customer-care/members/free" },
            { id: "premium-members", name: "Premium Members", path: "/customer-care/members/premium" },
            { id: "approved-members", name: "Approved Members", path: "/customer-care/members/approved" },
        ],
    }
];

interface SidebarProps {
    collapsed: boolean;
}

const MenuItem: React.FC<{ item: MenuItem; depth?: number; search: string; collapsed: boolean }> = ({ item, depth = 0, search, collapsed }) => {
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

const CustomerCareSidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const [search, setSearch] = useState('');
    const { logout } = useAuth();

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.header}>
                {!collapsed ? (
                    <>
                        <div className={styles.logo}>E-Advocate</div>
                        <div className={styles.logoSubtitle}>CUSTOMER CARE</div>
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
                        placeholder="Search workspace..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            <nav className={styles.menuContainer}>
                {CUSTOMER_CARE_MENU.map(item => (
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

export default CustomerCareSidebar;
