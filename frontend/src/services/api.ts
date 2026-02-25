import axios from 'axios';
import type { AuthResponse, Case, Advocate } from '../types';
import { API_BASE_URL } from '../config';

export interface ClientProfile {
    id: string;
    unique_id: string;
    name: string;
    location: string;
    experience: string;
    specialization: string;
    img: string;
}

const api = axios.create({
    baseURL: API_BASE_URL ? `${API_BASE_URL.replace(/\/$/, '')}/api` : '/api',
});

// Add a request interceptor to attach the token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        const authValue = token.startsWith('user-token-') ? token : `Bearer ${token}`;

        // Ensure headers object exists
        if (!config.headers) {
            config.headers = {} as any;
        }

        // Set both for compatibility - using multiple methods for robustness
        if (typeof (config.headers as any).set === 'function') {
            (config.headers as any).set('Authorization', authValue);
            (config.headers as any).set('x-auth-token', token);
        } else {
            config.headers['Authorization'] = authValue;
            config.headers['x-auth-token'] = token;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authService = {
    login: (credentials: any) => api.post<AuthResponse>('/auth/login', credentials),
    register: (data: any) => api.post<AuthResponse>('/auth/register', data),
    registerClient: (data: any) => api.post<AuthResponse>('/client/register', data),
    registerAdvocate: (data: any) => api.post<AuthResponse>('/advocate/register', data),
    sendOtp: (email: string, checkUnique?: boolean) => api.post<any>('/auth/send-otp', { email, checkUnique }),
    verifyOtp: (email: string, otp: string) => api.post<any>('/auth/verify-otp', { email, otp }),
    forgotPassword: (email: string) => api.post<any>('/auth/forgot-password', { email }),
    initiateResetOtp: (data: { token: string, identifier: string }) => api.post<any>('/auth/reset-password/initiate', data),
    resetPassword: (data: any) => api.post<any>('/auth/reset-password', data),
    changePassword: (data: any) => api.post<any>('/auth/change-password', data),
    getProfile: () => api.get<{ success: boolean, user: any }>('/auth/me'),
    getCurrentUser: () => api.get<any>('/auth/me'),
    updateProfile: (data: { email?: string, name?: string, profilePic?: string, loginId?: string }) => api.put<{ success: boolean, user: any }>('/auth/profile', data),
    uploadProfileImage: (formData: FormData) => api.post<{ success: boolean, imageUrl: string }>('/auth/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    generateSuperAdminKey: () => api.post<{ success: boolean, key: string, message: string }>('/auth/generate-super-admin-key'),
    setSuperAdminKey: (key: string) => api.post<{ success: boolean, message: string }>('/auth/set-super-admin-key', { key }),
    loginWithKey: (data: { email: string, key: string }) => api.post<{ success: boolean, token: string, user: any }>('/auth/login-key', data),
    toggleMaintenance: (enabled: boolean) => api.post<{ success: boolean }>('/auth/emergency/maintenance', { enabled }),
};

export const advocateService = {
    getAdvocates: (filters: {
        search?: string,
        language?: string,
        specialization?: string,
        subSpecialization?: string,
        court?: string,
        state?: string,
        district?: string,
        city?: string,
        experience?: string,
        consultationMode?: string
    } = {}) =>
        api.get<{ success: boolean; advocates: Advocate[] }>('/advocates', { params: filters }),
    getAdvocateById: (id: number | string) =>
        api.get<{ success: boolean; advocate: Advocate }>(`/advocates/${id}`),
    getMe: () => api.get<{ success: boolean; advocate: any }>('/advocates/me'),
    updateAdvocate: (uniqueId: string, data: any) => api.put<{ success: boolean; advocate: Advocate }>(`/advocates/update/${uniqueId}`, data),
};

export const clientService = {
    getClients: (filters: {
        search?: string,
        language?: string,
        category?: string,
        specialization?: string,
        subDepartment?: string,
        city?: string,
        state?: string,
        district?: string,
        consultationMode?: string
    } = {}) =>
        api.get<{ success: boolean; clients: ClientProfile[] }>('/client', { params: filters }),
    getClientById: (userId: string) => api.get<{ success: boolean; client: any }>(`/client/${userId}`),
    updateClient: (uniqueId: string, data: any) => api.put<{ success: boolean; client: any }>(`/client/update/${uniqueId}`, data),
};

export const adminService = {
    onboardStaff: (data: any) => api.post<{ success: boolean; message: string; userId: string; mailSent: boolean }>('/admin/onboard-staff', data),
    getStaff: () => api.get<{ success: boolean; staff: any[] }>('/admin/staff'),
    getStaffReports: (staffId: string, frequency?: string) => api.get<{ success: boolean; reports: any[] }>(`/admin/staff/${staffId}/reports`, { params: { frequency } }),
    getReportLeads: (reportId: string) => api.get<{ success: boolean; leads: any[] }>(`/admin/reports/${reportId}/leads`),
    getStaffWorkLogs: (staffId: string) => api.get<{ success: boolean; logs: any[] }>(`/admin/staff/${staffId}/work-logs`),
    allocateProject: (staffId: string, project: string) => api.post<{ success: boolean; profile: any }>(`/admin/staff/${staffId}/allocate`, { project }),
    updateMemberStatus: (id: string, status: string) => api.patch<{ success: boolean; user: any }>(`/admin/members/${id}/status`, { status }),
    updateTransactionStatus: (id: string, status: string, remarks?: string) => api.patch<{ success: boolean; transaction: any }>(`/admin/transactions/${id}/status`, { status, remarks }),
};

export const caseService = {
    getCases: (filters: any = {}) =>
        api.get<{ success: boolean; cases: Case[] }>('/cases', { params: filters }),
    fileCase: (caseData: any) =>
        api.post<{ success: boolean; case: Case }>('/cases', caseData),
    getMetrics: (userId: number | string) =>
        api.get<any>('/metrics', { params: { userId } }),
};

export const staffService = {
    getMyLeads: () => api.get<{ success: boolean; leads: any[] }>('/staff/my-leads'),
    getAllMembers: () => api.get<{ success: boolean; members: any[] }>('/staff/all-members'),
    updateLead: (id: string, data: any) =>
        api.post<{ success: boolean; lead: any }>(`/staff/leads/${id}/update`, data),
    getPerformance: () => api.get<{ success: boolean; stats: any }>('/staff/performance'),
    getCallLogs: () => api.get<{ success: boolean; logs: any[] }>('/staff/call-logs'),
    getAgents: () => api.get<{ success: boolean; agents: any[] }>('/admin/staff'), // Reusing admin staff list for now
};

export const walletService = {
    getHistory: () => api.get<{ success: boolean; transactions: any[] }>('/payments/history'),
    withdraw: (data: { amount: number; bankDetails?: any }) => api.post<{ success: boolean; message: string; balance: number }>('/payments/withdraw', data),
};

export const settingsService = {
    getSettings: () => api.get<{ success: boolean; privacy: any; presets: any[]; status: string }>('/settings'),
    updatePrivacy: (settings: any) => api.put<{ success: boolean; privacy: any }>('/settings/privacy', settings),
    updateNotifications: (settings: any) => api.put<{ success: boolean; notificationSettings: any }>('/settings/notifications', settings),
    updateMessaging: (settings: any) => api.put<{ success: boolean; messageSettings: any }>('/settings/messaging', settings),
    deactivateAccount: () => api.post<{ success: boolean }>('/settings/deactivate'),
    deleteAccount: () => api.post<{ success: boolean }>('/settings/delete'),
    syncPresets: (presets: any[]) => api.post<{ success: boolean; presets: any[] }>('/settings/presets', { presets }),
};

export const blogService = {
    getBlogs: () => api.get<{ success: boolean; blogs: any[] }>('/blogs'),
    getBlogById: (id: string) => api.get<{ success: boolean; blog: any }>(`/blogs/${id}`),
    likeBlog: (id: string, userId: string) => api.post(`/blogs/${id}/like`, { userId }),
    saveBlog: (id: string, userId: string) => api.post(`/blogs/${id}/save`, { userId }),
    shareBlog: (id: string) => api.post(`/blogs/${id}/share`),
    commentBlog: (id: string, data: { userId: string, userName: string, text: string }) => api.post(`/blogs/${id}/comment`, data),
};

export const supportService = {
    getTickets: () => api.get<{ success: boolean; tickets: any[] }>('/support/tickets'),
    reply: (ticketId: string, message: string) => api.post<{ success: boolean; message: string }>('/support/reply', { ticketId, message }),
    broadcast: (data: { role: string; subject: string; message: string }) => api.post<{ success: boolean; sent: number; total: number }>('/support/broadcast', data),
    getStats: () => api.get<{ success: boolean; totalUsers: number; openInquiries: number; recentLogs: any[] }>('/support/stats'),
    sync: () => api.get<{ success: boolean; count: number; error?: string }>('/support/sync'),
};

export const referralService = {
    getUsers: () => api.get<{ success: boolean; users: any[] }>('/admin/referral/users'),
    onboardUser: (data: any) => api.post<{ success: boolean; message: string; user: any }>('/admin/referral/onboard-user', data),
    getStats: () => api.get<{ success: boolean; stats: any }>('/referral/stats'),
    getReferrals: () => api.get<{ success: boolean; referrals: any[] }>('/referral/referrals'),
    withdraw: (data: { amount: number; bankDetails?: any }) => api.post<{ success: boolean; message: string }>('/referral/withdraw', data),

    // Offers
    getOffers: () => api.get<{ success: boolean; offers: any[] }>('/referral/offers'),
    adminGetOffers: () => api.get<{ success: boolean; offers: any[] }>('/admin/referral/offers'),
    saveOffer: (data: any) => api.post<{ success: boolean; offer: any }>('/admin/referral/offers', data),
    deleteOffer: (id: string) => api.delete<{ success: boolean }>('/admin/referral/offers/' + id),
    verifyCoupon: (code: string) => api.post<{ success: boolean; discount: number; discountType: string; minPurchase: number; offerId?: string }>('/referral/verify-coupon', { code }),
    getOffersHistory: () => api.get<{ success: boolean; offers: any[] }>('/referral/offers/history'),
};

export const contactService = {
    submitInquiry: (data: { name: string, email?: string, phone?: string, subject?: string, message: string, category?: string, source?: string }) =>
        api.post<{ success: boolean, message: string }>('/contact', data),
};


export default api;
