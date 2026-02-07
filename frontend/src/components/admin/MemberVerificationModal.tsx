import React from 'react';
import { X, CheckCircle, AlertTriangle, FileText, Download, User, Briefcase, GraduationCap, MapPin, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import styles from './MemberVerificationModal.module.css';

interface Member {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    role: string;
    verified: boolean;
    gender?: string;
    dob?: string;
    education?: any;
    practice?: any;
    location?: any;
    legalHelp?: any;
    idProof?: any;
    idProofType?: string;
    career?: any;
    availability?: any;
    interests?: string[];
    superInterests?: string[];
    documentType?: string;
    documentPath?: string;
    licensePath?: string;
    certificatePath?: string;
    signaturePath?: string;
    address?: any;

    // New fields
    barCouncil?: string;
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
}

interface Props {
    member: Member | null;
    onClose: () => void;
    onVerify: (id: string, status: boolean, remarks?: string) => void;
    isActionLoading?: boolean;
}

const MemberVerificationModal: React.FC<Props> = ({ member, onClose, onVerify, isActionLoading = false }) => {
    const [remarks, setRemarks] = React.useState("");
    const [showRemarks, setShowRemarks] = React.useState(false);
    const [actionType, setActionType] = React.useState<'reject' | 'reverify' | null>(null);
    const [checklist, setChecklist] = React.useState({
        identityProof: false,
        addressProof: false,
        professionalDegree: false,
        practiceLicense: false,
        photoMatch: false
    });

    const isChecklistComplete = () => {
        if (isAdvocate) {
            return checklist.identityProof && checklist.addressProof &&
                checklist.professionalDegree && checklist.practiceLicense &&
                checklist.photoMatch;
        }
        return checklist.identityProof && checklist.addressProof && checklist.photoMatch;
    };

    if (!member) return null;

    const isAdvocate = member.role?.toLowerCase() === 'advocate';
    const profile = member;

    const renderDataField = (label: string, value: any, icon?: React.ReactNode) => {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return null;

        let displayValue = value;
        if (Array.isArray(value)) {
            displayValue = value.join(", ");
        } else if (typeof value === 'object' && value !== null) {
            // Handle plain objects (like location or address)
            try {
                displayValue = Object.values(value)
                    .filter(v => v !== undefined && v !== null && (typeof v === 'string' || typeof v === 'number'))
                    .join(", ");
                if (!displayValue) return null;
            } catch (e) {
                return null;
            }
        }

        return (
            <div className={styles.dataField}>
                <div className={styles.fieldLabel}>
                    {icon}
                    <span>{label}</span>
                </div>
                <div className={styles.fieldValue}>{displayValue}</div>
            </div>
        );
    };

    const handleDownloadAll = () => {
        if (!member) return;
        const docs = isAdvocate ? [
            { name: 'ID_Proof', path: member.idProof?.docPath },
            { name: 'Education', path: member.education?.certificatePath },
            { name: 'License', path: member.practice?.licensePath },
            { name: 'Signature', path: member.signaturePath }
        ] : [
            { name: 'Verification_Doc', path: member.documentPath },
            { name: 'Signature', path: member.signaturePath }
        ];

        docs.forEach((doc, index) => {
            if (doc.path) {
                setTimeout(() => {
                    let cleanPath = doc.path.replace(/\\/g, '/');
                    const uploadIndex = cleanPath.toLowerCase().indexOf('uploads/');
                    if (uploadIndex !== -1) {
                        cleanPath = cleanPath.substring(uploadIndex);
                    } else {
                        cleanPath = cleanPath.replace(/^\/+/, '');
                        if (!cleanPath.includes('/') && cleanPath.length > 0) cleanPath = `uploads/${cleanPath}`;
                    }
                    const fullPath = (cleanPath.startsWith('http') || cleanPath.startsWith('blob:') || cleanPath.startsWith('/')) ? cleanPath : `/${cleanPath}`;

                    const link = document.createElement('a');
                    link.href = fullPath;
                    link.download = doc.name || `document_${index}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, index * 200);
            }
        });
    };

    const renderFileItem = (title: string, path: string | undefined) => {
        if (!path) return null;

        let cleanPath = path.replace(/\\/g, '/');

        // Handle absolute paths by finding 'uploads/'
        const uploadIndex = cleanPath.toLowerCase().indexOf('uploads/');
        if (uploadIndex !== -1) {
            cleanPath = cleanPath.substring(uploadIndex);
        } else {
            cleanPath = cleanPath.replace(/^\/+/, '');
            if (!cleanPath.includes('/') && cleanPath.length > 0) cleanPath = `uploads/${cleanPath}`;
        }

        const fullPath = (cleanPath.startsWith('http') || cleanPath.startsWith('blob:') || cleanPath.startsWith('/')) ? cleanPath : `/${cleanPath}`;

        const fileName = cleanPath.split('/').pop() || 'document.pdf';
        const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(fileName);
        return (
            <div className={styles.docItem}>
                <div className={styles.docIcon}>
                    {isImage ? (
                        <img src={fullPath} alt="" className={styles.docThumbnail} />
                    ) : (
                        <FileText size={20} />
                    )}
                </div>
                <div className={styles.docInfo}>
                    <h4>{title}</h4>
                    <p>{fileName}</p>
                </div>
                <div className={styles.docActions}>
                    <a
                        href={fullPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.viewFileBtn}
                        title="View File"
                    >
                        View
                    </a>
                    <a
                        href={fullPath}
                        download={fileName}
                        className={styles.downloadFileBtn}
                        title="Download File"
                    >
                        <Download size={14} />
                    </a>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <ShieldCheck size={20} color="#3b82f6" />
                        <h2>Complete Verification Review: {member.name}</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <div className={styles.scrollBody}>
                    <div className={styles.alertBanner}>
                        <ShieldCheck size={16} />
                        <span>Carefully review all uploaded credentials and professional history before certifying this member.</span>
                    </div>

                    {/* 1. BASIC INFORMATION */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}><User size={16} /> Basic & Contact Information</h3>
                        <div className={styles.dataGrid}>
                            {renderDataField("Full Name", profile.name, <User size={14} />)}
                            {renderDataField("First Name", profile.firstName)}
                            {renderDataField("Last Name", profile.lastName)}
                            {renderDataField("Email Address", profile.email, <Mail size={14} />)}
                            {renderDataField("Mobile Number", profile.phone || profile.mobile, <Phone size={14} />)}
                            {renderDataField("Gender", profile.gender)}
                            {renderDataField("Date of Birth", profile.dob ? new Date(profile.dob).toLocaleDateString() : null, <Calendar size={14} />)}
                        </div>
                    </div>

                    {/* 2. ROLE SPECIFIC DETAILS (EDUCATION/PRACTICE OR LEGAL HELP) */}
                    {isAdvocate ? (
                        <>
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}><GraduationCap size={16} /> Education & Certification</h3>
                                <div className={styles.dataGrid}>
                                    {renderDataField("Degree", profile.education?.degree)}
                                    {renderDataField("University", profile.education?.university)}
                                    {renderDataField("College", profile.education?.college)}
                                    {renderDataField("Grad Year", profile.education?.gradYear)}
                                    {renderDataField("Enrollment No", profile.education?.enrollmentNo)}
                                    {renderDataField("ID Proof Type", profile.idProofType)}
                                </div>
                            </div>
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}><Briefcase size={16} /> Professional Practice</h3>
                                <div className={styles.dataGrid}>
                                    {renderDataField("Court of Practice", profile.practice?.court)}
                                    {renderDataField("Specialization", profile.practice?.specialization)}
                                    {renderDataField("Years of Experience", profile.practice?.experience)}
                                    {renderDataField("Bar Association", profile.practice?.barAssociation)}
                                    {renderDataField("Bar State", profile.practice?.barState)}
                                    {renderDataField("Bar Council Number", profile.barCouncil)}
                                </div>
                            </div>
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}><Briefcase size={16} /> Career & Bio</h3>
                                <div className={styles.dataGrid}>
                                    {renderDataField("Biography", profile.career?.bio)}
                                    {renderDataField("Languages Known", profile.career?.languages)}
                                    {renderDataField("Key Skills", profile.career?.skills)}
                                </div>
                            </div>
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}><Calendar size={16} /> Availability & Fees</h3>
                                <div className={styles.dataGrid}>
                                    {renderDataField("Available Days", profile.availability?.days)}
                                    {renderDataField("Time Slots", profile.availability?.timeSlots)}
                                    {renderDataField("Consultation Fee", profile.availability?.consultationFee ? `₹${profile.availability.consultationFee}` : null)}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}><Briefcase size={16} /> Legal Help Requirements</h3>
                            <div className={styles.dataGrid}>
                                {renderDataField("Category", profile.legalHelp?.category)}
                                {renderDataField("Specialization", profile.legalHelp?.specialization)}
                                {renderDataField("Sub Department", profile.legalHelp?.subDepartment)}
                                {renderDataField("Consultation Mode", profile.legalHelp?.mode)}
                                {renderDataField("Preferred Advocate Type", profile.legalHelp?.advocateType)}
                                {renderDataField("Preferred Languages", profile.legalHelp?.languages)}
                                <div className={styles.fullWidthField}>
                                    {renderDataField("Issue Description", profile.legalHelp?.issueDescription)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. LOCATION / ADDRESS */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}><MapPin size={16} /> Address Details</h3>
                        <div className={styles.dataGrid}>
                            {renderDataField("Country", profile.country || profile.location?.country || profile.address?.country)}
                            {renderDataField("State", profile.state || profile.location?.state || profile.address?.state)}
                            {renderDataField("City", profile.city || profile.location?.city || profile.address?.city)}
                            {renderDataField("Pincode", profile.pincode || profile.location?.pincode || profile.address?.pincode)}
                            {renderDataField("Office Address", profile.address?.office)}
                            {renderDataField("Permanent Address", profile.address?.permanent)}
                        </div>
                    </div>

                    {/* 4. INTERESTS */}
                    {(profile.interests || profile.superInterests) && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}><User size={16} /> Preferences & Interests</h3>
                            <div className={styles.dataGrid}>
                                {renderDataField("Interests", profile.interests)}
                                {renderDataField("Super Interests", profile.superInterests)}
                            </div>
                        </div>
                    )}

                    {/* 5. DOCUMENTS */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}><FileText size={16} /> Registration Documents</h3>
                            <button className={styles.downloadAllBtn} onClick={handleDownloadAll}>
                                <Download size={14} /> Download All (Images)
                            </button>
                        </div>
                        <div className={styles.fileGrid}>
                            {isAdvocate ? (
                                <>
                                    {renderFileItem("ID Proof Document", profile.idProof?.docPath)}
                                    {renderFileItem("Education Certificate", profile.education?.certificatePath)}
                                    {renderFileItem("Practice License / Bar ID", profile.practice?.licensePath)}
                                    {renderFileItem("Digitized Signature", profile.signaturePath)}
                                </>
                            ) : (
                                <>
                                    {renderFileItem(profile.documentType || "Verification Document", profile.documentPath)}
                                    {renderFileItem("Digitized Signature", profile.signaturePath)}
                                </>
                            )}
                        </div>
                    </div>

                    {/* 6. VERIFICATION CHECKLIST (NEW FORM) */}
                    <div className={styles.verificationForm}>
                        <h3 className={styles.sectionTitle}><ShieldCheck size={18} /> Official Verification Checklist</h3>
                        <div className={styles.checklistGrid}>
                            <label className={styles.checkItem}>
                                <input
                                    type="checkbox"
                                    checked={checklist.identityProof}
                                    onChange={() => setChecklist({ ...checklist, identityProof: !checklist.identityProof })}
                                />
                                <span>Identity Proof (Aadhar/PAN/Passport) Matches Name</span>
                            </label>
                            <label className={styles.checkItem}>
                                <input
                                    type="checkbox"
                                    checked={checklist.addressProof}
                                    onChange={() => setChecklist({ ...checklist, addressProof: !checklist.addressProof })}
                                />
                                <span>Address Verification Completed</span>
                            </label>
                            {isAdvocate && (
                                <>
                                    <label className={styles.checkItem}>
                                        <input
                                            type="checkbox"
                                            checked={checklist.professionalDegree}
                                            onChange={() => setChecklist({ ...checklist, professionalDegree: !checklist.professionalDegree })}
                                        />
                                        <span>Educational Degree & Certificates Authenticated</span>
                                    </label>
                                    <label className={styles.checkItem}>
                                        <input
                                            type="checkbox"
                                            checked={checklist.practiceLicense}
                                            onChange={() => setChecklist({ ...checklist, practiceLicense: !checklist.practiceLicense })}
                                        />
                                        <span>Practice License/Bar ID Validated with State Council</span>
                                    </label>
                                </>
                            )}
                            <label className={styles.checkItem}>
                                <input
                                    type="checkbox"
                                    checked={checklist.photoMatch}
                                    onChange={() => setChecklist({ ...checklist, photoMatch: !checklist.photoMatch })}
                                />
                                <span>Profile Picture Matches Government ID</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    {showRemarks && (
                        <div className={styles.remarksSection}>
                            <label style={{ color: actionType === 'reverify' ? '#f59e0b' : '#fca5a5' }}>
                                Reason for {actionType === 'reverify' ? 'Re-verification' : 'Rejection'}:
                            </label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder={`Enter reason for ${actionType}...`}
                                className={styles.remarksInput}
                                style={{ borderColor: actionType === 'reverify' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)' }}
                                disabled={isActionLoading}
                            />
                        </div>
                    )}
                    <div className={styles.footerActions}>
                        {!showRemarks ? (
                            <>
                                <button
                                    className={styles.rejectBtn}
                                    onClick={() => { setActionType('reject'); setShowRemarks(true); }}
                                    disabled={isActionLoading}
                                >
                                    <AlertTriangle size={18} /> Reject
                                </button>
                                <button
                                    className={styles.reverifyBtn}
                                    onClick={() => { setActionType('reverify'); setShowRemarks(true); }}
                                    disabled={isActionLoading}
                                >
                                    <ShieldCheck size={18} /> Reverify
                                </button>
                                <button
                                    className={`${styles.approveBtn} ${!isChecklistComplete() ? styles.disabled : ''}`}
                                    onClick={() => {
                                        if (!isChecklistComplete()) {
                                            alert("Please complete the verification checklist before approving.");
                                            return;
                                        }
                                        onVerify(member.id, true);
                                    }}
                                    disabled={isActionLoading}
                                >
                                    <CheckCircle size={18} /> {isActionLoading ? 'Processing...' : 'Approve & Verify Member'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => { setShowRemarks(false); setActionType(null); }}
                                    disabled={isActionLoading}
                                >
                                    Back
                                </button>
                                <button
                                    className={actionType === 'reverify' ? styles.reverifyBtn : styles.confirmRejectBtn}
                                    onClick={() => {
                                        if (!remarks.trim()) {
                                            alert(`Please enter reason for ${actionType}`);
                                            return;
                                        }
                                        onVerify(member.id, false, remarks);
                                    }}
                                    disabled={isActionLoading || !remarks.trim()}
                                >
                                    {actionType === 'reverify' ? 'Confirm Re-verification' : 'Confirm Rejection'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberVerificationModal;
