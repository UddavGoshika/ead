import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './SuperRegistration.module.css';
import { adminService } from '../../../services/api';
import {
    MdPerson, MdCheckCircle, MdAssignmentInd, MdArrowBack,
    MdAdminPanelSettings, MdSupervisorAccount, MdPeopleOutline,
    MdCall, MdChat, MdSupportAgent, MdStorage, MdAssistant
} from 'react-icons/md';
import { Plus, X } from 'lucide-react';

type ProfessionalRole =
    | 'Manager'
    | 'Team Lead'
    | 'HR'
    | 'Influencer'
    | 'Marketer'
    | 'Marketing Agency'
    | 'Call Support'
    | 'Chat Support'
    | 'Personal Agent'
    | 'Live Chat'
    | 'Telecaller'
    | 'Customer Care'
    | 'Data Entry'
    | 'Personal Assistant';

interface RoleInfo {
    role: ProfessionalRole;
    icon: any;
    description: string;
    color: string;
}

const ROLE_METADATA: (RoleInfo & { category: 'PRO' | 'SUPPORT' | 'LEGACY' })[] = [
    // Professional Administrative Roles
    { role: 'Manager', icon: MdAdminPanelSettings, color: '#3b82f6', description: 'High-level operational oversight and strategy.', category: 'PRO' },
    { role: 'Team Lead', icon: MdSupervisorAccount, color: '#8b5cf6', description: 'Direct supervision of support teams and throughput.', category: 'PRO' },
    { role: 'HR', icon: MdPeopleOutline, color: '#ec4899', description: 'Personnel management and organizational audit.', category: 'PRO' },
    { role: 'Influencer', icon: MdPeopleOutline, color: '#f59e0b', description: 'Digital presence management and brand advocacy.', category: 'PRO' },
    { role: 'Marketer', icon: MdAssignmentInd, color: '#10b981', description: 'Strategic marketing campaigns and lead management.', category: 'PRO' },
    { role: 'Marketing Agency', icon: MdAdminPanelSettings, color: '#06b6d4', description: 'External agency partnership and performance tracking.', category: 'PRO' },

    // E-Advocate Packages Support Roles
    { role: 'Call Support', icon: MdCall, color: '#ef4444', description: 'Inbound technical and account assistance.', category: 'SUPPORT' },
    { role: 'Chat Support', icon: MdChat, color: '#14b8a6', description: 'Text-based premium support for package holders.', category: 'SUPPORT' },
    { role: 'Personal Agent', icon: MdPeopleOutline, color: '#f43f5e', description: 'Dedicated personal assistance for Elite members.', category: 'SUPPORT' },
    { role: 'Live Chat', icon: MdSupportAgent, color: '#6366f1', description: 'Real-time digital support and engagement.', category: 'SUPPORT' },

    // Others / Legacy
    { role: 'Telecaller', icon: MdCall, color: '#94a3b8', description: 'Outbound communication and lead generation.', category: 'LEGACY' },
    { role: 'Customer Care', icon: MdSupportAgent, color: '#fb923c', description: 'Premium relationship management and support.', category: 'LEGACY' },
    { role: 'Data Entry', icon: MdStorage, color: '#2dd4bf', description: 'Precise information management and processing.', category: 'LEGACY' },
    { role: 'Personal Assistant', icon: MdAssistant, color: '#8b5cf6', description: 'Dedicated support for individual member needs.', category: 'LEGACY' },
];

