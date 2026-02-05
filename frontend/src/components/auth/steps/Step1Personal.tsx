import React, { useRef } from 'react';
import { User, Upload } from 'lucide-react';
import axios from 'axios';
import styles from '../AdvocateRegistration.module.css';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
}

const Step1Personal: React.FC<StepProps> = ({ formData, updateFormData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const profilePicInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            updateFormData({ [field]: file });
        }
    };

    // const handleFileButtonClick = (ref: React.RefObject<HTMLInputElement>) => {
    //     ref.current?.click();
    // };

    return (
        <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
                <User size={20} />
                <h3>Personal Details</h3>
            </div>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>FIRST NAME <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="Enter first name"
                        value={formData.firstName || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>LAST NAME <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Enter last name"
                        value={formData.lastName || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>GENDER <span className={styles.required}>*</span></label>
                    <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>DATE OF BIRTH <span className={styles.required}>*</span></label>
                    <div className={styles.inputIconWrapper}>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>MOBILE NUMBER <span className={styles.required}>*</span></label>
                    <input
                        type="tel"
                        name="mobile"
                        placeholder="10-digit number"
                        value={formData.mobile || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>EMAIL <span className={styles.required}>*</span></label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={formData.email || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>ID PROOF TYPE <span className={styles.required}>*</span></label>
                    <select
                        name="idProofType"
                        value={formData.idProofType || ''}
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Document</option>
                        <option value="aadhaar">Aadhaar Card</option>
                        <option value="pan">PAN Card</option>
                        <option value="passport">Passport</option>
                        <option value="voter">Voter ID</option>
                        <option value="driving">Driving License</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>UPLOAD ID PROOF <span className={styles.required}>*</span></label>
                    <div className={styles.fileUploadContainer}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".jpg,.jpeg,.png,.pdf"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileChange(e, 'idProofDocument')}
                        />
                        <button
                            type="button"
                            className={styles.fileUploadButton}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={18} />
                            <span>Upload ID Proof</span>
                        </button>
                        {formData.idProofDocument && (
                            <div className={styles.fileInfo}>
                                <span className={styles.fileName}>
                                    {typeof formData.idProofDocument === 'string'
                                        ? formData.idProofDocument
                                        : formData.idProofDocument?.name}
                                </span>
                                <span className={styles.fileSize}>Uploaded</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>PROFILE PHOTO <span className={styles.required}>*</span></label>
                    <div className={styles.fileUploadContainer}>
                        <input
                            type="file"
                            ref={profilePicInputRef}
                            accept=".jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileChange(e, 'profilePhoto')}
                        />
                        <button
                            type="button"
                            className={styles.fileUploadButton}
                            onClick={() => profilePicInputRef.current?.click()}
                        >
                            <Upload size={18} />
                            <span>Upload Profile Photo</span>
                        </button>
                        {formData.profilePhoto && (
                            <div className={styles.fileInfo}>
                                <span className={styles.fileName}>
                                    {typeof formData.profilePhoto === 'string'
                                        ? formData.profilePhoto
                                        : formData.profilePhoto?.name}
                                </span>
                                <span className={styles.fileSize}>Uploaded</span>
                            </div>
                        )}
                    </div>
                    <p className={styles.fileNote}>Accepted formats: JPG, PNG (Max 5MB)</p>
                </div>

                <div className={styles.referralBox}>
                    <h4>Have a Referral Code?</h4>
                    <div className={styles.referralInputWrap}>
                        <input
                            type="text"
                            placeholder="Enter referral code (e.g. LEX-ABCDE)"
                            value={formData.referralCode || ''}
                            onChange={(e) => {
                                updateFormData({ referralCode: e.target.value.toUpperCase(), referralValidated: false, referralError: null, referrerName: null });
                            }}
                            className={formData.referralError ? styles.inputError : formData.referralValidated ? styles.inputSuccess : ''}
                        />
                        <button
                            type="button"
                            className={styles.applyReferralBtn}
                            disabled={!formData.referralCode || formData.referralValidated}
                            onClick={async () => {
                                try {
                                    const res = await axios.get(`/api/auth/validate-referral/${formData.referralCode}`);
                                    if (res.data.success) {
                                        updateFormData({
                                            referralValidated: true,
                                            referralError: null,
                                            referrerName: res.data.referrerName
                                        });
                                    }
                                } catch (err: any) {
                                    updateFormData({
                                        referralValidated: false,
                                        referralError: err.response?.data?.error || "Invalid code"
                                    });
                                }
                            }}
                        >
                            {formData.referralValidated ? 'Applied ✔' : 'Apply'}
                        </button>
                    </div>
                    {formData.referralError && <p className={styles.referralErrorText}>{formData.referralError}</p>}
                    {formData.referralValidated && <p className={styles.referralSuccessText}>Applied! Code from {formData.referrerName}</p>}
                </div>



            </div>



        </div>
    );
};

export default Step1Personal;
