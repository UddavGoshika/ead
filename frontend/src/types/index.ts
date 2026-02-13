export type UserRole = 'client' | 'advocate' | 'admin' | 'ADMIN' | 'VERIFIER' | 'FINANCE' | 'SUPPORT' | 'USER' | 'legal_provider';

export interface User {
    id: number | string;
    _id?: string;
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
    rejectionReason?: string;
    relationship_state?: string;
    subscription_state?: 'FREE' | 'PREMIUM';
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
    clientId?: string;
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
    userId?: any;
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
    profileImage?: string;
    profilePicPath?: string;
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
    isBlur?: boolean;
    contactInfo?: {
        email: string;
        mobile: string;
        whatsapp?: string;
    };
    allowChat?: boolean;
    allowCall?: boolean;
    allowVideo?: boolean;
    allowMeet?: boolean;
    shares?: number;
    relationship_state?: string;
    // Additional properties for detailed profile
    specialization?: string;
    subSpecialization?: string;
    phone?: string;
    email?: string;
    licenseId?: string;
    city?: string;
    state?: string;
}

export interface Client {
    id: number | string;
    userId?: any;
    unique_id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    location?: any;
    image_url?: string;
    profilePicPath?: string;
    legalHelp?: any;
    contactInfo?: {
        email: string;
        mobile: string;
        whatsapp?: string;
    };
    display_id?: string;
    isBlur?: boolean;
    isMasked?: boolean;
    allowChat?: boolean;
    allowCall?: boolean;
    allowVideo?: boolean;
    allowMeet?: boolean;
    shares?: number;
    relationship_state?: string;
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
