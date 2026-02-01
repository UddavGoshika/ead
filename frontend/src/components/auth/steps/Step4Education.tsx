import React from 'react';
import { GraduationCap, Upload } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';
import universitiesData from '../../../data/universities.json';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
    isOptional?: boolean;
}

const universities = Object.keys(universitiesData).sort();

const years = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

const Step4Education: React.FC<StepProps> = ({ formData, updateFormData, isOptional }) => {
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'university') {
            // Reset college when university changes
            updateFormData({ university: value, college: '' });
        } else {
            updateFormData({ [name]: value });
        }
    };

    const availableColleges = formData.university
        ? (universitiesData as any)[formData.university].sort()
        : [];

    return (
        <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
                <GraduationCap size={20} />
                <h3>Educational Qualifications</h3>
            </div>

            <div className={styles.formGrid}>
                {/* Degree */}
                <div className={styles.formGroup}>
                    <label>
                        GRADUATE DEGREE {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <select
                        name="degree"
                        value={formData.degree || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Degree</option>
                        <option value="llb">LL.B.</option>
                        <option value="ba_llb">B.A. LL.B.</option>
                        <option value="bcom_llb">B.Com LL.B.</option>
                        <option value="bsc_llb">B.Sc. LL.B.</option>
                        <option value="llm">LL.M.</option>
                    </select>
                </div>

                {/* University */}
                <div className={styles.formGroup}>
                    <label>
                        UNIVERSITY {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <select
                        name="university"
                        value={formData.university || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select University</option>
                        {universities.map(uni => (
                            <option key={uni} value={uni}>{uni}</option>
                        ))}
                    </select>
                </div>

                {/* College */}
                <div className={styles.formGroup}>
                    <label>
                        COLLEGE {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <select
                        name="college"
                        value={formData.college || ''}
                        onChange={handleChange}
                        disabled={!formData.university}
                    >
                        <option value="">Select College</option>
                        {availableColleges.map((college: string) => (
                            <option key={college} value={college}>{college}</option>
                        ))}
                    </select>
                </div>

                {/* Graduation Year */}
                <div className={styles.formGroup}>
                    <label>
                        GRADUATION YEAR {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <select
                        name="passingYear"
                        value={formData.passingYear || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Year</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Enrollment Number */}
                <div className={styles.formGroup}>
                    <label>
                        ENROLLMENT NUMBER {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <input
                        type="text"
                        name="enrollmentNumber"
                        placeholder="Bar enrollment number"
                        value={formData.enrollmentNumber || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* Degree Certificate */}
                <div className={styles.formGroup}>
                    <label>
                        DEGREE CERTIFICATE {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <div className={styles.uploadWrapper}>
                        <input
                            type="file"
                            id="degreeCertificate"
                            accept=".pdf,.jpg,.jpeg,.png"
                            hidden
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                if (file) {
                                    updateFormData({ degreeCertificate: file });
                                }
                            }}
                        />

                        <label htmlFor="degreeCertificate" className={styles.uploadBtn}>
                            <Upload size={16} /> Upload Certificate
                        </label>

                        <span className={styles.fileName}>
                            {formData.degreeCertificate
                                ? formData.degreeCertificate.name
                                : 'No file chosen'}
                        </span>
                    </div>

                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>
                        About me {!isOptional && <span className={styles.required}>*</span>}
                    </label>
                    <textarea
                        name="aboutMe"
                        placeholder="Tell us about yourself"
                        value={formData.aboutMe || ''}
                        onChange={handleChange}
                        className={styles.textArea}
                    />
                </div>


            </div>


        </div>
    );
};

export default Step4Education;
