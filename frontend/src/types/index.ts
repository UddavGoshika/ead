export type UserRole = 'client' | 'advocate' | 'admin' | 'ADMIN' | 'VERIFIER' | 'FINANCE' | 'SUPPORT' | 'USER';

export interface User {
    id: number | string;
    unique_id: string;
    name: string;
    email: string;
    role: UserRole;
    isPremium?: boolean;
    plan?: string;
    coins?: number;
    status?: string;
    mustChangePassword?: boolean;
    tempPassword?: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    error?: string;
    user?: User;
    token?: string;
    userId?: number | string;
    uniqueId?: string;
    advocateId?: string;
}

export interface Case {
    id: number;
    user_id: number;
    title: string;
    type: string;
    status: 'Pending' | 'Active' | 'Resolved' | 'Closed' | 'Open';
    filing_date: string;
    next_hearing: string;
    case_number: string;
}

export interface Advocate {
    id: number | string;
    unique_id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    location: string;
    experience: string;
    specialties: string[];
    rating: number;
    image_url: string;
    cases_handled: number;
    age?: number;
    isFeatured?: boolean;
    bio?: string;
    education?: {
        degree: string;
        university: string;
        college: string;
        gradYear: string;
    };
    practice?: {
        court: string;
        experience: string;
        specialization: string;
    };
    availability?: {
        days: string[];
        timeSlots: string[];
        consultationFee: number;
    };
    religion?: string;
    motherTongue?: string;
    maritalStatus?: string;
    bar_council_id?: string;
}
export type MemberStatus = "Active" | "Deactivated" | "Blocked" | "Pending" | "Deleted";

export interface Member {
    id: string;
    code: string;
    role: "Advocate" | "Client";
    name: string;
    email: string;
    phone: string;
    location: string;
    gender: string;
    verified: boolean;
    reported: number;
    view: number;
    plan: string;
    coins: number;
    since: string;
    createdAt?: string;
    status: MemberStatus;
    image: string;
}
