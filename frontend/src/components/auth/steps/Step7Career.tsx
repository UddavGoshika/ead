import React from 'react';
import { Award, Globe, Linkedin } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
    isOptional?: boolean;
}

import { useAdminConfig } from '../../../hooks/useAdminConfig';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
    isOptional?: boolean;
}

const Step7Career: React.FC<StepProps> = ({ formData, updateFormData, isOptional }) => {
    const { getOptions } = useAdminConfig();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    const handleLanguageChange = (language: string) => {
        const current = formData.languages || [];
        const updated = current.includes(language)
            ? current.filter((l: string) => l !== language)
            : [...current, language];

        updateFormData({ languages: updated });
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
                <Award size={20} />
                <h3>Career Information</h3>
            </div>

            <div className={styles.formGrid}>
                {/* Current Firm */}
                <div className={styles.formGroup}>
                    <label>CURRENT FIRM / CHAMBER</label>
                    <input
                        type="text"
                        name="currentFirm"
                        placeholder="Name of your current firm"
                        value={formData.currentFirm || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* Position */}
                <div className={styles.formGroup}>
                    <label>POSITION / ROLE</label>
                    <input
                        type="text"
                        name="position"
                        placeholder="Your position / designation"
                        value={formData.position || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* Work Type */}
                <div className={styles.formGroup}>
                    <label>
                        TYPE OF WORK {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <select
                        name="workType"
                        value={formData.workType || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Work Type</option>
                        <option value="litigation">Litigation</option>
                        <option value="corporate">Corporate Advisory</option>
                        <option value="academic">Academic / Research</option>
                        <option value="government">Government Service</option>
                        <option value="private">Private Practice</option>
                    </select>
                </div>

                {/* Languages - Dynamic */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>
                        LANGUAGES KNOWN {!isOptional && <span className={styles.required}>*</span>}
                    </label>

                    <div className={styles.languageGrid}>
                        {getOptions('language').map((lang) => (
                            <label key={lang.id} className={styles.checkboxItem}>
                                <input
                                    type="checkbox"
                                    checked={formData.languages?.includes(lang.id)}
                                    onChange={() => handleLanguageChange(lang.id)}
                                />
                                {lang.label}
                            </label>
                        ))}
                    </div>

                    <input
                        type="text"
                        name="otherLanguages"
                        placeholder="Other languages (comma separated)"
                        value={formData.otherLanguages || ''}
                        onChange={handleChange}
                        className={styles.otherLangInput}
                    />
                </div>

                {/* Professional Bio */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>
                        PROFESSIONAL BIO {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <textarea
                        name="careerBio"
                        placeholder="Briefly describe your professional journey and expertise..."
                        rows={4}
                        value={formData.careerBio || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* Website */}
                <div className={styles.formGroup}>
                    <label>Social Media Links... (IF ANY)</label>
                    <div className={styles.inputIconWrapper}>
                        <Globe className={styles.inputIcon} size={18} />
                        <input
                            type="url"
                            name="website"
                            placeholder="https://..."
                            value={formData.website || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* LinkedIn */}
                <div className={styles.formGroup}>
                    <label>LINKEDIN PROFILE</label>
                    <div className={styles.inputIconWrapper}>
                        <Linkedin className={styles.inputIcon} size={18} />
                        <input
                            type="url"
                            name="linkedin"
                            placeholder="LinkedIn URL"
                            value={formData.linkedin || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step7Career;
