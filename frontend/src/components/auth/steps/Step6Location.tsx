import React from 'react';
import { MapPin } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
}

const Step6Location: React.FC<StepProps> = ({ formData, updateFormData }) => {

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    const handleSameAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;

        updateFormData({
            sameAsCurrent: checked,
            permAddress: checked ? formData.currAddress : '',
            permState: checked ? formData.currState : '',
            permCity: checked ? formData.currCity : '',
            permPincode: checked ? formData.currPincode : ''
        });
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
                <MapPin size={20} />
                <h3>Office Location</h3>
            </div>

            {/* ================= CURRENT ADDRESS ================= */}
            <h4 className={styles.subSectionTitle}>Current Address</h4>
            <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>
                        ADDRESS <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        name="currAddress"
                        rows={3}
                        placeholder="Enter current address"
                        value={formData.currAddress || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>STATE <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="currState"
                        placeholder="State"
                        value={formData.currState || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>District <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="currDistrict"
                        placeholder="District"
                        value={formData.currDistrict || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>CITY <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="currCity"
                        placeholder="City"
                        value={formData.currCity || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>PINCODE <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="currPincode"
                        placeholder="6-digit pincode"
                        value={formData.currPincode || ''}
                        onChange={handleChange}
                        maxLength={6}
                    />
                </div>
            </div>

            {/* ================= SAME AS CHECKBOX ================= */}
            <div className={styles.checkboxRow}>
                <input
                    type="checkbox"
                    id="sameAddress"
                    checked={formData.sameAsCurrent || false}
                    onChange={handleSameAddress}
                />
                <label htmlFor="sameAddress">
                    Permanent address same as current address
                </label>
            </div>

            {/* ================= PERMANENT ADDRESS ================= */}
            <h4 className={styles.subSectionTitle}>Permanent Address</h4>

            <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>
                        ADDRESS <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        name="permAddress"
                        rows={3}
                        placeholder="Enter permanent address"
                        value={formData.permAddress || ''}
                        onChange={handleChange}
                        disabled={formData.sameAsCurrent}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>STATE <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="permState"
                        placeholder="State"
                        value={formData.permState || ''}
                        onChange={handleChange}
                        disabled={formData.sameAsCurrent}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>District <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="permDistrict"
                        placeholder="District"
                        value={formData.permDistrict || ''}
                        onChange={handleChange}
                        disabled={formData.sameAsCurrent}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>CITY <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="permCity"
                        placeholder="City"
                        value={formData.permCity || ''}
                        onChange={handleChange}
                        disabled={formData.sameAsCurrent}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>PINCODE <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="permPincode"
                        placeholder="6-digit pincode"
                        value={formData.permPincode || ''}
                        onChange={handleChange}
                        maxLength={6}
                        disabled={formData.sameAsCurrent}
                    />
                </div>
            </div>
        </div>
    );
};

export default Step6Location;
