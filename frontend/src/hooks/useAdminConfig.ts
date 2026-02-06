import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_ATTRIBUTES, DEFAULT_SECTIONS } from '../config/adminConfig';
import api from '../services/api';

export const useAdminConfig = (role?: string) => {
    const [attributes, setAttributes] = useState(DEFAULT_ATTRIBUTES);
    const [sections, setSections] = useState(DEFAULT_SECTIONS);
    const [loading, setLoading] = useState(false);

    const loadConfig = useCallback(async (targetRole: string) => {
        setLoading(true);
        try {
            const [secRes, attrRes] = await Promise.all([
                api.get(`/admin/config/sections/${targetRole}`),
                api.get(`/admin/config/attributes/${targetRole}`)
            ]);

            if (secRes.data.success && secRes.data.sections && secRes.data.sections.length > 0) {
                setSections(secRes.data.sections);
            } else {
                setSections(DEFAULT_SECTIONS);
            }

            if (attrRes.data.success && attrRes.data.attributes && attrRes.data.attributes.length > 0) {
                setAttributes(attrRes.data.attributes);
            } else {
                setAttributes(DEFAULT_ATTRIBUTES);
            }
        } catch (e) {
            console.error("Failed to load admin config", e);
            // Fallback to defaults on error
            setSections(DEFAULT_SECTIONS);
            setAttributes(DEFAULT_ATTRIBUTES);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (role) {
            loadConfig(role);
        }
    }, [role, loadConfig]);

    const saveAttributes = async (newAttributes: typeof DEFAULT_ATTRIBUTES, targetRole?: string) => {
        const r = targetRole || role;
        if (!r) {
            console.error("No role specified for saving attributes");
            return;
        }

        setAttributes(newAttributes); // Optimistic update
        try {
            await api.post(`/admin/config/attributes/${r}`, { attributes: newAttributes });
        } catch (e) {
            console.error("Failed to save attributes", e);
            // Ideally revert state here, but for now we log
        }
    };

    const saveSections = async (newSections: typeof DEFAULT_SECTIONS, targetRole?: string) => {
        const r = targetRole || role;
        if (!r) {
            console.error("No role specified for saving sections");
            return;
        }

        setSections(newSections);
        try {
            await api.post(`/admin/config/sections/${r}`, { sections: newSections });
        } catch (e) {
            console.error("Failed to save sections", e);
        }
    };

    const getOptions = (categoryId: string) => {
        const category = attributes.find(c => c.id === categoryId);
        return category ? category.options.filter(o => o.enabled) : [];
    };

    const isSectionEnabled = (sectionName: string) => {
        const section = sections.find(s => s.name.toLowerCase().includes(sectionName.toLowerCase()) || sectionName.toLowerCase().includes(s.name.toLowerCase()));
        return section ? section.enabled : true;
    };

    return {
        attributes,
        sections,
        loading,
        loadConfig,
        saveAttributes,
        saveSections,
        getOptions,
        isSectionEnabled
    };
};
