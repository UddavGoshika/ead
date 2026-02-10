import React, { useState, useEffect } from "react";
import styles from "./MemberVerification.module.css";
import axios from "axios";
import {
    Users, ShieldCheck, FileText,
    ArrowRight, Search, FileSearch, CheckCircle, AlertTriangle,
    Mail, Phone, MapPin, GraduationCap, Briefcase, Calendar,
    ExternalLink, X, Eye, Download, Star
} from "lucide-react";

interface PendingMember {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role: "Advocate" | "Client";
    image: string;
    regDate: string;
    email: string;
    phone: string;
    gender?: string;
    dob?: string;
    location: string;

    // Staff specific
    department?: string;
    vendor?: string;
    level?: string;
    currentProject?: string;
    joinedDate?: string;

    // Advocate specific
    experience?: string;
    education?: {
        degree?: string;
        university?: string;
        college?: string;
        gradYear?: number;
        enrollmentNo?: string;
        certificatePath?: string;
    };
    practice?: {
        court?: string;
        experience?: string;
        specialization?: string;
        barState?: string;
        barAssociation?: string;
        licensePath?: string;
    };
    idProof?: {
        docType?: string;
        docPath?: string;
    };
    idProofType?: string;
    career?: {
        bio?: string;
        languages?: string;
        skills?: string;
    };
    availability?: {
        days?: string[];
        timeSlots?: string[];
        consultationFee?: number;
    };

    // Client specific
    address?: {
        country?: string;
        state?: string;
        city?: string;
        office?: string;
        permanent?: string;
        pincode?: string;
    };
    legalHelp?: {
        category?: string;
        specialization?: string;
        subDepartment?: string;
        mode?: string;
        advocateType?: string;
        languages?: string;
        issueDescription?: string;
    };
    documentType?: string;
    documentPath?: string;

    // Shared
    signaturePath?: string;
    interests?: string[];
    superInterests?: string[];

    documents: { name: string, path: string }[];
    unique_id?: string;
}


import { API_BASE_URL } from "../../../config";

const MOCK_DEMO_MEMBER: PendingMember = {
    id: "demo-1",
    name: "Adv. Rajesh Kumar (Demo)",
    firstName: "Rajesh",
    lastName: "Kumar",
    role: "Advocate",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
    regDate: new Date().toLocaleDateString(),
    location: "New Delhi, Delhi",
    experience: "12+ Years",
    email: "rajesh.demo@example.com",
    phone: "+91 98765 43210",
    gender: "Male",
    dob: "1985-06-15",
    education: {
        degree: "LLB",
        university: "Delhi University",
        college: "Faculty of Law",
        gradYear: 2008,
        enrollmentNo: "D/1234/2008",
        certificatePath: "uploads/docs/llb_cert.pdf"
    },
    practice: {
        court: "Supreme Court of India",
        experience: "12 Years",
        specialization: "Criminal Law, Civil Law",
        barState: "Delhi",
        barAssociation: "Delhi Bar Council",
        licensePath: "uploads/docs/bar_license.jpg"
    },
    idProof: {
        docType: "Aadhar",
        docPath: "uploads/docs/aadhar.jpg"
    },
    idProofType: "Aadhar",
    career: {
        bio: "Experienced advocate specializing in complex civil disputes and criminal defense with a track record of over 500 successful cases.",
        languages: "English, Hindi, Punjabi",
        skills: "Litigation, Negotiation, Legal Research"
    },
    availability: {
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        timeSlots: ["10:00 AM - 01:00 PM", "04:00 PM - 07:00 PM"],
        consultationFee: 1500
    },
    signaturePath: "uploads/docs/sig_rajesh.png",
    interests: ["Corporate Law", "Intellectual Property"],
    superInterests: ["Human Rights", "Environmental Law"],
    documents: [
        { name: "Aadhar Card (ID Proof)", path: "uploads/docs/aadhar.jpg" },
        { name: "LLB Degree Certificate", path: "uploads/docs/llb_cert.pdf" },
        { name: "Bar Council Registration", path: "uploads/docs/bar_license.jpg" },
        { name: "Digitized Signature", path: "uploads/docs/sig_rajesh.png" }
    ]
};


