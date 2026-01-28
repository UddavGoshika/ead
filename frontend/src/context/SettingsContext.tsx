import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
    social_links: {
        instagram: string;
        facebook: string;
        linkedin: string;
        twitter: string;
        whatsapp: string;
    };
    ecosystem_links: Array<{ label: string; link: string; icon_url: string }>;
    manager_permissions: Record<string, boolean>;
    appearance: {
        primary_color: string;
        dark_mode: boolean;
    };
}

interface SettingsContextType {
    settings: Settings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
    updateSettings: (newSettings: Partial<Settings>) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: Partial<Settings>) => {
        try {
            const response = await axios.post('/api/settings', newSettings);
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
        refreshSettings();

        // Listen for changes from other tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'settings_timestamp') {
                refreshSettings();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
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
