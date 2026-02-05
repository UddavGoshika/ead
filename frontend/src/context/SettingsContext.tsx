import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

interface Settings {
    site_name: string;
    site_title: string;
    hero_title: string;
    hero_subtitle: string;
    marquee_text: string;
    logo_url_left: string;
    logo_url_right: string;
    logo_url_hero: string;
    header_menu: Array<{ label: string; link: string }>;
    footer_text: string;
    contact_email: string;
    contact_phone: string;
    social_links: Array<{
        platform: string;
        url: string;
        icon: string;
        active: boolean;
    }>;
    footer_pages: Array<{
        title: string;
        link: string;
        active: boolean;
    }>;
    ecosystem_links: Array<{ label: string; link: string; icon_url: string }>;
    manager_permissions: Record<string, boolean>;
    appearance: {
        primary_color: string;
        dark_mode: boolean;
    };
    invoice_header_url: string;
}

interface PageItem {
    _id: string;
    title: string;
    route: string;
    status: "Published" | "Draft";
    category: string;
    content: string;
}

interface SettingsContextType {
    settings: Settings | null;
    pages: PageItem[];
    loading: boolean;
    refreshSettings: () => Promise<void>;
    updateSettings: (newSettings: Partial<Settings>) => Promise<boolean>;
    refreshPages: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [pages, setPages] = useState<PageItem[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const response = await api.get('/settings/site');
            if (response.data.success) {
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const refreshPages = async () => {
        try {
            const response = await api.get('/pages');
            if (response.data.success) {
                setPages(response.data.pages);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    const updateSettings = async (newSettings: Partial<Settings>) => {
        try {
            const response = await api.post('/settings/site', newSettings);
            if (response.data.success) {
                setSettings(response.data.settings);
                // Trigger sync for other tabs
                localStorage.setItem('settings_timestamp', Date.now().toString());
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating settings:', error);
            return false;
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([refreshSettings(), refreshPages()]);
            setLoading(false);
        };
        init();

        // Listen for changes from other tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'settings_timestamp' || e.key === 'pages_timestamp') {
                refreshSettings();
                refreshPages();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, pages, loading, refreshSettings, updateSettings, refreshPages }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
