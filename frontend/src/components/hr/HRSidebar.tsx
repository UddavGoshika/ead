import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdLogout } from 'react-icons/md';
import styles from '../admin/AdminSidebar.module.css';

import {
    MdPeopleOutline,
    MdPayment,
    MdEventAvailable,
    MdHistoryEdu,
    MdDashboard,
    MdAdminPanelSettings
} from "react-icons/md";

export interface MenuItem {
    id: string;
    name: string;
    icon?: any;
    path: string;
    badge?: string;
    children?: MenuItem[];
}

export const HR_MENU: MenuItem[] = [
    {
        id: "hr-workspace",
        name: "Human Resources Hub",
        icon: MdDashboard,
        path: "/hr/workspace",
    },
    {
        id: "recruitment-hub",
        name: "Recruitment & Onboarding",
        icon: MdPeopleOutline,
        path: "/hr/recruitment",
        badge: "NEW"
    },
    {
        id: "staff-directory",
        name: "Professional Registry",
        icon: MdPeopleOutline,
        path: "/hr/staff",
    },
    {
        id: "role-management",
        name: "Role & Permission Ops",
        icon: MdAdminPanelSettings,
        path: "/hr/roles",
        badge: "MODIFIED"
    },
    {
        id: "payroll-stats",
        name: "Incentive Analytics",
        icon: MdPayment,
        path: "/hr/payroll",
    },
    {
        id: "capacity-planning",
        name: "Capacity Planning",
        icon: MdEventAvailable,
        path: "/hr/planning",
    },
    {
        id: "audit-logs",
        name: "Professional Audit",
        icon: MdHistoryEdu,
        path: "/hr/audit",
        children: [
            { id: "staff-actions", name: "Staff Action Logs", path: "/hr/audit/actions" },
            { id: "access-logs", name: "System Access Logs", path: "/hr/audit/access" },
        ],
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

const HRSidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const [search, setSearch] = useState('');
    const { logout } = useAuth();

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.header}>
                {!collapsed ? (
                    <>
                        <div className={styles.logo}>E-Advocate</div>
                        <div className={styles.logoSubtitle}>HR MANAGEMENT</div>
                    </>
                ) : (
                    <div className={styles.logoCollapsed}>H</div>
                )}
            </div>

            {!collapsed && (
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search personnel..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            <nav className={styles.menuContainer}>
                {HR_MENU.map(item => (
                    <MenuItemComponent key={item.id} item={item} search={search} collapsed={collapsed} />
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

export default HRSidebar;
