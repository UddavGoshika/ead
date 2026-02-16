import React from 'react';
import { Briefcase, Upload } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';

import { useAdminConfig } from '../../../hooks/useAdminConfig';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
    isOptional?: boolean;
    role?: string;
    errors?: Record<string, boolean>;
}

const Step5Practice: React.FC<StepProps> = ({ formData, updateFormData, isOptional, role, errors }) => {
    const { getOptions } = useAdminConfig(role);

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
                        BAR COUNCIL REG. NO.
                    </label>
                    <input
                        type="text"
                        name="barRegNo"
                        placeholder="Enter Registration Number (Optional)"
                        value={formData.barRegNo || ''}
                        onChange={handleChange}
                        className={errors?.barRegNo ? styles.inputError : ''}
                    />
                </div>

                {/* State Bar Council */}
                <div className={styles.formGroup}>
                    <label>
                        STATE BAR COUNCIL
                    </label>
                    <input
                        type="text"
                        name="stateBar"
                        placeholder="Enter State Bar Council (Optional)"
                        value={formData.stateBar || ''}
                        onChange={handleChange}
                        className={errors?.stateBar ? styles.inputError : ''}
                    />
                </div>

                {/* Court of Practice - Dynamic */}
                <div className={styles.formGroup}>
                    <label>
                        COURT OF PRACTICE {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <select
                        name="courtOfPractice"
                        value={formData.courtOfPractice || ''}
                        onChange={handleChange}
                        className={errors?.courtOfPractice ? styles.inputError : ''}
                    >
                        <option value="">Select Court</option>
                        {getOptions('practice_area').map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Experience - Dynamic */}
                <div className={styles.formGroup}>
                    <label>
                        YEARS OF EXPERIENCE {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <select
                        name="experienceRange"
                        value={formData.experienceRange || ''}
                        onChange={handleChange}
                        className={errors?.experienceRange ? styles.inputError : ''}
                    >
                        <option value="">Select Experience</option>
                        {getOptions('experience').map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Primary Specialization - Dynamic */}
                <div className={styles.formGroup}>
                    <label>
                        PRIMARY SPECIALIZATION {!isOptional && <span className={styles.required}>*</span>} (select Multiple)
                    </label>
                    <select
                        name="specialization"
                        value=""
                        onChange={(e) => {
                            const selected = e.target.value;
                            if (!selected) return;
                            const current = (formData.specialization || '').split(',').filter((s: string) => s.trim());
                            if (!current.includes(selected)) {
                                updateFormData({ specialization: [...current, selected].join(',') });
                            }
                        }}
                        className={errors?.specialization ? styles.inputError : ''}
                    >
                        <option value="">Add Specialization</option>
                        {getOptions('specialization').map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                    <div className={styles.selectedChips} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {(formData.specialization || '').split(',').filter((s: string) => s.trim()).map((s: string) => (
                            <span key={s} className={styles.chip} style={{ backgroundColor: '#daa520', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {s}
                                <span style={{ cursor: 'pointer' }} onClick={() => {
                                    const next = (formData.specialization || '').split(',').filter((i: string) => i.trim() !== s).join(',');
                                    updateFormData({ specialization: next });
                                }}>×</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Sub Specialization */}
                <div className={styles.formGroup}>
                    <label>SUB-SPECIALIZATION (select Multiple)</label>
                    <select
                        name="subSpecialization"
                        value=""
                        onChange={(e) => {
                            const selected = e.target.value;
                            if (!selected) return;
                            const current = (formData.subSpecialization || '').split(',').filter((s: string) => s.trim());
                            if (!current.includes(selected)) {
                                updateFormData({ subSpecialization: [...current, selected].join(',') });
                            }
                        }}
                    >
                        <option value="">Add Sub Specialization</option>
                        {(getOptions('sub_department') as any[])
                            .filter(opt => {
                                const activeSpecs = (formData.specialization || '').split(',').filter((s: string) => s.trim());
                                return !activeSpecs.length || activeSpecs.includes(opt.parent);
                            })
                            .map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                    </select>
                    <div className={styles.selectedChips} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {(formData.subSpecialization || '').split(',').filter((s: string) => s.trim()).map((s: string) => (
                            <span key={s} className={styles.chip} style={{ backgroundColor: '#daa520', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {s}
                                <span style={{ cursor: 'pointer' }} onClick={() => {
                                    const next = (formData.subSpecialization || '').split(',').filter((i: string) => i.trim() !== s).join(',');
                                    updateFormData({ subSpecialization: next });
                                }}>×</span>
                            </span>
                        ))}
                    </div>
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
                        PRACTICE LICENSE {!isOptional && <span className={styles.required}>*</span>} <span className={styles.fileHint}>(JPG, PNG, PDF | Max 5MB)</span>
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
                                    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                                    if (!allowedTypes.includes(file.type)) {
                                        alert('Invalid file type. Please upload JPG, PNG or PDF.');
                                        e.target.value = '';
                                        return;
                                    }
                                    if (file.size > 5 * 1024 * 1024) {
                                        alert('File size exceeds 5MB limit.');
                                        e.target.value = '';
                                        return;
                                    }
                                    updateFormData({ practiceLicense: file });
                                }
                            }}
                        />

                        <label htmlFor="practiceLicense" className={`${styles.uploadBtn} ${errors?.practiceLicense ? styles.fileUploadError : ''}`}>
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