import { formatImageUrl } from "../../../utils/imageHelper";

const getMediaUrl = (path: string | undefined): string => {
    return formatImageUrl(path);
};

const MemberVerification: React.FC = () => {
    const [members, setMembers] = useState<PendingMember[]>([]);
    const [selectedMember, setSelectedMember] = useState<PendingMember | null>(null);
    const [checklist, setChecklist] = useState<Record<string, boolean>>({});
    const [remarks, setRemarks] = useState("");
    const [testEmail, setTestEmail] = useState("");
    const [previewFile, setPreviewFile] = useState<{ name: string, path: string } | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [actionType, setActionType] = useState<"Rejected" | "Reverify">("Rejected");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [filterRole, setFilterRole] = useState<"All" | "Advocate" | "Client" | "Legal Provider" | "Staff">("All");
    const [contextFilter, setContextFilter] = useState<"pending" | "reverify">("pending");

    useEffect(() => {
        fetchMembers("pending");
    }, []);

    const fetchPendingMembers = () => fetchMembers("pending");

    const fetchMembers = async (context: "pending" | "reverify" = "pending") => {
        try {
            setLoading(true);
            setContextFilter(context);
            const res = await axios.get(`${API_BASE_URL}/api/admin/members?context=${context}`);
            if (res.data.success) {
                let memberList = res.data.members;
                if (memberList.length === 0 && context === "pending") {
                    memberList = [MOCK_DEMO_MEMBER];
                }
                setMembers(memberList);
                if (memberList.length > 0) {
                    if (memberList[0].id === 'demo-1') {
                        setSelectedMember(MOCK_DEMO_MEMBER);
                    } else {
                        fetchMemberDetail(memberList[0].id);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch pending members", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMemberDetail = async (id: string) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/members/${id}`);
            if (res.data.success) {
                const apiData = res.data.member;
                const fullMember = {
                    ...(apiData.user || {}),
                    ...(apiData.profile || {}),
                    documents: apiData.documents || [],
                    id: apiData.user?._id || id,
                    unique_id: apiData.unique_id || apiData.user?.unique_id || apiData.user?.code || apiData.profile?.unique_id || apiData.code || "TP-EAD-PENDING",
                    name: apiData.user?.name || apiData.name || apiData.profile?.name || `${apiData.profile?.firstName || apiData.firstName || apiData.user?.firstName || ''} ${apiData.profile?.lastName || apiData.lastName || apiData.user?.lastName || ''}`.trim() || "Anonymous Member",
                    regDate: apiData.user?.createdAt || new Date().toISOString(),
                    role: apiData.user?.role || "Advocate",
                    image: apiData.profile?.profilePicPath || apiData.user?.avatar
                } as PendingMember;
                setSelectedMember(fullMember);
            }
        } catch (error) {
            console.error("Failed to fetch member details", error);
        }
    };

    const isChecklistComplete = () => {
        if (!selectedMember) return false;
        const required = (selectedMember.role?.toLowerCase() === "advocate" || selectedMember.role?.toLowerCase() === "legal_provider" || selectedMember.role?.toLowerCase() === "legal provider")
            ? ["id", "address", "degree", "license", "photo"]
            : ["id", "address", "photo"];
        return required.every(key => checklist[key]);
    };

    const handleToggleCheck = (key: string) => {
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAction = async (status: "Approved" | "Rejected" | "Reverify") => {
        if (!selectedMember) return;

        if (status === "Approved" && !isChecklistComplete()) {
            alert("Please complete the verification checklist before approving.");
            return;
        }
        if ((status === "Rejected" || status === "Reverify") && !remarks.trim()) {
            alert(`Please provide a reason for ${status === 'Reverify' ? 're-verification' : 'rejection'}.`);
            return;
        }

        try {
            setActionLoading(true);

            if (selectedMember.id === 'demo-1') {
                const targetEmail = testEmail.trim() || selectedMember.email;
                if (status === "Approved") {
                    await axios.post(`${API_BASE_URL}/api/admin/test-approve-email`, {
                        email: targetEmail
                    });
                    alert(`SUCCESS: Welcome email (with unique ID) sent to ${targetEmail}`);
                } else {
                    // Handle both Reject and Reverify 
                    await axios.post(`${API_BASE_URL}/api/admin/test-reject-email`, {
                        email: targetEmail,
                        remarks: remarks,
                        type: status
                    });
                    alert(`SUCCESS: ${status} email sent to ${targetEmail}`);
                }
                setIsRejecting(false);
                setRemarks("");
                setTestEmail("");
                return;
            }

            if (status === "Approved") {
                await axios.patch(`${API_BASE_URL}/api/admin/members/${selectedMember.id}/verify`, {
                    verified: true
                });
            } else {
                // Determine if it's strict rejection or re-verification
                // If Reverify, we might use a specific status if backend supports it, e.g. "Resubmitted" or just reject with note
                const apiAction = status === "Reverify" ? "reverify-request" : "reject-inform";
                // Fallback to reject-inform if endpoint doesn't exist, but passing meta in remarks
                const finalRemarks = status === "Reverify" ? `[ACTION REQUIRED: RE-VERIFICATION] ${remarks}` : remarks;

                await axios.patch(`${API_BASE_URL}/api/admin/members/${selectedMember.id}/reject-inform`, {
                    remarks: finalRemarks,
                    isReverify: status === "Reverify"
                });
            }

            alert(`Member ${selectedMember.name} has been processed: ${status}.`);
            setIsRejecting(false);
            setRemarks("");
            setChecklist({});
            setSelectedMember(null);
            fetchPendingMembers();
        } catch (error: any) {
            console.error("Action failed", error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to process action.";
            alert(`Error: ${errorMessage}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownloadAll = () => {
        if (!selectedMember || !selectedMember.documents) return;
        selectedMember.documents.forEach((doc, index) => {
            if (doc.path) {
                setTimeout(() => {
                    const link = document.createElement('a');
                    link.href = getMediaUrl(doc.path);
                    link.download = doc.name || `document_${index}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, index * 250);
            }
        });
    };

    const renderDataField = (label: string, value: any, icon?: React.ReactNode) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;

        let displayValue = value;
        if (Array.isArray(value)) {
            displayValue = value.join(", ");
        } else if (typeof value === 'object' && value !== null) {
            // Handle objects like location {city, state, country} or other nested data
            try {
                displayValue = Object.values(value)
                    .filter(v => v !== undefined && v !== null && (typeof v === 'string' || typeof v === 'number'))
                    .join(", ");
                if (!displayValue) return null;
            } catch (e) {
                console.warn("Failed to stringify object field", label, value);
                return null;
            }
        }

        return (
            <div className={styles.dataField}>
                <div className={styles.fieldLabel}>
                    {icon && <span className={styles.fieldIcon}>{icon}</span>}
                    {label}
                </div>
                <div className={styles.fieldValue}>
                    {displayValue}
                </div>
            </div>
        );
    };

    if (loading && members.length === 0) {
        return <div className={styles.emptyState}><p>Loading pending queue...</p></div>;
    }

    return (
        <div className={styles.container}>
            {/* Queue Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>
                        <Users size={20} />
                        Unapproved Queue
                        <span className={styles.pendingCount}>{members.length}</span>
                    </h2>
                </div>
                <div className={styles.filterBar}>
                    {(["All", "Advocate", "Client", "Legal Provider", "Staff"] as const).map((role) => (
                        <button
                            key={role}
                            className={`${styles.filterTab} ${filterRole === role ? styles.activeTab : ''}`}
                            onClick={() => setFilterRole(role)}
                        >
                            {role === "Legal Provider" ? "Legal Advisors" : role === "All" ? "All Queue" : role === "Staff" ? "Employees" : `${role}s`}
                        </button>
                    ))}
                </div>
                <div className={styles.filterBar} style={{ marginTop: '10px' }}>
                    <button
                        className={`${styles.filterTab} ${contextFilter === "pending" ? styles.activeTab : ''}`}
                        onClick={() => fetchMembers("pending")}
                        style={{ flex: 1 }}
                    >
                        Pending Verification
                    </button>
                    <button
                        className={`${styles.filterTab} ${contextFilter === "reverify" ? styles.activeTab : ''}`}
                        onClick={() => fetchMembers("reverify")}
                        style={{ flex: 1 }}
                    >
                        Reverify Profiles
                    </button>
                </div>
                <div className={styles.memberList}>
                    {members
                        .filter(m => {
                            if (filterRole === "All") return true;
                            const dbRole = (m.role || "").toLowerCase();
                            if (filterRole === "Legal Provider") {
                                return dbRole === "legal_provider" || dbRole === "legal provider";
                            }
                            if (filterRole === "Staff") {
                                return !["advocate", "client", "legal_provider", "legal provider"].includes(dbRole);
                            }
                            return dbRole === filterRole.toLowerCase();
                        })
                        .map(m => (
                            <div
                                key={m.id}
                                className={`${styles.memberItem} ${selectedMember?.id === m.id ? styles.active : ''}`}
                                onClick={() => {
                                    if (m.id === 'demo-1') setSelectedMember(MOCK_DEMO_MEMBER);
                                    else fetchMemberDetail(m.id);
                                    setChecklist({});
                                    setRemarks("");
                                    setIsRejecting(false);
                                }}
                            >
                                <img
                                    src={getMediaUrl(m.image)}
                                    className={styles.avatar}
                                    alt={m.name}
                                    onError={(e) => {
                                        e.currentTarget.src = "/avatar_placeholder.png"; // Fallback
                                        e.currentTarget.onerror = null;
                                    }}
                                />
                                <div className={styles.mInfo}>
                                    <span className={styles.mName}>{m.name}</span>
                                    <span className={styles.mMeta}>{m.role} • {new Date(m.regDate || Date.now()).toLocaleDateString()}</span>
                                </div>
                                <ArrowRight size={16} />
                            </div>
                        ))}
                    {members.length === 0 && <p className={styles.mMeta} style={{ padding: '20px' }}>No unapproved members</p>}
                </div>
            </div>

            {/* Verification Workspace */}
            <div className={styles.workspace}>
                {selectedMember ? (
                    <div className={styles.reviewContent}>
                        <div className={styles.reviewHeader}>
                            <div className={styles.profileSummary}>
                                <img
                                    src={getMediaUrl(selectedMember.image)}
                                    className={styles.largeAvatar}
                                    alt={selectedMember.name}
                                    onError={(e) => {
                                        e.currentTarget.src = "/avatar_placeholder.png"; // Fallback
                                        e.currentTarget.onerror = null;
                                    }}
                                />
                                <div className={styles.profileTitle}>
                                    <h1>{selectedMember.name}</h1>
                                    <div className={styles.badgeRow}>
                                        <span className={styles.roleBadge}>{selectedMember.role}</span>
                                        <span className={styles.idBadge}>ID: {selectedMember.unique_id || selectedMember.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.scrollableDetails}>
                            {/* 1. Basic & Contact Info */}
                            <div className={styles.contentSection}>
                                <h3 className={styles.sectionTitle}><Search size={18} /> Basic & Contact Registration Info</h3>
                                <div className={styles.dataGrid}>
                                    {renderDataField("Full Name", `${selectedMember.firstName || ''} ${selectedMember.lastName || ''}`.trim() || selectedMember.name, <Users size={14} />)}
                                    {renderDataField("Email Address", selectedMember.email, <Mail size={14} />)}
                                    {renderDataField("Phone Number", selectedMember.phone, <Phone size={14} />)}
                                    {renderDataField("Gender", selectedMember.gender)}
                                    {renderDataField("Date of Birth", selectedMember.dob ? new Date(selectedMember.dob).toLocaleDateString() : null, <Calendar size={14} />)}
                                    {renderDataField("Location", selectedMember.location, <MapPin size={14} />)}
                                </div>
                            </div>

                            {/* 2. Advocate Specific: Education & Practice */}
                            {(selectedMember.role?.toLowerCase() === "advocate" || selectedMember.role?.toLowerCase() === "legal_provider" || selectedMember.role?.toLowerCase() === "legal provider") && (
                                <>
                                    <div className={styles.contentSection}>
                                        <h3 className={styles.sectionTitle}><GraduationCap size={18} /> Education & Certification</h3>
                                        <div className={styles.dataGrid}>
                                            {renderDataField("Degree", selectedMember.education?.degree)}
                                            {renderDataField("University", selectedMember.education?.university)}
                                            {renderDataField("College", selectedMember.education?.college)}
                                            {renderDataField("Grad Year", selectedMember.education?.gradYear)}
                                            {renderDataField("Enrollment No", selectedMember.education?.enrollmentNo)}
                                            {renderDataField("ID Proof Type", selectedMember.idProofType)}
                                        </div>
                                    </div>
                                    <div className={styles.contentSection}>
                                        <h3 className={styles.sectionTitle}><Briefcase size={18} /> Professional Practice</h3>
                                        <div className={styles.dataGrid}>
                                            {renderDataField("Court of Practice", selectedMember.practice?.court)}
                                            {renderDataField("Specialization", selectedMember.practice?.specialization)}
                                            {renderDataField("Experience", selectedMember.practice?.experience)}
                                            {renderDataField("Bar State", selectedMember.practice?.barState)}
                                            {renderDataField("Bar Association", selectedMember.practice?.barAssociation)}
                                        </div>
                                    </div>
                                    <div className={styles.contentSection}>
                                        <h3 className={styles.sectionTitle}><FileText size={18} /> Career & Bio</h3>
                                        {selectedMember.career?.bio && (
                                            <div className={styles.fullWidthField}>
                                                <span className={styles.fieldLabel}>Biography</span>
                                                <p className={styles.fieldPara}>{selectedMember.career.bio}</p>
                                            </div>
                                        )}
                                        <div className={styles.dataGrid}>
                                            {renderDataField("Languages", selectedMember.career?.languages)}
                                            {renderDataField("Skills", selectedMember.career?.skills)}
                                        </div>
                                    </div>
                                    <div className={styles.contentSection}>
                                        <h3 className={styles.sectionTitle}><Calendar size={18} /> Availability & Fees</h3>
                                        <div className={styles.dataGrid}>
                                            {renderDataField("Days", selectedMember.availability?.days)}
                                            {renderDataField("Time Slots", selectedMember.availability?.timeSlots)}
                                            {renderDataField("Consultation Fee", selectedMember.availability?.consultationFee ? `₹${selectedMember.availability.consultationFee}` : null)}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* 3. Client Specific: Legal Requirements & Address */}
                            {selectedMember.role?.toLowerCase() === "client" && (
                                <>
                                    <div className={styles.contentSection}>
                                        <h3 className={styles.sectionTitle}><FileText size={18} /> Legal Help Requirements</h3>
                                        <div className={styles.dataGrid}>
                                            {renderDataField("Category", selectedMember.legalHelp?.category)}
                                            {renderDataField("Specialization", selectedMember.legalHelp?.specialization)}
                                            {renderDataField("Sub Department", selectedMember.legalHelp?.subDepartment)}
                                            {renderDataField("Mode", selectedMember.legalHelp?.mode)}
                                            {renderDataField("Advocate Type", selectedMember.legalHelp?.advocateType)}
                                            {renderDataField("Languages", selectedMember.legalHelp?.languages)}
                                        </div>
                                        {selectedMember.legalHelp?.issueDescription && (
                                            <div className={styles.fullWidthField}>
                                                <span className={styles.fieldLabel}>Issue Description</span>
                                                <p className={styles.fieldPara}>{selectedMember.legalHelp.issueDescription}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.contentSection}>
                                        <h3 className={styles.sectionTitle}><MapPin size={18} /> Detailed Address</h3>
                                        <div className={styles.dataGrid}>
                                            {renderDataField("Country", selectedMember.address?.country)}
                                            {renderDataField("State", selectedMember.address?.state)}
                                            {renderDataField("City", selectedMember.address?.city)}
                                            {renderDataField("Pincode", selectedMember.address?.pincode)}
                                        </div>
                                        <div className={styles.fullWidthField}>
                                            {renderDataField("Permanent Address", selectedMember.address?.permanent)}
                                            {renderDataField("Office Address", selectedMember.address?.office)}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Staff Specific */}
                            {!["advocate", "client", "legal_provider", "legal provider"].includes(selectedMember.role?.toLowerCase() || "") && (
                                <div className={styles.contentSection}>
                                    <h3 className={styles.sectionTitle}><Briefcase size={18} /> Staff / Employee Information</h3>
                                    <div className={styles.dataGrid}>
                                        {renderDataField("Department", selectedMember.department)}
                                        {renderDataField("Vendor/Team", selectedMember.vendor)}
                                        {renderDataField("Level/Rank", selectedMember.level)}
                                        {renderDataField("Current Project", selectedMember.currentProject)}
                                        {renderDataField("Joined Date", selectedMember.joinedDate ? new Date(selectedMember.joinedDate).toLocaleDateString() : null)}
                                    </div>
                                </div>
                            )}

                            {/* 4. Interests & Preferences */}
                            <div className={styles.contentSection}>
                                <h3 className={styles.sectionTitle}><Star size={18} /> Interests & Preferences</h3>
                                <div className={styles.dataGrid}>
                                    {renderDataField("General Interests", selectedMember.interests)}
                                    {renderDataField("Super Interests", selectedMember.superInterests)}
                                </div>
                            </div>

                            {/* 5. Documents Verification */}
                            <div className={styles.contentSection}>
                                <div className={styles.sectionHeader}>
                                    <h3 className={styles.sectionTitle}><FileSearch size={18} /> Document Evidence</h3>
                                    {selectedMember.documents && selectedMember.documents.length > 0 && (
                                        <button className={styles.downloadAllBtn} onClick={handleDownloadAll}>
                                            <Download size={14} /> Download All (Images)
                                        </button>
                                    )}
                                </div>
                                <div className={styles.fileGrid}>
                                    {selectedMember.documents?.map((doc, idx) => {
                                        const lowerPath = (doc.path || "").toLowerCase();
                                        const isPdf = /\.pdf($|\?|#)/i.test(doc.path) || lowerPath.includes('/raw/');
                                        const isDoc = /\.(doc|docx)($|\?|#)/i.test(doc.path);

                                        const isImage = !isPdf && !isDoc && (
                                            /\.(jpg|jpeg|png|webp|gif|bmp|svg)($|\?|#)/i.test(doc.path) ||
                                            lowerPath.endsWith('-blob') ||
                                            lowerPath.includes('signature') ||
                                            lowerPath.includes('photo') ||
                                            doc.path?.startsWith('data:')
                                        );

                                        return (
                                            <div key={idx} className={styles.docCard}>
                                                <div className={styles.docIcon}>
                                                    {isImage ? (
                                                        <img
                                                            src={getMediaUrl(doc.path)}
                                                            alt=""
                                                            className={styles.docThumbnail}
                                                            onClick={() => setPreviewFile(doc)}
                                                            style={{ cursor: 'pointer' }}
                                                            onError={(e) => {
                                                                e.currentTarget.src = "/file_placeholder.png"; // Use generic icon on error
                                                                e.currentTarget.style.display = 'none'; // Or hide and show icon parent
                                                                // Better: replace parent innerHTML logic in complex app, but here fallback src is okay if we had one.
                                                                // Since we don't have a guaranteed placeholder image, let's rely on strict type checking above.
                                                            }}
                                                        />
                                                    ) : (
                                                        <FileText size={20} />
                                                    )}
                                                </div>
                                                <div className={styles.docInfo}>
                                                    <span className={styles.docName}>{doc.name}</span>
                                                    <div className={styles.docActions}>
                                                        <button
                                                            className={styles.docBtn}
                                                            onClick={() => setPreviewFile(doc)}
                                                        >
                                                            <Eye size={14} /> View
                                                        </button>
                                                        <a
                                                            href={getMediaUrl(doc.path)}
                                                            download
                                                            className={styles.docBtn}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <Download size={14} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!selectedMember.documents || selectedMember.documents.length === 0) && (
                                        <p className={styles.mMeta}>No documents uploaded</p>
                                    )}
                                </div>
                            </div>

                            {/* Verification Form */}
                            <div className={styles.checklistContainer}>
                                <h3 className={styles.sectionTitle}>
                                    <ShieldCheck size={18} /> Official Verification Form
                                </h3>
                                <div className={styles.checklistGrid}>
                                    <label className={styles.checkItem}>
                                        <input
                                            type="checkbox"
                                            checked={!!checklist.id}
                                            onChange={() => handleToggleCheck("id")}
                                        />
                                        <span>Does ID Proof name match registration?</span>
                                    </label>
                                    <label className={styles.checkItem}>
                                        <input
                                            type="checkbox"
                                            checked={!!checklist.address}
                                            onChange={() => handleToggleCheck("address")}
                                        />
                                        <span>Is the address verified?</span>
                                    </label>
                                    {(selectedMember.role?.toLowerCase() === "advocate" || selectedMember.role?.toLowerCase() === "legal_provider" || selectedMember.role?.toLowerCase() === "legal provider") && (
                                        <>
                                            <label className={styles.checkItem}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!checklist.degree}
                                                    onChange={() => handleToggleCheck("degree")}
                                                />
                                                <span>Degree authenticity confirmed?</span>
                                            </label>
                                            <label className={styles.checkItem}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!checklist.license}
                                                    onChange={() => handleToggleCheck("license")}
                                                />
                                                <span>Bar Council registration active?</span>
                                            </label>
                                        </>
                                    )}
                                    <label className={styles.checkItem}>
                                        <input
                                            type="checkbox"
                                            checked={!!checklist.photo}
                                            onChange={() => handleToggleCheck("photo")}
                                        />
                                        <span>Profile picture matches ID?</span>
                                    </label>
                                </div>

                                {isRejecting ? (
                                    <div className={styles.rejectionBox}>
                                        {selectedMember.id === 'demo-1' && (
                                            <div style={{ marginBottom: '15px' }}>
                                                <label className={styles.fieldLabel}>Testing: Send rejection email to:</label>
                                                <input
                                                    type="email"
                                                    className={styles.remarksArea}
                                                    style={{ minHeight: '40px', marginBottom: '10px' }}
                                                    placeholder="Enter your email address to test..."
                                                    value={testEmail}
                                                    onChange={(e) => setTestEmail(e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <textarea
                                            className={styles.remarksArea}
                                            placeholder={actionType === "Reverify" ? "Specify what needs to be corrected..." : "Specify reason for rejection..."}
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            autoFocus
                                        />
                                        <div className={styles.rejectionActions}>
                                            <button className={styles.cancelBtn} onClick={() => setIsRejecting(false)}>Cancel</button>
                                            <button
                                                className={actionType === "Reverify" ? styles.reverifyBtn : styles.confirmRejectBtn}
                                                onClick={() => handleAction(actionType)}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? "Processing..." : (actionType === "Reverify" ? "Request Re-verification" : "Confirm Rejection")}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.actionBar}>
                                        {selectedMember.id === 'demo-1' && (
                                            <div className={styles.demoTestInput}>
                                                <label className={styles.fieldLabel}>Demo Email Testing:</label>
                                                <input
                                                    type="email"
                                                    className={styles.remarksArea}
                                                    style={{ minHeight: '40px', marginBottom: '10px' }}
                                                    placeholder="Enter your email to receive demo notifications..."
                                                    value={testEmail}
                                                    onChange={(e) => setTestEmail(e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <div className={styles.actionButtons}>
                                            <button className={styles.rejectBtn} onClick={() => { setActionType("Rejected"); setIsRejecting(true); }}>
                                                <AlertTriangle size={18} /> Reject
                                            </button>
                                            <button className={styles.reverifyBtn} onClick={() => { setActionType("Reverify"); setIsRejecting(true); }}>
                                                <ShieldCheck size={18} /> Reverify
                                            </button>
                                            <button
                                                className={styles.approveBtn}
                                                disabled={!isChecklistComplete() || actionLoading}
                                                onClick={() => handleAction("Approved")}
                                            >
                                                <CheckCircle size={18} /> {actionLoading ? "Processing..." : "Approve & Verify"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <FileText size={64} />
                        <p>{loading ? "Loading..." : "Select a member from the queue to start verification"}</p>
                    </div>
                )}
            </div>

            {/* Media Preview Modal */}
            {/* Media Preview Modal - 100% Robust Solution */}
            {previewFile && (
                <div className={styles.modalOverlay} onClick={() => setPreviewFile(null)}>
                    <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.previewHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                <h3 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                    {previewFile.name}
                                </h3>
                                <a
                                    href={getMediaUrl(previewFile.path)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.downloadAllBtn}
                                    style={{ padding: '6px 16px', fontSize: '0.8rem', textDecoration: 'none', background: '#3b82f6', color: 'white', border: 'none' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink size={16} /> Open / Download Original
                                </a>
                            </div>
                            <button className={styles.closeModal} onClick={() => setPreviewFile(null)}><X size={24} /></button>
                        </div>
                        <div className={styles.previewBody} style={{ background: '#1e293b', position: 'relative' }}>
                            {/* LOADER / FALLBACK TEXT BEHIND IFRAME */}
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, color: '#94a3b8', textAlign: 'center' }}>
                                <p>Loading Preview...</p>
                                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>If it doesn't load, use the "Open / Download" button above.</span>
                            </div>

                            {/* LOGIC FOR DIFFERENT FILE TYPES */}
                            {(() => {
                                const url = getMediaUrl(previewFile.path);
                                const lowerPath = (previewFile.path || "").toLowerCase();
                                const isPdf = /\.pdf($|\?|#)/i.test(lowerPath) || lowerPath.includes('/raw/');
                                const isOffice = /\.(doc|docx|ppt|pptx|xls|xlsx)($|\?|#)/i.test(lowerPath);
                                const isTxt = /\.txt($|\?|#)/i.test(lowerPath);

                                if (isPdf) {
                                    /* Google Docs Viewer is the most robust web-based PDF viewer (no plugin needed) */
                                    return (
                                        <iframe
                                            src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                                            className={styles.pdfViewer}
                                            title="PDF Preview"
                                            style={{ width: '100%', height: '100%', border: 'none', position: 'relative', zIndex: 1, background: '#fff' }}
                                        />
                                    );
                                } else if (isOffice) {
                                    /* Microsoft Office Online Viewer is best for Word/Excel/PPT */
                                    return (
                                        <iframe
                                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                                            className={styles.pdfViewer}
                                            title="Office Doc Preview"
                                            style={{ width: '100%', height: '100%', border: 'none', position: 'relative', zIndex: 1, background: '#fff' }}
                                        />
                                    );
                                } else if (isTxt) {
                                    return (
                                        <iframe
                                            src={url}
                                            className={styles.pdfViewer}
                                            style={{ width: '100%', height: '100%', border: 'none', background: '#fff', padding: '20px', color: '#000' }}
                                        />
                                    );
                                } else {
                                    /* Default to Image */
                                    return (
                                        <img
                                            src={url}
                                            alt="Preview"
                                            className={styles.previewImg}
                                            style={{ position: 'relative', zIndex: 1, maxWidth: '100%', maxHeight: '100%' }}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                alert("Could not load image preview. Please download the file.");
                                            }}
                                        />
                                    );
                                }
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberVerification;
