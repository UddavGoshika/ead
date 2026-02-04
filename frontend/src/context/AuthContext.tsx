import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (user: User, token?: string) => void;
    logout: () => void;
    refreshUser: (updates: Partial<User>) => void;
    isAuthModalOpen: boolean;
    openAuthModal: (tab?: 'login' | 'register') => void;
    closeAuthModal: () => void;
    authTab: 'login' | 'register';
    isFilterModalOpen: boolean;
    openFilterModal: () => void;
    closeFilterModal: () => void;
    isAdvocateRegOpen: boolean;
    openAdvocateReg: () => void;
    closeAdvocateReg: () => void;
    isClientRegOpen: boolean;
    openClientReg: () => void;
    closeClientReg: () => void;
    isLegalProviderRegOpen: boolean;
    openLegalProviderReg: () => void;
    closeLegalProviderReg: () => void;
    searchRole: 'advocates' | 'clients';
    setSearchRole: (role: 'advocates' | 'clients') => void;
    isHelpModalOpen: boolean;
    openHelpModal: () => void;
    closeHelpModal: () => void;
    isImpersonating: boolean;
    impersonate: (user: User) => void;
    switchBackToAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    console.log('AuthProvider: Initializing');
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                console.error("Failed to parse saved user", e);
                return null;
            }
        }
        return null;
    });
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        // STRICT CHECK: User is only logged in if they have a token AND the flag
        const hasToken = !!localStorage.getItem('token');
        const hasFlag = localStorage.getItem('isLoggedIn') === 'true';
        return hasToken && hasFlag;
    });
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAdvocateRegOpen, setIsAdvocateRegOpen] = useState(false);
    const [isClientRegOpen, setIsClientRegOpen] = useState(false);
    const [isLegalProviderRegOpen, setIsLegalProviderRegOpen] = useState(false);
    const [searchRole, setSearchRole] = useState<'advocates' | 'clients'>('advocates');
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isImpersonating, setIsImpersonating] = useState<boolean>(() => {
        return localStorage.getItem('isImpersonating') === 'true';
    });

    // Initial logging & Token Verification + Background Polling for Live Updates
    useEffect(() => {
        console.log('AuthProvider: Mounted, isLoggedIn:', isLoggedIn);

        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { authService } = await import('../services/api');
                    const res = await authService.getCurrentUser();
                    if (res.data.success) {
                        console.log('[AUTH] Verified User & Plan:', res.data.user.plan);
                        const updatedUser = res.data.user;
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        localStorage.setItem('userRole', updatedUser.role);
                    }
                } catch (error) {
                    console.error('[AUTH] Token verification failed:', error);
                }
            }
        };

        verifyToken();

        // Rule: Live Updates from Server (Every 30s)
        const pollInterval = setInterval(() => {
            if (localStorage.getItem('token')) {
                verifyToken();
            }
        }, 30000);

        return () => clearInterval(pollInterval);
    }, []);

    const login = (userData: User, token?: string) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', userData.role);
        // If token is provided, set it. Otherwise assume it was set by the caller.
        if (token) localStorage.setItem('token', token);
        console.log('[AUTH] Login successful, token set:', !!localStorage.getItem('token'));
        setIsAuthModalOpen(false);
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('token'); // ENSURE TOKEN IS REMOVED
        window.location.href = '/';
    };

    const openAuthModal = (tab: 'login' | 'register' = 'login') => {
        setAuthTab(tab);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => setIsAuthModalOpen(false);

    const openFilterModal = () => setIsFilterModalOpen(true);
    const closeFilterModal = () => setIsFilterModalOpen(false);

    const openAdvocateReg = () => {
        setIsAuthModalOpen(false);
        setIsAdvocateRegOpen(true);
    };
    const closeAdvocateReg = () => setIsAdvocateRegOpen(false);

    const openClientReg = () => {
        setIsAuthModalOpen(false);
        setIsClientRegOpen(true);
    };
    const closeClientReg = () => setIsClientRegOpen(false);

    const openLegalProviderReg = () => {
        setIsAuthModalOpen(false);
        setIsLegalProviderRegOpen(true);
    };
    const closeLegalProviderReg = () => setIsLegalProviderRegOpen(false);

    const openHelpModal = () => setIsHelpModalOpen(true);
    const closeHelpModal = () => setIsHelpModalOpen(false);

    const impersonate = async (targetUser: User) => {
        try {
            const adminToken = localStorage.getItem('token');
            const res = await axios.post(`/api/admin/impersonate/${targetUser.id}`, {}, {
                headers: { Authorization: adminToken }
            });

            if (res.data.success) {
                // Save admin session
                const currentUser = localStorage.getItem('user');
                localStorage.setItem('adminReferrer', window.location.pathname);
                if (adminToken) localStorage.setItem('adminToken', adminToken);
                if (currentUser) localStorage.setItem('adminUser', currentUser);

                // Switch to user session
                const { token, user: impersonatedUser } = res.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(impersonatedUser));
                localStorage.setItem('userRole', impersonatedUser.role);
                localStorage.setItem('isImpersonating', 'true');

                setUser(impersonatedUser);
                setIsImpersonating(true);

                // Redirect based on role
                const role = impersonatedUser.role.toLowerCase();
                if (role === 'advocate') window.location.href = '/dashboard/advocate';
                else if (role === 'client') window.location.href = '/dashboard/client';
                else if (role === 'legal_provider') window.location.href = '/dashboard/advisor';
                else window.location.href = '/dashboard/user';
            } else {
                alert(res.data.error || 'Failed to impersonate member');
            }
        } catch (err: any) {
            console.error('Impersonation call failed:', err);
            alert(err.response?.data?.error || 'Error during impersonation');
        }
    };

    const switchBackToAdmin = () => {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');
        const adminReferrer = localStorage.getItem('adminReferrer');

        if (adminToken && adminUser) {
            localStorage.setItem('token', adminToken);
            localStorage.setItem('user', adminUser);
            const parsedAdmin = JSON.parse(adminUser);
            localStorage.setItem('userRole', parsedAdmin.role);
            localStorage.setItem('isLoggedIn', 'true');

            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminReferrer');
            localStorage.removeItem('isImpersonating');

            setUser(parsedAdmin);
            setIsImpersonating(false);

            // Redirect back to exactly where the admin was, or fallback to /admin
            window.location.href = adminReferrer || '/admin';
        } else {
            // Fallback: just clear impersonation
            localStorage.removeItem('isImpersonating');
            localStorage.removeItem('adminReferrer');
            setIsImpersonating(false);
            window.location.href = '/admin';
        }
    };

    const refreshUser = (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('[AUTH] User refreshed:', updatedUser);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoggedIn,
            login,
            logout,
            refreshUser, // Added
            isAuthModalOpen,
            openAuthModal,
            closeAuthModal,
            authTab,
            isFilterModalOpen,
            openFilterModal,
            closeFilterModal,
            isAdvocateRegOpen,
            openAdvocateReg,
            closeAdvocateReg,
            isClientRegOpen,
            openClientReg,
            closeClientReg,
            isLegalProviderRegOpen,
            openLegalProviderReg,
            closeLegalProviderReg,
            searchRole,
            setSearchRole,
            isHelpModalOpen,
            openHelpModal,
            closeHelpModal,
            isImpersonating,
            impersonate,
            switchBackToAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
