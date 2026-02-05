import { useState, useEffect } from 'react';
import { DEFAULT_ATTRIBUTES, DEFAULT_SECTIONS } from '../config/adminConfig';

const ATTRIBUTES_KEY = 'eadvocate_admin_attributes';
const SECTIONS_KEY = 'eadvocate_admin_sections';

export const useAdminConfig = () => {
    const [attributes, setAttributes] = useState(DEFAULT_ATTRIBUTES);
    const [sections, setSections] = useState(DEFAULT_SECTIONS);

    useEffect(() => {
        const storedAttrs = localStorage.getItem(ATTRIBUTES_KEY);
        const storedSections = localStorage.getItem(SECTIONS_KEY);

        if (storedAttrs) {
            try {
                setAttributes(JSON.parse(storedAttrs));
            } catch (e) {
                console.error("Failed to parse stored attributes", e);
            }
        }

        if (storedSections) {
            try {
                setSections(JSON.parse(storedSections));
            } catch (e) {
                console.error("Failed to parse stored sections", e);
            }
        }
    }, []);

    const saveAttributes = (newAttributes: typeof DEFAULT_ATTRIBUTES) => {
        setAttributes(newAttributes);
        localStorage.setItem(ATTRIBUTES_KEY, JSON.stringify(newAttributes));
    };

    const saveSections = (newSections: typeof DEFAULT_SECTIONS) => {
        setSections(newSections);
        localStorage.setItem(SECTIONS_KEY, JSON.stringify(newSections));
    };

    const getOptions = (categoryId: string) => {
        const category = attributes.find(c => c.id === categoryId);
        return category ? category.options.filter(o => o.enabled) : [];
    };

    const isSectionEnabled = (sectionName: string) => {
        // Simple fuzzy match or exact match
        const section = sections.find(s => s.name.toLowerCase().includes(sectionName.toLowerCase()) || sectionName.toLowerCase().includes(s.name.toLowerCase()));
        return section ? section.enabled : true;
    };

    return {
        attributes,
        sections,
        saveAttributes,
        saveSections,
        getOptions,
        isSectionEnabled
    };
};
