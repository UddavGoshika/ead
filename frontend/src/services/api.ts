import axios from 'axios';
import type { AuthResponse, Case, Advocate } from '../types';

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
    baseURL: '/api',
});

// Add a request interceptor to attach the token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = token.startsWith('user-token-') ? token : `Bearer ${token}`;
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
    sendOtp: (email: string) => api.post<any>('/auth/send-otp', { email }),
    verifyOtp: (email: string, otp: string) => api.post<any>('/auth/verify-otp', { email, otp }),
    forgotPassword: (email: string) => api.post<any>('/auth/forgot-password', { email }),
    resetPassword: (data: any) => api.post<any>('/auth/reset-password', data),
    changePassword: (data: any) => api.post<any>('/auth/change-password', data),
    getProfile: () => api.get<{ success: boolean, user: any }>('/auth/me'),
    getCurrentUser: () => api.get<any>('/auth/me'),
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
    updateTransactionStatus: (id: string, status: string, remarks?: string) => api.patch<{ success: boolean; transaction: any }>(`/admin/transactions/${id}/status`, { status, remarks }),
};

export const caseService = {
    getCases: () =>
        api.get<{ success: boolean; cases: Case[] }>('/cases'),
    fileCase: (caseData: any) =>
        api.post<{ success: boolean; case: Case }>('/cases', caseData),
    getMetrics: (userId: number | string) =>
        api.get<any>('/metrics', { params: { userId } }),
};

export const staffService = {
    getMyLeads: () => api.get<{ success: boolean; leads: any[] }>('/staff/my-leads'),
    updateLead: (id: string, data: any) =>
        api.post<{ success: boolean; lead: any }>(`/staff/leads/${id}/update`, data),
    getPerformance: () => api.get<{ success: boolean; stats: any }>('/staff/performance'),
};

export const walletService = {
    getHistory: () => api.get<{ success: boolean; transactions: any[] }>('/payments/history'),
    withdraw: (data: { amount: number; bankDetails?: any }) => api.post<{ success: boolean; message: string; balance: number }>('/payments/withdraw', data),
};

export const settingsService = {
    getSettings: () => api.get<{ success: boolean; privacy: any; presets: any[]; status: string }>('/settings'),
    updatePrivacy: (settings: any) => api.put<{ success: boolean; privacy: any }>('/settings/privacy', settings),
    deactivateAccount: () => api.post<{ success: boolean }>('/settings/deactivate'),
    deleteAccount: () => api.post<{ success: boolean }>('/settings/delete'),
    syncPresets: (presets: any[]) => api.post<{ success: boolean; presets: any[] }>('/settings/presets', { presets }),
};
export default api;
