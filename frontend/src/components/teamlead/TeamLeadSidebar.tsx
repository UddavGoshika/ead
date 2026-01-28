import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from '../admin/AdminSidebar.module.css';

import {
    MdPeople,
    MdDashboard,
    MdSupervisorAccount,
    MdReport
} from "react-icons/md";

export interface MenuItem {
    id: string;
    name: string;
    icon?: any;
    path: string;
    badge?: string;
    children?: MenuItem[];
}

export const TEAM_LEAD_MENU: MenuItem[] = [
    {
        id: "tl-workspace",
        name: "TL Operations Hub",
        icon: MdDashboard,
        path: "/team-lead/workspace",
    },
    {
        id: "team-supervision",
        name: "Field Supervision",
        icon: MdSupervisorAccount,
        path: "/team-lead/monitoring",
        badge: "LIVE",
        children: [
            { id: "active-mon", name: "Real-time Monitoring", path: "/team-lead/monitoring" },
            { id: "escalation-log", name: "Escalation Logs", path: "/team-lead/queries" },
        ]
    },
    {
        id: "registry-audit",
        name: "Registry Command",
        icon: MdPeople,
        path: "/team-lead/members",
        children: [
            { id: "pending-approval", name: "Pending Approval", path: "/team-lead/members/pending" },
            { id: "premium-registry", name: "Premium Registry", path: "/team-lead/members/premium" },
            { id: "all-members", name: "Full Directory", path: "/team-lead/members/all" },
        ],
    },
    {
        id: "work-manifests",
        name: "Operational Reports",
        icon: MdReport,
        path: "/team-lead/reports",
        children: [
            { id: "daily-logs", name: "Daily Work Logs", path: "/team-lead/reports/daily" },
            { id: "audit-trails", name: "Audit Trails", path: "/team-lead/reports/audit" },
        ]
    }
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
                        <MenuItemComponent key={child.id} item={child} depth={depth + 1} search={search} collapsed={collapsed} />
                    ))}
                </div>
            )}
        </div>
    );
};

const TeamLeadSidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const [search, setSearch] = useState('');

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.header}>
                {!collapsed ? (
                    <>
                        <div className={styles.logo}>E-Advocate</div>
                        <div className={styles.logoSubtitle}>TEAM LEAD OPS</div>
                    </>
                ) : (
                    <div className={styles.logoCollapsed}>T</div>
                )}
            </div>

            {!collapsed && (
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search team assets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            <nav className={styles.menuContainer}>
                {TEAM_LEAD_MENU.map(item => (
                    <MenuItemComponent key={item.id} item={item} search={search} collapsed={collapsed} />
                ))}
            </nav>
        </aside>
    );
};

export default TeamLeadSidebar;
