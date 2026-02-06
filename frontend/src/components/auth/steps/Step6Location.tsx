import React from 'react';
import { MapPin } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';
import { LOCATION_DATA_RAW } from '../../layout/statesdis';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
}

const Step6Location: React.FC<StepProps> = ({ formData, updateFormData }) => {

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const updates: any = { [name]: value };

        // Reset child fields when parent changes
        if (name === 'currState') {
            updates.currDistrict = '';
            updates.currCity = '';
            if (formData.sameAsCurrent) {
                updates.permState = value;
                updates.permDistrict = '';
                updates.permCity = '';
            }
        } else if (name === 'currDistrict') {
            updates.currCity = '';
            if (formData.sameAsCurrent) {
                updates.permDistrict = value;
                updates.permCity = '';
            }
        } else if (name === 'permState') {
            updates.permDistrict = '';
            updates.permCity = '';
        } else if (name === 'permDistrict') {
            updates.permCity = '';
        }

        // Sync other fields if sameAsCurrent is on
        if (formData.sameAsCurrent) {
            if (name === 'currAddress') updates.permAddress = value;
            if (name === 'currCity') updates.permCity = value;
            if (name === 'currPincode') updates.permPincode = value;
            if (name === 'currDistrict') updates.permDistrict = value;
        }

        updateFormData(updates);
    };

    const handleSameAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;

        updateFormData({
            sameAsCurrent: checked,
            permAddress: checked ? formData.currAddress : formData.permAddress,
            permState: checked ? formData.currState : formData.permState,
            permDistrict: checked ? formData.currDistrict : formData.permDistrict,
            permCity: checked ? formData.currCity : formData.permCity,
            permPincode: checked ? formData.currPincode : formData.permPincode
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
                    <select
                        name="currState"
                        value={formData.currState || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select State</option>
                        {Object.keys(LOCATION_DATA_RAW).sort().map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>District <span className={styles.required}>*</span></label>
                    <select
                        name="currDistrict"
                        value={formData.currDistrict || ''}
                        disabled={!formData.currState}
                        onChange={handleChange}
                    >
                        <option value="">Select District</option>
                        {formData.currState && Object.keys(LOCATION_DATA_RAW[formData.currState] || {}).sort().map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>CITY <span className={styles.required}>*</span></label>
                    <select
                        name="currCity"
                        value={formData.currCity || ''}
                        disabled={!formData.currDistrict}
                        onChange={handleChange}
                    >
                        <option value="">Select City</option>
                        {formData.currState && formData.currDistrict &&
                            (LOCATION_DATA_RAW[formData.currState][formData.currDistrict] || []).sort().map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                    </select>
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
                    <select
                        name="permState"
                        value={formData.permState || ''}
                        onChange={handleChange}
                        disabled={formData.sameAsCurrent}
                    >
                        <option value="">Select State</option>
                        {Object.keys(LOCATION_DATA_RAW).sort().map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>District <span className={styles.required}>*</span></label>
                    <select
                        name="permDistrict"
                        value={formData.permDistrict || ''}
                        disabled={formData.sameAsCurrent || !formData.permState}
                        onChange={handleChange}
                    >
                        <option value="">Select District</option>
                        {formData.permState && Object.keys(LOCATION_DATA_RAW[formData.permState] || {}).sort().map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>CITY <span className={styles.required}>*</span></label>
                    <select
                        name="permCity"
                        value={formData.permCity || ''}
                        disabled={formData.sameAsCurrent || !formData.permDistrict}
                        onChange={handleChange}
                    >
                        <option value="">Select City</option>
                        {formData.permState && formData.permDistrict &&
                            (LOCATION_DATA_RAW[formData.permState][formData.permDistrict] || []).sort().map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                    </select>
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
