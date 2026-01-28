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
}

interface Props {
    member: Member | null;
    onClose: () => void;
}

const MemberDetailModal: React.FC<Props> = ({ member, onClose }) => {
    if (!member) return null;

    const renderFileLink = (path: string | undefined, label: string) => {
        if (!path) return null;
        const fullUrl = path.startsWith('http') ? path : `http://localhost:5000/${path}`;
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
                            {member.profilePicPath || member.avatar ? (
                                <img src={member.profilePicPath ? (member.profilePicPath.startsWith('http') ? member.profilePicPath : `http://localhost:5000/${member.profilePicPath}`) : member.avatar} alt={member.name} />
                            ) : (
                                <UserCircle size={80} color="#64748b" />
                            )}
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
