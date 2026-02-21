import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
    fontSize: number;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    resetFontSize: () => void;
    currentLanguage: string;
    changeLanguage: (langCode: string) => void;
    languages: { name: string; code: string }[];
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fontSize, setFontSize] = useState<number>(() => {
        const saved = localStorage.getItem('accessibility-font-size');
        return saved ? parseInt(saved, 10) : 16;
    });

    const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
        return localStorage.getItem('accessibility-lang') || 'en';
    });

    const languages = [
        { name: "English", code: "en" },
        { name: "Hindi", code: "hi" },
        { name: "Bengali", code: "bn" },
        { name: "Telugu", code: "te" },
        { name: "Marathi", code: "mr" },
        { name: "Tamil", code: "ta" },
        { name: "Urdu", code: "ur" },
        { name: "Gujarati", code: "gu" },
        { name: "Kannada", code: "kn" },
        { name: "Odia", code: "or" },
        { name: "Punjabi", code: "pa" },
        { name: "Malayalam", code: "ml" },
        { name: "Assamese", code: "as" },
        { name: "Maithili", code: "mai" },
        { name: "Santali", code: "sat" },
        { name: "Kashmiri", code: "ks" },
        { name: "Nepali", code: "ne" },
        { name: "Konkani", code: "kok" },
        { name: "Sindhi", code: "sd" },
        { name: "Dogri", code: "doi" },
        { name: "Manipuri", code: "mni" },
        { name: "Bodo", code: "brx" },
        { name: "Sanskrit", code: "sa" },
    ];

    useEffect(() => {
        document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
        localStorage.setItem('accessibility-font-size', fontSize.toString());

        const convertPxToRem = (node: Node) => {
            if (node.nodeType !== 1) return;
            const el = node as HTMLElement;
            const style = window.getComputedStyle(el);
            const fontSizeAttr = el.style.fontSize;
            if (fontSizeAttr && fontSizeAttr.includes('px')) {
                const pxValue = parseFloat(fontSizeAttr);
                el.style.fontSize = `${pxValue / 16}rem`;
            }
            el.childNodes.forEach(convertPxToRem);
        };

        // Initial conversion
        convertPxToRem(document.body);

        // Continuous conversion for new elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    convertPxToRem(node);
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [fontSize]);

    const setLanguageCookie = (langCode: string) => {
        const domain = window.location.hostname === 'localhost' ? '' : `domain=${window.location.hostname};`;
        document.cookie = `googtrans=/en/${langCode}; ${domain}path=/`;
        document.cookie = `googtrans=/en/${langCode}; path=/`; // Fallback
    };

    useEffect(() => {
        // Only keep the cookie syncing logic here as script is in index.html
        if (currentLanguage && currentLanguage !== 'en') {
            setLanguageCookie(currentLanguage);

            const timer = setInterval(() => {
                const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                if (select) {
                    if (select.value !== currentLanguage) {
                        select.value = currentLanguage;
                        select.dispatchEvent(new Event('change'));
                    }
                }
            }, 1000);
            return () => clearInterval(timer);
        } else {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
        }
    }, [currentLanguage]);

    const changeLanguage = (langCode: string) => {
        setCurrentLanguage(langCode);
        localStorage.setItem('accessibility-lang', langCode);
        setLanguageCookie(langCode);

        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event('change'));
        } else {
            window.location.reload();
        }
    };

    const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
    const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));
    const resetFontSize = () => setFontSize(16);

    return (
        <AccessibilityContext.Provider value={{
            fontSize,
            increaseFontSize,
            decreaseFontSize,
            resetFontSize,
            currentLanguage,
            changeLanguage,
            languages
        }}>
            {children}
            {/* Hidden element for Google Translate to attach to */}
            <div id="google_translate_element" style={{ position: 'absolute', top: '-9999px', left: '-9999px', visibility: 'hidden' }}></div>
            <style>{`
                .goog-te-banner-frame.skiptranslate, .goog-te-banner-frame { display: none !important; }
                body { top: 0px !important; }
                .skiptranslate { display: none !important; }
                #google_translate_element { display: none !important; }
                .VIpgJd-Zvi9nc-ORHb-nS-akv { display: none !important; } /* Hide the translate popup */
                iframe.goog-te-menu-frame { display: none !important; }
                .goog-tooltip { display: none !important; }
                .goog-tooltip:hover { display: none !important; }
                .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
            `}</style>
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
