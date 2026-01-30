import React, { useState } from 'react';
import { X, CheckCircle, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ClientRegistration.module.css';
import { authService } from '../../services/api';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

interface ClientRegistrationProps {
    onClose: () => void;
}

const steps = [
    { id: 1, label: 'PERSONAL DETAILS' },
    { id: 2, label: 'VERIFICATION' },
    { id: 3, label: 'ADDRESS & LOCATION' },
    { id: 4, label: 'LEGAL HELP REQUIRED' },
    { id: 5, label: 'DECLARATIONS' },
];

const ClientRegistration: React.FC<ClientRegistrationProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({
        firstName: '',
        lastName: '',
        gender: '',
        dob: '',
        mobile: '',
        email: '',
        password: '',
        documentType: '',
        document: null,
        legalCategory: 'Criminal',
        specialization: '',
        subDepartment: '',
        consultationMode: 'Online',
        advocateType: 'Senior',
        languages: '',
        issueDescription: '',
        signature: null,
        regDate: new Date().toISOString().split('T')[0],
        emailOtp: '',
        emailVerified: false,
        mobileOtp: '',
        mobileVerified: false
    });

    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [otpMessage, setOtpMessage] = useState({ text: '', type: '' });

    // Mobile OTP States
    const [mobileOtpSending, setMobileOtpSending] = useState(false);
    const [mobileOtpVerifying, setMobileOtpVerifying] = useState(false);
    const [mobileCountdown, setMobileCountdown] = useState(0);
    const [mobileMessage, setMobileMessage] = useState({ text: '', type: '' });
    const [confirmationResult, setConfirmationResult] = useState<any>(null);

    React.useEffect(() => {
        let timer: any;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    React.useEffect(() => {
        let timer: any;
        if (mobileCountdown > 0) {
            timer = setTimeout(() => setMobileCountdown(mobileCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [mobileCountdown]);

    const handleSendOtp = async () => {
        if (!formData.email) {
            setOtpMessage({ text: 'Please enter email in Step 1 first.', type: 'error' });
            return;
        }

        setOtpSending(true);
        setOtpMessage({ text: '', type: '' });
        try {
            const res = await (authService as any).sendOtp(formData.email);
            if (res.data.success) {
                setOtpMessage({ text: 'OTP sent to your email.', type: 'success' });
                setCountdown(60);
            } else {
                setOtpMessage({ text: res.data.error || 'Failed to send OTP.', type: 'error' });
            }
        } catch (err: any) {
            setOtpMessage({ text: err.response?.data?.error || 'Connection error.', type: 'error' });
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!formData.emailOtp || formData.emailOtp.length !== 6) {
            setOtpMessage({ text: 'Enter 6-digit OTP.', type: 'error' });
            return;
        }

        setOtpVerifying(true);
        setOtpMessage({ text: '', type: '' });
        try {
            const res = await (authService as any).verifyOtp(formData.email, formData.emailOtp);
            if (res.data.success) {
                setOtpMessage({ text: 'Email verified successfully!', type: 'success' });
                updateFormData('emailVerified', true);
            } else {
                setOtpMessage({ text: res.data.error || 'Invalid OTP.', type: 'error' });
            }
        } catch (err: any) {
            setOtpMessage({ text: err.response?.data?.error || 'Verification failed.', type: 'error' });
        } finally {
            setOtpVerifying(false);
        }
    };

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => { },
                'expired-callback': () => { }
            });
        }
    };

    const handleSendMobileOtp = async () => {
        if (!formData.mobile) {
            setMobileMessage({ text: 'Please enter mobile in Step 1 first.', type: 'error' });
            return;
        }

        setMobileOtpSending(true);
        setMobileMessage({ text: '', type: '' });
        try {
            setupRecaptcha();
            const appVerifier = (window as any).recaptchaVerifier;

            // Sanitization and E.164 Formatting
            let rawMobile = formData.mobile || "";
            let cleaned = rawMobile.replace(/[^\d+]/g, "");

            if (cleaned.length === 10 && !cleaned.startsWith('+')) {
                cleaned = '+91' + cleaned;
            }

            if (!cleaned.startsWith('+')) {
                cleaned = '+' + cleaned;
            }

            const confirmation = await signInWithPhoneNumber(auth, cleaned, appVerifier);
            setConfirmationResult(confirmation);
            setMobileMessage({ text: 'OTP sent successfully via SMS.', type: 'success' });
            setMobileCountdown(60);
        } catch (err: any) {
            console.error('Firebase Auth Error:', err);
            setMobileMessage({ text: 'Error: ' + (err.message || 'Check configuration'), type: 'error' });
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
            }
        } finally {
            setMobileOtpSending(false);
        }
    };

    const handleVerifyMobileOtp = async () => {
        if (!formData.mobileOtp || formData.mobileOtp.length !== 6) {
            setMobileMessage({ text: 'Enter 6-digit OTP.', type: 'error' });
            return;
        }
        if (!confirmationResult) {
            setMobileMessage({ text: 'Please send OTP first.', type: 'error' });
            return;
        }

        setMobileOtpVerifying(true);
        setMobileMessage({ text: '', type: '' });
        try {
            await confirmationResult.confirm(formData.mobileOtp);
            setMobileMessage({ text: 'Mobile verified successfully!', type: 'success' });
            updateFormData('mobileVerified', true);
        } catch (err: any) {
            console.error('Mobile verification error:', err);
            setMobileMessage({ text: 'Invalid Mobile OTP.', type: 'error' });
        } finally {
            setMobileOtpVerifying(false);
        }
    };


    const [currentAddress, setCurrentAddress] = useState({
        country: '',
        state: '',
        city: '',
        address: '',
        pincode: '',
    });

    const [permanentAddress, setPermanentAddress] = useState({
        country: '',
        state: '',
        city: '',
        address: '',
        pincode: '',
    });

    const [sameAsCurrent, setSameAsCurrent] = useState(false);

    const updateFormData = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            const submissionData = new FormData();

            // Basic fields
            submissionData.append('firstName', formData.firstName);
            submissionData.append('lastName', formData.lastName);
            submissionData.append('gender', formData.gender);
            submissionData.append('dob', formData.dob);
            submissionData.append('mobile', formData.mobile);
            submissionData.append('email', formData.email);
            submissionData.append('password', formData.password);
            submissionData.append('documentType', formData.documentType);
            submissionData.append('category', formData.category);
            submissionData.append('specialization', formData.specialization);
            submissionData.append('subDepartment', formData.subDepartment);
            submissionData.append('mode', formData.mode);
            submissionData.append('advocateType', formData.advocateType);
            submissionData.append('languages', formData.languages);
            submissionData.append('issueDescription', formData.issueDescription);

            if (formData.referralCode) submissionData.append('referralCode', formData.referralCode);
            if (formData.signatureData) submissionData.append('signatureData', formData.signatureData);

            // Address fields
            submissionData.append('country', currentAddress.country);
            submissionData.append('state', currentAddress.state);
            submissionData.append('city', currentAddress.city);
            submissionData.append('officeAddress', currentAddress.address);
            submissionData.append('pincode', currentAddress.pincode);
            submissionData.append('permanentAddress', sameAsCurrent ? currentAddress.address : permanentAddress.address);

            // Files
            if (formData.document) {
                submissionData.append('uploaddocument', formData.document);
            }
            if (formData.signature) {
                submissionData.append('signature', formData.signature);
            }

            const response = await authService.registerClient(submissionData);
            if (response.data.success) {
                alert('Client Registration Successful!');
                onClose();
            } else {
                alert('Registration failed: ' + (response.data.error || 'Unknown error'));
            }
        } catch (err: any) {
            console.error('Client Registration Error:', err);
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
    };


    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className={styles.stepContent}>

                        {/* FORM GRID */}
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>First Name *</label>
                                <input value={formData.firstName || ''} onChange={(e) => updateFormData('firstName', e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Last Name *</label>
                                <input value={formData.lastName || ''} onChange={(e) => updateFormData('lastName', e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Gender *</label>
                                <select value={formData.gender || ''} onChange={(e) => updateFormData('gender', e.target.value)}>
                                    <option value="">Select Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Date of Birth *</label>
                                <input type="date" value={formData.dob || ''} onChange={(e) => updateFormData('dob', e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mobile *</label>
                                <input value={formData.mobile || ''} onChange={(e) => updateFormData('mobile', e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email *</label>
                                <input value={formData.email || ''} onChange={(e) => updateFormData('email', e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Password *</label>
                                <input type="password" value={formData.password || ''} onChange={(e) => updateFormData('password', e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Document Type *</label>
                                <select
                                    value={formData.documentType || ''}
                                    onChange={(e) => updateFormData('documentType', e.target.value)}
                                >
                                    <option value="">Select Document</option>
                                    <option>Aadhar</option>
                                    <option>PAN</option>
                                    <option>Voter</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Upload ID Proof *</label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) updateFormData('document', file);
                                    }}
                                />
                            </div>
                        </div>

                        {/* 🔽 BOTTOM REFERRAL + NEXT BUTTON ROW */}
                        <div className={styles.referralBottomRow}>

                            {/* Referral Box */}
                            <div className={styles.referralBox}>
                                <h4>Have a Referral Code?</h4>
                                <div className={styles.referralInputWrap}>
                                    <input
                                        type="text"
                                        placeholder="Enter referral code (e.g. LEX-ABCDE)"
                                        value={formData.referralCode || ''}
                                        onChange={(e) => {
                                            updateFormData('referralCode', e.target.value.toUpperCase());
                                            updateFormData('referralValidated', false);
                                            updateFormData('referralError', null);
                                            updateFormData('referrerName', null);
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
                                                    updateFormData('referralValidated', true);
                                                    updateFormData('referralError', null);
                                                    updateFormData('referrerName', res.data.referrerName);
                                                }
                                            } catch (err: any) {
                                                updateFormData('referralValidated', false);
                                                updateFormData('referralError', err.response?.data?.error || "Invalid code");
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


            case 2:
                return (
                    <div className={styles.stepContent}>
                        <div id="recaptcha-container"></div>
                        <p className={styles.centerText}>
                            Verify your credentials to proceed
                        </p>

                        {/* Email Verification */}
                        <div className={styles.formGroup}>
                            <label>Email OTP <span className={styles.required}>*</span>
                                {formData.email && <span style={{ textTransform: 'none', marginLeft: '10px', color: '#64748b' }}>({formData.email})</span>}
                            </label>
                            <div className={styles.otpInputWrapper}>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={formData.emailOtp || ''}
                                    onChange={(e) => {
                                        if (/^\d{0,6}$/.test(e.target.value)) {
                                            updateFormData('emailOtp', e.target.value);
                                        }
                                    }}
                                    disabled={formData.emailVerified}
                                />
                                {!formData.emailVerified ? (
                                    <button
                                        className={styles.verifyBtn}
                                        onClick={formData.emailOtp?.length === 6 ? handleVerifyOtp : handleSendOtp}
                                        disabled={otpSending || otpVerifying || (countdown > 0 && !formData.emailOtp)}
                                    >
                                        {otpSending ? 'Sending...' : otpVerifying ? 'Verifying...' : (formData.emailOtp?.length === 6 ? 'Verify OTP' : 'Send OTP')}
                                    </button>
                                ) : (
                                    <div className={styles.verifiedBadge}>
                                        <CheckCircle size={20} /> Verified
                                    </div>
                                )}
                            </div>

                            {countdown > 0 && !formData.emailVerified && (
                                <p className={styles.resendText}>Resend available in {countdown}s</p>
                            )}
                            {otpMessage.text && (
                                <p className={styles.statusMessage} style={{ color: otpMessage.type === 'success' ? '#10b981' : '#ff4d4d' }}>
                                    {otpMessage.text}
                                </p>
                            )}
                        </div>

                        {/* Mobile Verification (Firebase) */}
                        <div className={styles.formGroup} style={{ marginTop: '20px' }}>
                            <label>Mobile OTP <span className={styles.required}>*</span>
                                {formData.mobile && <span style={{ textTransform: 'none', marginLeft: '10px', color: '#64748b' }}>({formData.mobile})</span>}
                            </label>
                            <div className={styles.otpInputWrapper}>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={formData.mobileOtp || ''}
                                    onChange={(e) => {
                                        if (/^\d{0,6}$/.test(e.target.value)) {
                                            updateFormData('mobileOtp', e.target.value);
                                        }
                                    }}
                                    disabled={formData.mobileVerified}
                                />
                                {!formData.mobileVerified ? (
                                    <button
                                        className={styles.verifyBtn}
                                        onClick={formData.mobileOtp?.length === 6 ? handleVerifyMobileOtp : handleSendMobileOtp}
                                        disabled={mobileOtpSending || mobileOtpVerifying || (mobileCountdown > 0 && !formData.mobileOtp)}
                                    >
                                        {mobileOtpSending ? 'Sending...' : mobileOtpVerifying ? 'Verifying...' : (formData.mobileOtp?.length === 6 ? 'Verify' : 'Send SMS')}
                                    </button>
                                ) : (
                                    <div className={styles.verifiedBadge}>
                                        <CheckCircle size={20} /> Verified
                                    </div>
                                )}
                            </div>
                            {mobileCountdown > 0 && !formData.mobileVerified && (
                                <p className={styles.resendText}>Resend available in {mobileCountdown}s</p>
                            )}
                            {mobileMessage.text && (
                                <p className={styles.statusMessage} style={{ color: mobileMessage.type === 'success' ? '#10b981' : '#ff4d4d' }}>
                                    {mobileMessage.text}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className={styles.stepContent}>

                        {/* CURRENT ADDRESS */}
                        <h4 className={styles.sectionTitle}>Current Address</h4>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Country *</label>
                                <input
                                    value={currentAddress.country}
                                    onChange={(e) =>
                                        setCurrentAddress({ ...currentAddress, country: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>State *</label>
                                <input
                                    value={currentAddress.state}
                                    onChange={(e) =>
                                        setCurrentAddress({ ...currentAddress, state: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>City *</label>
                                <input
                                    value={currentAddress.city}
                                    onChange={(e) =>
                                        setCurrentAddress({ ...currentAddress, city: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Office / Current Address *</label>
                                <textarea
                                    value={currentAddress.address}
                                    onChange={(e) =>
                                        setCurrentAddress({ ...currentAddress, address: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Pin Code *</label>
                                <input
                                    value={currentAddress.pincode}
                                    onChange={(e) =>
                                        setCurrentAddress({ ...currentAddress, pincode: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        {/* SAME AS CURRENT */}
                        <div className={styles.sameAddressRow}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={sameAsCurrent}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setSameAsCurrent(checked);
                                        if (checked) {
                                            setPermanentAddress(currentAddress);
                                        }
                                    }}
                                />
                                Same as current address
                            </label>
                        </div>

                        {/* PERMANENT ADDRESS */}
                        <h4 className={styles.sectionTitle}>Permanent Address</h4>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Country *</label>
                                <input
                                    value={permanentAddress.country}
                                    readOnly={sameAsCurrent}
                                    onChange={(e) =>
                                        setPermanentAddress({ ...permanentAddress, country: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>State *</label>
                                <input
                                    value={permanentAddress.state}
                                    readOnly={sameAsCurrent}
                                    onChange={(e) =>
                                        setPermanentAddress({ ...permanentAddress, state: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>City *</label>
                                <input
                                    value={permanentAddress.city}
                                    readOnly={sameAsCurrent}
                                    onChange={(e) =>
                                        setPermanentAddress({ ...permanentAddress, city: e.target.value })
                                    }
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label>Permanent Address *</label>
                                <textarea
                                    value={permanentAddress.address}
                                    readOnly={sameAsCurrent}
                                    onChange={(e) =>
                                        setPermanentAddress({ ...permanentAddress, address: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Pin Code *</label>
                                <input
                                    value={permanentAddress.pincode}
                                    readOnly={sameAsCurrent}
                                    onChange={(e) =>
                                        setPermanentAddress({ ...permanentAddress, pincode: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                    </div>
                );


            case 4:
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Category *</label>
                                <select
                                    value={formData.category || ''}
                                    onChange={(e) => updateFormData('category', e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    <option>Criminal</option>
                                    <option>Civil</option>
                                    <option>Family</option>
                                    <option>Corporate</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Specialization *</label>
                                <input
                                    value={formData.specialization || ''}
                                    onChange={(e) => updateFormData('specialization', e.target.value)}
                                    placeholder="e.g. Divorce, Property"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Sub Department *</label>
                                <input
                                    value={formData.subDepartment || ''}
                                    onChange={(e) => updateFormData('subDepartment', e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Consultation Mode *</label>
                                <select
                                    value={formData.mode || ''}
                                    onChange={(e) => updateFormData('mode', e.target.value)}
                                >
                                    <option value="">Select Mode</option>
                                    <option>Online</option>
                                    <option>Offline</option>
                                    <option>Both</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Advocate Type *</label>
                                <select
                                    value={formData.advocateType || ''}
                                    onChange={(e) => updateFormData('advocateType', e.target.value)}
                                >
                                    <option value="">Select Type</option>
                                    <option>Senior</option>
                                    <option>Junior</option>
                                    <option>Any</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Languages *</label>
                                <input
                                    value={formData.languages || ''}
                                    onChange={(e) => updateFormData('languages', e.target.value)}
                                    placeholder="e.g. English, Hindi"
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label>Brief Legal Issue *</label>
                                <textarea
                                    value={formData.issueDescription || ''}
                                    onChange={(e) => updateFormData('issueDescription', e.target.value)}
                                    placeholder="Describe your legal issue..."
                                />
                            </div>
                        </div>
                    </div>
                );


            case 5:
                return (
                    <div className={styles.stepContent}>

                        {/* Declaration 1 */}
                        <div className={styles.declarationBlock}>
                            <div className={styles.declarationContent}>
                                <h4>Declaration of Information Accuracy</h4>
                                <p>
                                    I hereby declare that all the information provided by me in this
                                    registration form is true, complete, and accurate to the best of my
                                    knowledge. I understand that providing false or misleading
                                    information may result in rejection of my registration or legal
                                    consequences as per applicable laws.
                                </p>
                                <p>
                                    I further confirm that I shall immediately notify the platform in
                                    case of any changes to the information provided above.
                                </p>
                            </div>

                            <label className={styles.checkboxRow}>
                                <input
                                    type="checkbox"
                                    checked={formData.declaration1 || false}
                                    onChange={(e) => updateFormData('declaration1', e.target.checked)}
                                />
                                I agree to the above declaration
                            </label>
                        </div>

                        {/* Declaration 2 */}
                        <div className={styles.declarationBlock}>
                            <div className={styles.declarationContent}>
                                <h4>BCI Compliance</h4>
                                <p>
                                    I acknowledge that I shall comply with all rules, regulations, and
                                    ethical standards prescribed by the Bar Council of India (BCI).
                                </p>
                                <p>
                                    I understand that any violation of BCI norms may lead to suspension
                                    or termination of my access to the platform.
                                </p>
                            </div>

                            <label className={styles.checkboxRow}>
                                <input
                                    type="checkbox"
                                    checked={formData.declaration2 || false}
                                    onChange={(e) => updateFormData('declaration2', e.target.checked)}
                                />
                                I agree to comply with BCI norms
                            </label>
                        </div>

                        {/* Declaration 3 */}
                        <div className={styles.declarationBlock}>
                            <div className={styles.declarationContent}>
                                <h4>Consent to Share Profile</h4>
                                <p>
                                    I hereby provide my explicit consent to share my profile information
                                    with relevant advocates, legal professionals, and authorized
                                    entities for the purpose of obtaining legal assistance.
                                </p>
                            </div>

                            <label className={styles.checkboxRow}>
                                <input
                                    type="checkbox"
                                    checked={formData.declaration3 || false}
                                    onChange={(e) => updateFormData('declaration3', e.target.checked)}
                                />
                                I consent to share my profile
                            </label>
                        </div>

                        {/* Signature Canvas */}
                        <div className={styles.formGroup}>
                            <label>Signature * <span style={{ fontSize: '12px', color: '#64748b' }}>(Draw your signature below)</span></label>
                            <div className={styles.signatureCanvasWrapper}>
                                <canvas
                                    ref={(canvas) => {
                                        if (canvas && !canvas.dataset.initialized) {
                                            canvas.dataset.initialized = 'true';
                                            const ctx = canvas.getContext('2d');
                                            if (ctx) {
                                                let isDrawing = false;
                                                let lastX = 0;
                                                let lastY = 0;

                                                canvas.width = canvas.offsetWidth;
                                                canvas.height = 150;

                                                // Set canvas background
                                                ctx.fillStyle = '#040404ff';
                                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                                ctx.strokeStyle = '#f7f3f3ff';
                                                ctx.lineWidth = 2;
                                                ctx.lineCap = 'round';

                                                const startDrawing = (e: any) => {
                                                    isDrawing = true;
                                                    const rect = canvas.getBoundingClientRect();
                                                    lastX = e.clientX - rect.left;
                                                    lastY = e.clientY - rect.top;
                                                };

                                                const draw = (e: any) => {
                                                    if (!isDrawing) return;
                                                    const rect = canvas.getBoundingClientRect();
                                                    const currentX = e.clientX - rect.left;
                                                    const currentY = e.clientY - rect.top;

                                                    ctx.beginPath();
                                                    ctx.moveTo(lastX, lastY);
                                                    ctx.lineTo(currentX, currentY);
                                                    ctx.stroke();

                                                    lastX = currentX;
                                                    lastY = currentY;

                                                    // Save signature as base64
                                                    updateFormData('signatureData', canvas.toDataURL());
                                                };

                                                const stopDrawing = () => {
                                                    if (isDrawing) {
                                                        isDrawing = false;
                                                        canvas.toBlob((blob) => {
                                                            if (blob) {
                                                                updateFormData('signature', blob);
                                                                updateFormData('signatureData', canvas.toDataURL());
                                                            }
                                                        }, 'image/png');
                                                    }
                                                };

                                                canvas.addEventListener('mousedown', startDrawing);
                                                canvas.addEventListener('mousemove', draw);
                                                canvas.addEventListener('mouseup', stopDrawing);
                                                canvas.addEventListener('mouseleave', stopDrawing);

                                                // Touch support
                                                canvas.addEventListener('touchstart', (e) => {
                                                    e.preventDefault();
                                                    const touch = e.touches[0];
                                                    const mouseEvent = new MouseEvent('mousedown', {
                                                        clientX: touch.clientX,
                                                        clientY: touch.clientY
                                                    });
                                                    canvas.dispatchEvent(mouseEvent);
                                                });

                                                canvas.addEventListener('touchmove', (e) => {
                                                    e.preventDefault();
                                                    const touch = e.touches[0];
                                                    const mouseEvent = new MouseEvent('mousemove', {
                                                        clientX: touch.clientX,
                                                        clientY: touch.clientY
                                                    });
                                                    canvas.dispatchEvent(mouseEvent);
                                                });

                                                canvas.addEventListener('touchend', (e) => {
                                                    e.preventDefault();
                                                    const mouseEvent = new MouseEvent('mouseup', {});
                                                    canvas.dispatchEvent(mouseEvent);
                                                });
                                            }
                                        }
                                    }}
                                    className={styles.signatureCanvas}
                                    style={{
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '8px',
                                        cursor: 'crosshair',
                                        width: '100%',
                                        height: '150px',
                                        backgroundColor: '#222222ff'
                                    }}
                                />
                                <button
                                    type="button"
                                    className={styles.clearSignatureBtn}
                                    onClick={(e) => {
                                        const canvas = e.currentTarget.previousElementSibling as HTMLCanvasElement;
                                        if (canvas) {
                                            const ctx = canvas.getContext('2d');
                                            if (ctx) {
                                                ctx.fillStyle = '#ffffff';
                                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                                updateFormData('signatureData', null);
                                            }
                                        }
                                    }}
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Clear Signature
                                </button>
                            </div>
                        </div>

                        {/* Date - Auto-filled with current date */}
                        <div className={styles.formGroup}>
                            <label>Date *</label>
                            <input
                                type="date"
                                value={new Date().toISOString().split('T')[0]}
                                readOnly
                                style={{
                                    backgroundColor: '#1e1e1eff',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </div>

                    </div>
                );



            default:
                return (
                    <div className={styles.placeholderContent}>
                        <h3>Step {currentStep}: {steps.find(s => s.id === currentStep)?.label}</h3>
                        <p>This part of the registration is coming soon...</p>
                    </div>
                );
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <motion.div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
            >
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>Client Registration</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />X
                    </button>
                </div>

                {/* Progress Tabs */}
                <div className={styles.tabsContainer}>
                    {steps.map(step => (
                        <div
                            key={step.id}
                            className={`${styles.tabItem} ${currentStep === step.id ? styles.activeTab : ''}`}
                            onClick={() => setCurrentStep(step.id)}
                        >
                            {step.label}
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className={styles.content}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Action */}
                <div className={styles.footer}>




                    <button
                        className={styles.nextBtn}
                        onClick={() => {
                            if (currentStep === 2) {
                                if (!formData.emailVerified && !formData.mobileVerified) {
                                    alert('Please verify both email and mobile before proceeding.');
                                    return;
                                }
                                if (!formData.emailVerified) {
                                    alert('Please verify your email via OTP before proceeding.');
                                    return;
                                }
                                if (!formData.mobileVerified) {
                                    alert('Please verify your mobile via SMS OTP before proceeding.');
                                    return;
                                }
                            }
                            currentStep < steps.length ? setCurrentStep((prev: number) => prev + 1) : handleSubmit()
                        }}
                    >
                        {currentStep === steps.length ? 'Submit Application' : 'Next Step'}
                    </button>

                </div>
            </motion.div>
        </div>
    );
};

export default ClientRegistration;
