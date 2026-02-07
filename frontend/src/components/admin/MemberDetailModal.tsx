import React from 'react';
import { X, UserCircle } from 'lucide-react';
import styles from './MemberDetailModal.module.css';

interface Member {
    id: string;
    name: string;
    email?: string;
    role: string;
    status: string;
    createdAt?: string;
    verified: boolean;
    location?: any;
    address?: any;
    phone?: string;
    mobile?: string;
    gender?: string;
    avatar?: string;
    profilePicPath?: string;
    dob?: string;
    education?: any;
    practice?: any;
    idProof?: any;
    documentPath?: string;
    documentType?: string;
    legalHelp?: any;
    career?: any;
    signaturePath?: string;
    rejectionReason?: string;
    image?: string; // Add image property from parent
}

interface Props {
    member: Member | null;
    onClose: () => void;
}

const MemberDetailModal: React.FC<Props> = ({ member, onClose }) => {
    if (!member) return null;

    const renderFileLink = (path: string | undefined, label: string) => {
        if (!path) return null;

        // Normalize path
        let cleanPath = path.replace(/\\/g, '/');
        const uploadIndex = cleanPath.toLowerCase().indexOf('uploads/');
        if (uploadIndex !== -1) {
            cleanPath = cleanPath.substring(uploadIndex);
        } else {
            cleanPath = cleanPath.replace(/^\/+/, '');
            if (!cleanPath.includes('/') && cleanPath.length > 0) cleanPath = `uploads/${cleanPath}`;
        }
        const fullUrl = (cleanPath.startsWith('http') || cleanPath.startsWith('blob:') || cleanPath.startsWith('/')) ? cleanPath : `/${cleanPath}`;

        return (
            <div className={styles.fileItem}>
                <label>{label}</label>
                <a href={fullUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                    View File
                </a>
            </div>
        );
    };

    const isAdvocate = member.role.toLowerCase() === 'advocate';

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>{isAdvocate ? 'Advocate' : 'Client'} Full Details</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <div className={styles.content}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatarLarge}>
                            {(() => {
                                // Prefer pre-processed image from parent, or process raw paths
                                let src = member.image;
                                if (!src) {
                                    if (member.profilePicPath) {
                                        src = member.profilePicPath.replace(/\\/g, '/');
                                        if (!src.startsWith('http') && !src.startsWith('/')) src = `/${src}`;
                                    } else if (member.avatar) {
                                        src = member.avatar;
                                    }
                                }

                                return src ? (
                                    <img
                                        src={src}
                                        alt={member.name}
                                        onError={(e) => {
                                            e.currentTarget.src = '/avatar_placeholder.png';
                                            e.currentTarget.onerror = null;
                                        }}
                                    />
                                ) : (
                                    <UserCircle size={80} color="#64748b" />
                                );
                            })()}
                        </div>
                        <div className={styles.basicInfo}>
                            <h1>{member.name || (member as any).firstName + ' ' + (member as any).lastName || 'Anonymous User'}</h1>
                            <div className={styles.badges}>
                                <span className={`${styles.roleBadge} ${styles[member.role.toLowerCase()]}`}>
                                    {member.role.toUpperCase()}
                                </span>
                                <span className={`${styles.statusBadge} ${styles[member.status.toLowerCase()]}`}>
                                    {member.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sectionsGrid}>
                        {/* SECTION: PERSONAL */}
                        <div className={styles.sectionCard}>
                            <h3>Personal Information</h3>
                            <div className={styles.infoRow}>
                                <label>Full Name</label>
                                <span>{member.name || (member as any).firstName + ' ' + (member as any).lastName}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Email</label>
                                <span>{member.email || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Phone</label>
                                <span>{member.mobile || member.phone || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Gender</label>
                                <span>{member.gender || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Date of Birth</label>
                                <span>{member.dob ? new Date(member.dob).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>

                        {/* SECTION: ADDRESS */}
                        <div className={styles.sectionCard}>
                            <h3>Address & Location</h3>
                            {isAdvocate ? (
                                <>
                                    <div className={styles.infoRow}><label>City</label><span>{member.location?.city || 'N/A'}</span></div>
                                    <div className={styles.infoRow}><label>State</label><span>{member.location?.state || 'N/A'}</span></div>
                                    <div className={styles.infoRow}><label>Country</label><span>{member.location?.country || 'N/A'}</span></div>
                                    <div className={styles.infoRow}><label>Pincode</label><span>{member.location?.pincode || 'N/A'}</span></div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.infoRow}><label>City</label><span>{member.address?.city || 'N/A'}</span></div>
                                    <div className={styles.infoRow}><label>State</label><span>{member.address?.state || 'N/A'}</span></div>
                                    <div className={styles.infoRow}><label>Country</label><span>{member.address?.country || 'N/A'}</span></div>
                                    <div className={styles.infoRow}><label>Office</label><span>{member.address?.office || 'N/A'}</span></div>
                                    <div className={styles.infoRow}><label>Permanent</label><span>{member.address?.permanent || 'N/A'}</span></div>
                                </>
                            )}
                        </div>

                        {/* SECTION: PROFESSIONAL / HELP */}
                        {isAdvocate ? (
                            <div className={styles.sectionCard}>
                                <h3>Professional Details</h3>
                                <div className={styles.infoRow}><label>Specialization</label><span>{member.practice?.specialization || 'N/A'}</span></div>
                                <div className={styles.infoRow}><label>Experience</label><span>{member.practice?.experience || 'N/A'}</span></div>
                                <div className={styles.infoRow}><label>Court</label><span>{member.practice?.court || 'N/A'}</span></div>
                                <div className={styles.infoRow}><label>Enrollment #</label><span>{member.education?.enrollmentNo || 'N/A'}</span></div>
                                <div className={styles.infoRow}><label>Consultation Fee</label><span>{(member as any).availability?.consultationFee ? `₹${(member as any).availability.consultationFee}` : 'N/A'}</span></div>
                            </div>
                        ) : (
                            <div className={styles.sectionCard}>
                                <h3>Legal Help Required</h3>
                                <div className={styles.infoRow}><label>Category</label><span>{member.legalHelp?.category || 'N/A'}</span></div>
                                <div className={styles.infoRow}><label>Department</label><span>{member.legalHelp?.subDepartment || 'N/A'}</span></div>
                                <div className={styles.infoRow}><label>Mode</label><span>{member.legalHelp?.mode || 'N/A'}</span></div>
                                <div className={styles.infoRow}><label>Description</label><p className={styles.descText}>{member.legalHelp?.issueDescription || 'N/A'}</p></div>
                            </div>
                        )}

                        {/* SECTION: REJECTION (IF ANY) */}
                        {member.rejectionReason && (
                            <div className={styles.sectionCard} style={{ backgroundColor: '#fff1f2', border: '1px solid #fda4af', padding: '15px' }}>
                                <h3 style={{ color: '#be123c', marginBottom: '10px' }}>Verification Rejection Reason</h3>
                                <p style={{ color: '#9f1239', fontSize: '0.95rem', lineHeight: '1.6' }}>{member.rejectionReason}</p>
                            </div>
                        )}

                        {/* SECTION: FILES */}
                        <div className={styles.sectionCard}>
                            <h3>Uploaded Documents</h3>
                            <div className={styles.filesGrid}>
                                {isAdvocate ? (
                                    <>
                                        {renderFileLink(member.profilePicPath, 'Profile Photo')}
                                        {renderFileLink(member.education?.certificatePath, 'Education Certificate')}
                                        {renderFileLink(member.practice?.licensePath, 'Bar Council License')}
                                        {renderFileLink(member.idProof?.docPath, 'ID Proof Document')}
                                        {renderFileLink(member.signaturePath, 'Digital Signature')}
                                    </>
                                ) : (
                                    <>
                                        {renderFileLink(member.documentPath, `Identity (${member.documentType})`)}
                                        {renderFileLink(member.signaturePath, 'Digital Signature')}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.primaryBtn} onClick={onClose}>Close Detailed View</button>
                </div>
            </div>
        </div>
    );
};

export default MemberDetailModal;
