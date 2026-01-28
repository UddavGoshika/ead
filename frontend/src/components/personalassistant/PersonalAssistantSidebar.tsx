import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from '../admin/AdminSidebar.module.css';

import {
    MdPeople,
    MdPayments,
    MdAssignment,
    MdEmail,
    MdDashboard
} from "react-icons/md";

export interface MenuItem {
    id: string;
    name: string;
    icon?: any;
    path: string;
    badge?: string;
    children?: MenuItem[];
}

export const PERSONAL_ASSISTANT_MENU: MenuItem[] = [
    {
        id: "assistant-workspace",
        name: "Assistant Workspace",
        icon: MdDashboard,
        path: "/personal-assistant/workspace",
    },
    {
        id: "my-assignments",
        name: "My Assignments",
        icon: MdAssignment,
        path: "/personal-assistant/assignments",
        badge: "NEW"
    },
    {
        id: "queries",
        name: "Client Queries",
        icon: MdEmail,
        path: "/personal-assistant/queries",
    },
    {
        id: "payments",
        name: "Fee Audit",
        icon: MdPayments,
        path: "/personal-assistant/payments",
    },
    {
        id: "members",
        name: "My Portfolio",
        icon: MdPeople,
        path: "/personal-assistant/members",
        children: [
            { id: "all-members", name: "Managed Members", path: "/personal-assistant/members/all" },
            { id: "premium-members", name: "Premium Portfolio", path: "/personal-assistant/members/premium" },
            { id: "pending-members", name: "Pending Approval", path: "/personal-assistant/members/pending" },
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

const PersonalAssistantSidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const [search, setSearch] = useState('');

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.header}>
                {!collapsed ? (
                    <>
                        <div className={styles.logo}>E-Advocate</div>
                        <div className={styles.logoSubtitle}>PERSONAL ASSISTANT</div>
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
                        placeholder="Search portfolio..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            <nav className={styles.menuContainer}>
                {PERSONAL_ASSISTANT_MENU.map(item => (
                    <MenuItem key={item.id} item={item} search={search} collapsed={collapsed} />
                ))}
            </nav>
        </aside>
    );
};

export default PersonalAssistantSidebar;
