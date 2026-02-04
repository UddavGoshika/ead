export type UserRole = 'client' | 'advocate' | 'admin' | 'ADMIN' | 'VERIFIER' | 'FINANCE' | 'SUPPORT' | 'USER' | 'legal_provider';

export interface User {
    id: number | string;
    unique_id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    isPremium?: boolean;
    plan?: string;
    coins?: number;
    walletBalance?: number;
    status?: string;
    mustChangePassword?: boolean;
    tempPassword?: string;
    image_url?: string;
    demoUsed?: boolean;
    demoExpiry?: string;
    premiumExpiry?: string;
    planType?: string;
    planTier?: string;
    coinsReceived?: number;
    coinsUsed?: number;
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
    _id?: string;
    caseId: string;
    clientId?: string | any;
    advocateId?: any; // Populated User
    title: string;
    description: string;
    category: string;
    status: string;
    location?: string;
    court?: string;
    department?: string;
    subDepartment?: string;
    lastUpdate?: string;
    updatedAt?: string;
    createdAt?: string;
}

export interface Advocate {
    id: number | string;
    userId?: string;
    unique_id: string;
    display_id?: string;
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
    isMasked?: boolean;
    contactInfo?: {
        email: string;
        mobile: string;
        whatsapp?: string;
    };
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