const SuperRegistration: React.FC = () => {
    const location = useLocation();
    const [step, setStep] = useState<'SELECTING' | 'FORM' | 'SUCCESS'>('SELECTING');
    const [currentFormStep, setCurrentFormStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<ProfessionalRole>('Telecaller');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // New Role Modal State
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [newRoleData, setNewRoleData] = useState({ name: '', category: 'PRO' as 'PRO' | 'SUPPORT' | 'LEGACY', description: '' });
    const [customRoles, setCustomRoles] = useState<typeof ROLE_METADATA>([]);

    const allRoles = [...ROLE_METADATA, ...customRoles];

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        fullName: '', email: '', phone: '', dob: '', address: '', photo: null,
        // Step 2: Role Specific (Dynamic)
        roleSpecific: {} as any,
        // Step 3: Documents
        idProofType: 'Aadhar', idUpload: null, resumeUpload: null,
        // Step 4: Account
        loginId: '', tempPassword: '',
    });

    useEffect(() => {
        if (location.state && (location.state as any).initialRole) {
            const role = (location.state as any).initialRole as ProfessionalRole;
            const validRoles = ROLE_METADATA.map(r => r.role);
            if (validRoles.includes(role)) {
                setSelectedRole(role);
                setStep('FORM');
            }
        }
    }, [location]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, section?: 'roleSpecific') => {
        const { name, value } = e.target;
        if (section === 'roleSpecific') {
            setFormData(prev => ({
                ...prev,
                roleSpecific: { ...prev.roleSpecific, [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, [name]: e.target.files![0] }));
        }
    };

    const handleRoleSelect = (role: ProfessionalRole) => {
        setSelectedRole(role);
        setFormData(prev => ({ ...prev, roleSpecific: {} })); // Reset role specific data
        setStep('FORM');
    };

    const handleNext = () => {
        if (currentFormStep < 5) setCurrentFormStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentFormStep > 1) setCurrentFormStep(prev => prev - 1);
        else setStep('SELECTING');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentFormStep < 5) {
            handleNext();
            return;
        }

        setSubmitting(true);
        try {
            const response = await adminService.onboardStaff({
                email: formData.email,
                fullName: formData.fullName,
                loginId: formData.loginId,
                tempPassword: formData.tempPassword,
                role: selectedRole,
                formData: formData.roleSpecific
            });

            if (response.data.success) {
                setSuccess(true);
                setStep('SUCCESS');
                setTimeout(() => {
                    setSuccess(false);
                    setStep('SELECTING');
                    setCurrentFormStep(1);
                    setFormData({
                        fullName: '', email: '', phone: '', dob: '', address: '', photo: null,
                        roleSpecific: {} as any,
                        idProofType: 'Aadhar', idUpload: null, resumeUpload: null,
                        loginId: '', tempPassword: '',
                    });
                }, 5000);
            } else {
                alert('Onboarding failed: ' + response.data.message);
            }
        } catch (err: any) {
            console.error('Submission error:', err);
            alert('Error during onboarding: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(true); // Keep processing for a moment or set to false if needed, usually false here
            setSubmitting(false);
        }
    };

    const formSteps = [
        { id: 1, label: 'Basic' },
        { id: 2, label: 'Role' },
        { id: 3, label: 'Docs' },
        { id: 4, label: 'Account' },
        { id: 5, label: 'Review' }
    ];

    const handleAddRole = (e: React.FormEvent) => {
        e.preventDefault();
        const newRole: any = {
            role: newRoleData.name,
            icon: MdPerson,
            color: '#6366f1',
            description: newRoleData.description,
            category: newRoleData.category
        };
        setCustomRoles(prev => [...prev, newRole]);
        setShowAddRoleModal(false);
        setNewRoleData({ name: '', category: 'PRO', description: '' });
    };

    return (
        <div className={styles.registrationWrapper}>
            <header className={styles.header}>
                <h1>Professional Ecosystem Onboarding</h1>
                <p>Provision high-performance staff across the entire support hierarchy.</p>
            </header>

            {step === 'SELECTING' ? (
                <div className={styles.roleSelectionContainer}>
                    <div className={styles.onboardingActions}>
                        <button className={styles.addRoleBtn} onClick={() => setShowAddRoleModal(true)}>
                            <Plus size={18} /> Add New Role
                        </button>
                    </div>

                    <section className={styles.roleGroup}>
                        <h2 className={styles.groupHeading}>Professional Administrative Roles</h2>
                        <div className={styles.roleSelectionGrid}>
                            {allRoles.filter(r => r.category === 'PRO').map((info) => (
                                <div
                                    key={info.role}
                                    className={styles.roleSelectionCard}
                                    onClick={() => handleRoleSelect(info.role)}
                                >
                                    <div className={styles.cardIcon} style={{ color: info.color }}>
                                        <info.icon size={32} />
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <h3>{info.role}</h3>
                                        <p>{info.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.roleGroup}>
                        <h2 className={styles.groupHeading}>E-Advocate Packages Support Roles</h2>
                        <div className={styles.roleSelectionGrid}>
                            {allRoles.filter(r => r.category === 'SUPPORT').map((info) => (
                                <div
                                    key={info.role}
                                    className={styles.roleSelectionCard}
                                    onClick={() => handleRoleSelect(info.role)}
                                >
                                    <div className={styles.cardIcon} style={{ color: info.color }}>
                                        <info.icon size={32} />
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <h3>{info.role}</h3>
                                        <p>{info.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.roleGroup}>
                        <h2 className={styles.groupHeading}>Extended Echo-System Roles</h2>
                        <div className={styles.roleSelectionGrid}>
                            {allRoles.filter(r => r.category === 'LEGACY').map((info) => (
                                <div
                                    key={info.role}
                                    className={styles.roleSelectionCard}
                                    onClick={() => handleRoleSelect(info.role)}
                                >
                                    <div className={styles.cardIcon} style={{ color: info.color }}>
                                        <info.icon size={32} />
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <h3>{info.role}</h3>
                                        <p>{info.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            ) : step === 'FORM' ? (
                <div className={styles.registrationCard}>
                    {/* Stepper UI */}
                    <div className={styles.stepperContainer}>
                        {formSteps.map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <div className={`${styles.stepItem} ${currentFormStep >= s.id ? styles.stepActive : ''}`}>
                                    <div className={styles.stepCircle}>{s.id}</div>
                                    <span>{s.label}</span>
                                </div>
                                {idx < formSteps.length - 1 && <div className={`${styles.stepLine} ${currentFormStep > s.id ? styles.lineActive : ''}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    <button className={styles.backBtn} onClick={handleBack}>
                        <MdArrowBack /> {currentFormStep === 1 ? 'Back to Roles' : 'Previous Step'}
                    </button>

                    <form onSubmit={handleSubmit}>
                        {currentFormStep === 1 && (
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>
                                    <MdPerson size={20} /> Step 1: Basic Information
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Full Legal Name</label>
                                        <input
                                            type="text" name="fullName" value={formData.fullName}
                                            onChange={handleInputChange} placeholder="e.g. Alexander Pierce" required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Professional Email</label>
                                        <input
                                            type="email" name="email" value={formData.email}
                                            onChange={handleInputChange} placeholder="staff@eadvocate.com" required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Phone Number</label>
                                        <input
                                            type="tel" name="phone" value={formData.phone}
                                            onChange={handleInputChange} placeholder="+1 (555) 000-00-00" required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Date of Birth</label>
                                        <input
                                            type="date" name="dob" value={formData.dob}
                                            onChange={handleInputChange} required
                                        />
                                    </div>
                                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                        <label>Current Address</label>
                                        <input
                                            type="text" name="address" value={formData.address}
                                            onChange={handleInputChange} placeholder="Street, City, State, ZIP" required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Profile Photo</label>
                                        <div className={styles.fileUpload}>
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                                            <span>{formData.photo ? (formData.photo as File).name : 'Upload Photo'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentFormStep === 2 && (
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>
                                    <MdAssignmentInd size={20} /> Step 2: {selectedRole} Professional Profile
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Employee ID / Internal ID</label>
                                        <input
                                            type="text" name="employeeId" placeholder="e.g. EMP-9920" required
                                            onChange={(e) => handleInputChange(e, 'roleSpecific')}
                                        />
                                    </div>

                                    {selectedRole === 'Manager' && (
                                        <>
                                            <div className={styles.inputGroup}>
                                                <label>Primary Department</label>
                                                <select name="department" onChange={(e) => handleInputChange(e, 'roleSpecific')}>
                                                    <option>Operations</option>
                                                    <option>Sales & Marketing</option>
                                                    <option>Finance</option>
                                                    <option>Customer Support</option>
                                                </select>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Management Level</label>
                                                <select name="mgmtLevel" onChange={(e) => handleInputChange(e, 'roleSpecific')}>
                                                    <option>Mid-Level</option>
                                                    <option>Senior Management</option>
                                                    <option>Executive</option>
                                                </select>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Expected Team Size</label>
                                                <input type="number" name="teamSize" placeholder="15" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Previous Company</label>
                                                <input type="text" name="prevCompany" placeholder="e.g. Legal Corp" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Reporting Region</label>
                                                <input type="text" name="region" placeholder="e.g. North America" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                        </>
                                    )}

                                    {selectedRole === 'Team Lead' && (
                                        <>
                                            <div className={styles.inputGroup}>
                                                <label>Team Name</label>
                                                <input type="text" name="teamName" placeholder="Alpha Squad" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Lead Experience (Years)</label>
                                                <input type="number" name="leadExperience" placeholder="e.g. 4" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Shift Timing</label>
                                                <select name="shift" onChange={(e) => handleInputChange(e, 'roleSpecific')}>
                                                    <option>Morning</option>
                                                    <option>Evening</option>
                                                    <option>Night</option>
                                                </select>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Reporting Manager</label>
                                                <input type="text" name="reportingManager" placeholder="Alexander Pierce" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                        </>
                                    )}

                                    {selectedRole === 'HR' && (
                                        <>
                                            <div className={styles.inputGroup}>
                                                <label>HR Experience (Years)</label>
                                                <input type="number" name="experience" placeholder="e.g. 5" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Specialization</label>
                                                <input type="text" name="specialization" placeholder="Recruitment / Payroll" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Professional Certifications</label>
                                                <input type="text" name="certifications" placeholder="SHRM, PHR etc." onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Reporting Manager</label>
                                                <input type="text" name="reportingManager" placeholder="Alexander Pierce" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                        </>
                                    )}

                                    {['Influencer', 'Marketer', 'Marketing Agency'].includes(selectedRole) && (
                                        <>
                                            <div className={styles.inputGroup}>
                                                <label>{selectedRole === 'Marketing Agency' ? 'Agency Name' : 'Primary Specialization'}</label>
                                                <input type="text" name="specialization" placeholder="e.g. Content Strategy / SEO" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>{selectedRole === 'Influencer' ? 'Main Platform' : 'Portfolio / Company Link'}</label>
                                                <input type="text" name="link" placeholder="e.g. instagram.com/user" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>{selectedRole === 'Influencer' ? 'Follower Count' : 'Monthly Budget Managed'}</label>
                                                <input type="text" name="metric" placeholder="e.g. 50k+ / $10,000" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Collaboration History</label>
                                                <select name="collabHistory" onChange={(e) => handleInputChange(e, 'roleSpecific')}>
                                                    <option>Individual Contributor</option>
                                                    <option>Previously Contracted</option>
                                                    <option>New Partnership</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {['Telecaller', 'Customer Care', 'Call Support', 'Chat Support', 'Personal Agent', 'Live Chat', 'Data Entry', 'Personal Assistant'].includes(selectedRole) && (
                                        <>
                                            <div className={styles.inputGroup}>
                                                <label>Experience in {selectedRole}</label>
                                                <input type="text" name="experience" placeholder="e.g. 3 Years" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Previous Company</label>
                                                <input type="text" name="prevCompany" placeholder="e.g. Global Solutions" onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Availability / Notice Period</label>
                                                <select name="availability" onChange={(e) => handleInputChange(e, 'roleSpecific')}>
                                                    <option>Immediate</option>
                                                    <option>1 Week</option>
                                                    <option>15 Days</option>
                                                    <option>1 Month</option>
                                                </select>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Shift preference</label>
                                                <select name="shiftPref" onChange={(e) => handleInputChange(e, 'roleSpecific')}>
                                                    <option>Flexible</option>
                                                    <option>Fixed Morning</option>
                                                    <option>Fixed Night</option>
                                                </select>
                                            </div>
                                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                                <label>Primary Skills & Qualifications</label>
                                                <input type="text" name="skills" placeholder="Communication, CRM, Typing, Technical Certs..." onChange={(e) => handleInputChange(e, 'roleSpecific')} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentFormStep === 3 && (
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>
                                    <MdSupportAgent size={20} /> Step 3: Document Verification
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Identification Proof Type</label>
                                        <select name="idProofType" value={formData.idProofType} onChange={handleInputChange}>
                                            <option>Passport</option>
                                            <option>Driver's License</option>
                                            <option>Aadhar Card</option>
                                            <option>National ID / Voter ID</option>
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Upload ID Document</label>
                                        <div className={styles.fileUpload}>
                                            <input type="file" onChange={(e) => handleFileChange(e, 'idUpload')} />
                                            <span>{formData.idUpload ? (formData.idUpload as File).name : 'Select ID File (Image/PDF)'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Academic / Professional Resume</label>
                                        <div className={styles.fileUpload}>
                                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'resumeUpload')} />
                                            <span>{formData.resumeUpload ? (formData.resumeUpload as File).name : 'Select Resume (PDF)'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentFormStep === 4 && (
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>
                                    <MdAdminPanelSettings size={20} /> Step 4: Account Generation (Admin Only)
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Designated Login ID</label>
                                        <input
                                            type="text" name="loginId" value={formData.loginId}
                                            onChange={handleInputChange} placeholder="e.g. MGR_ALEX_01" required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Temporary Password</label>
                                        <input
                                            type="text" name="tempPassword" value={formData.tempPassword}
                                            onChange={handleInputChange} placeholder="System-generated if empty"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Account Role</label>
                                        <input type="text" value={selectedRole} readOnly disabled />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentFormStep === 5 && (
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>
                                    <MdCheckCircle size={20} /> Step 5: Final Review
                                </div>
                                <div className={styles.reviewGrid}>
                                    <div className={styles.reviewItem}>
                                        <strong>Name:</strong> <span>{formData.fullName || 'Not set'}</span>
                                    </div>
                                    <div className={styles.reviewItem}>
                                        <strong>Role:</strong> <span>{selectedRole}</span>
                                    </div>
                                    <div className={styles.reviewItem}>
                                        <strong>Email:</strong> <span>{formData.email || 'Not set'}</span>
                                    </div>
                                    <div className={styles.reviewItem}>
                                        <strong>Login ID:</strong> <span>{formData.loginId || 'Pending...'}</span>
                                    </div>
                                    <p style={{ gridColumn: 'span 2', fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                                        Check all details before submitting. Upon submission, the request will be sent to the Admin for final approval.
                                        Credentials will be dispatched to <strong>{formData.email}</strong> after approval.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className={styles.formActions}>
                            <button type="submit" className={styles.submitBtn} disabled={submitting}>
                                {submitting ? 'Processing...' : currentFormStep === 5 ? 'Submit for Approval' : 'Save & Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            {success && (
                <div className={styles.successOverlay}>
                    <div className={styles.successContent}>
                        <MdCheckCircle size={80} color="#10b981" />
                        <h2>Request Submitted!</h2>
                        <p>The onboarding request for <strong>{selectedRole}</strong> is now pending Admin approval.</p>
                        <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '10px' }}>Credentials will be sent to the registered email once approved.</p>
                    </div>
                </div>
            )}
            {showAddRoleModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Provision New Role</h2>
                            <button className={styles.closeBtn} onClick={() => setShowAddRoleModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddRole} className={styles.modalForm}>
                            <div className={styles.inputGroup}>
                                <label>Role Type / Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Quality Auditor"
                                    value={newRoleData.name}
                                    onChange={(e) => setNewRoleData({ ...newRoleData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Architecture Tier</label>
                                <select
                                    value={newRoleData.category}
                                    onChange={(e) => setNewRoleData({ ...newRoleData, category: e.target.value as any })}
                                >
                                    <option value="PRO">Professional Administrative</option>
                                    <option value="SUPPORT">Premium Package Support</option>
                                    <option value="LEGACY">Extended Echo-System</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Functional Description</label>
                                <textarea
                                    placeholder="Define the primary responsibilities..."
                                    rows={3}
                                    value={newRoleData.description}
                                    onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.submitBtn}>Initialize Role Architecture</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperRegistration;
