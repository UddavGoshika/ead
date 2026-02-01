import React from 'react';
import { Briefcase, Upload } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
    isOptional?: boolean;
}

const Step5Practice: React.FC<StepProps> = ({ formData, updateFormData, isOptional }) => {
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
                <Briefcase size={20} />
                <h3>Professional Practice</h3>
            </div>

            <div className={styles.formGrid}>
                {/* Bar Registration */}
                <div className={styles.formGroup}>
                    <label>
                        BAR COUNCIL REG. NO. {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <input
                        type="text"
                        name="barRegNo"
                        placeholder="Enter Registration Number"
                        value={formData.barRegNo || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* State Bar Council */}
                <div className={styles.formGroup}>
                    <label>
                        STATE BAR COUNCIL {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <input
                        type="text"
                        name="stateBar"
                        placeholder="Enter State Bar Council"
                        value={formData.stateBar || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* Court of Practice */}
                <div className={styles.formGroup}>
                    <label>
                        COURT OF PRACTICE {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <select
                        name="courtOfPractice"
                        value={formData.courtOfPractice || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Court</option>
                        <option value="supreme">Supreme Court</option>
                        <option value="high">High Court</option>
                        <option value="district">District Court</option>
                        <option value="sessions">Sessions Court</option>
                        <option value="consumer">Consumer Court</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Experience */}
                <div className={styles.formGroup}>
                    <label>
                        YEARS OF EXPERIENCE {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <select
                        name="experienceRange"
                        value={formData.experienceRange || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Experience</option>
                        <option value="0-2">0–2 Years</option>
                        <option value="3-5">3–5 Years</option>
                        <option value="6-10">6–10 Years</option>
                        <option value="10+">10+ Years</option>
                    </select>
                </div>

                {/* Primary Specialization */}
                <div className={styles.formGroup}>
                    <label>
                        PRIMARY SPECIALIZATION {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <select
                        name="specialization"
                        value={formData.specialization || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Specialization</option>
                        <option value="criminal">Criminal Law</option>
                        <option value="civil">Civil Law</option>
                        <option value="corporate">Corporate Law</option>
                        <option value="family">Family Law</option>
                        <option value="ip">Intellectual Property</option>
                        <option value="tax">Taxation Law</option>
                    </select>
                </div>

                {/* Sub Specialization */}
                <div className={styles.formGroup}>
                    <label>SUB-SPECIALIZATION</label>
                    <input
                        type="text"
                        name="subSpecialization"
                        placeholder="Optional sub-specialization"
                        value={formData.subSpecialization || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* Bar Association */}
                <div className={styles.formGroup}>
                    <label>BAR ASSOCIATION MEMBERSHIP</label>
                    <input
                        type="text"
                        name="barAssociation"
                        placeholder="Bar association name"
                        value={formData.barAssociation || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* Practice License */}
                <div className={styles.formGroup}>
                    <label>
                        PRACTICE LICENSE {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <div className={styles.uploadWrapper}>
                        <input
                            type="file"
                            id="practiceLicense"
                            accept=".pdf,.jpg,.jpeg,.png"
                            hidden
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                if (file) {
                                    updateFormData({ practiceLicense: file });
                                }
                            }}
                        />

                        <label htmlFor="practiceLicense" className={styles.uploadBtn}>
                            <Upload size={16} /> Upload Certificate
                        </label>

                        <span className={styles.fileName}>
                            {formData.practiceLicense
                                ? formData.practiceLicense.name
                                : 'No file chosen'}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.documentationSection}>
                <label className={styles.sectionLabel}>LEGAL DOCUMENTATION SERVICES (OPTIONAL)</label>
                <p className={styles.sectionHint}>Select the documentation services you provide</p>
                <div className={styles.docsGrid}>
                    {[
                        { id: 'agreements', label: 'Agreements Drafting' },
                        { id: 'affidavits', label: 'Affidavits' },
                        { id: 'notices', label: 'Notices' },
                        { id: 'legal-docs', label: 'Legal Document Preparation' }
                    ].map(doc => (
                        <div
                            key={doc.id}
                            className={`${styles.docChip} ${formData.legalDocumentation?.includes(doc.id) ? styles.activeChip : ''}`}
                            onClick={() => {
                                const current = formData.legalDocumentation || [];
                                const next = current.includes(doc.id)
                                    ? current.filter((i: string) => i !== doc.id)
                                    : [...current, doc.id];
                                updateFormData({ legalDocumentation: next });
                            }}
                        >
                            <div className={styles.chipCheck}>
                                {formData.legalDocumentation?.includes(doc.id) ? '✓' : '+'}
                            </div>
                            <span>{doc.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Step5Practice;
