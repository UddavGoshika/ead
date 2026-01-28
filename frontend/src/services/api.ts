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

export const authService = {
    login: (credentials: any) => api.post<AuthResponse>('/auth/login', credentials),
    register: (data: any) => api.post<AuthResponse>('/auth/register', data),
    registerClient: (data: any) => api.post<AuthResponse>('/client/register', data),
    registerAdvocate: (data: any) => api.post<AuthResponse>('/advocate/register', data),
    sendOtp: (email: string) => api.post<any>('/auth/send-otp', { email }),
    verifyOtp: (email: string, otp: string) => api.post<any>('/auth/verify-otp', { email, otp }),
    forgotPassword: (email: string) => api.post<any>('/auth/forgot-password', { email }),
    resetPassword: (data: any) => api.post<any>('/auth/reset-password', data),
};

export const advocateService = {
    getAdvocates: (search?: string) =>
        api.get<{ success: boolean; advocates: Advocate[] }>('/advocates', { params: { search } }),
    getAdvocateById: (id: number | string) =>
        api.get<{ success: boolean; advocate: Advocate }>(`/advocates/${id}`),
};

export const clientService = {
    getClients: (search?: string) =>
        api.get<{ success: boolean; clients: ClientProfile[] }>('/client', { params: { search } }),
};

export const adminService = {
    onboardStaff: (data: any) => api.post<{ success: boolean; message: string; userId: string; mailSent: boolean }>('/admin/onboard-staff', data),
};

export const caseService = {
    getCases: (userId?: number) =>
        api.get<{ cases: Case[] }>('/cases', { params: { userId } }),
    fileCase: (caseData: any) =>
        api.post<{ message: string; caseId: number }>('/cases', caseData),
    getMetrics: (userId: number) =>
        api.get<any>('/metrics', { params: { userId } }),
};

export default api;
