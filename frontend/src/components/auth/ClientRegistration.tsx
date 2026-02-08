import React, { useState } from 'react';
import { X, CheckCircle, RefreshCcw, User, MapPin, Briefcase, ShieldCheck, Mail, Phone, Calendar, Globe, Clock, Layout, FileText } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ClientRegistration.module.css';
import { authService } from '../../services/api';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useAdminConfig } from '../../hooks/useAdminConfig';
import { LOCATION_DATA_RAW } from '../layout/statesdis';

interface ClientRegistrationProps {
    onClose: () => void;
}

const steps = [
    { id: 1, label: 'PERSONAL DETAILS' },
    { id: 2, label: 'VERIFICATION' },
    { id: 3, label: 'ADDRESS & LOCATION' },
    { id: 4, label: 'LEGAL HELP REQUIRED' },
    { id: 5, label: 'DECLARATIONS' },
    { id: 6, label: 'REVIEW' },
];

const stepMapping: Record<number, string> = {
    1: "Personal Information",
    2: "Verification Status",
    3: "Location",
    4: "Professional Practice",
    5: "Review & Submit",
    6: "Review & Submit"
};

const ClientRegistration: React.FC<ClientRegistrationProps> = ({ onClose }) => {
    const { isSectionEnabled, getOptions } = useAdminConfig('client');
    const visibleSteps = steps.filter(step => isSectionEnabled(stepMapping[step.id]));
    const [currentStep, setCurrentStep] = useState(visibleSteps.length > 0 ? visibleSteps[0].id : 1);
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
        profilePic: null,
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
        mobileVerified: true,
        captchaVerified: false
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
    const [registrationSuccess, setRegistrationSuccess] = useState<{ id: string } | null>(null);
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const validateStep = (stepId: number) => {
        const newErrors: Record<string, boolean> = {};

        if (stepId === 1) {
            ['firstName', 'lastName', 'gender', 'dob', 'mobile', 'email', 'password', 'documentType'].forEach(field => {
                if (!formData[field]) newErrors[field] = true;
            });
            if (!formData.document) newErrors['document'] = true;
            if (!formData.profilePic) newErrors['profilePic'] = true;
        } else if (stepId === 2) {
            if (!formData.emailVerified) newErrors['emailOtp'] = true;
            if (!formData.mobileVerified) newErrors['mobileOtp'] = true;
        } else if (stepId === 3) {
            if (!currentAddress.state) newErrors['currState'] = true;
            if (!currentAddress.district) newErrors['currDistrict'] = true;
            if (!currentAddress.city) newErrors['currCity'] = true;
            if (!currentAddress.pincode) newErrors['currPincode'] = true;

            if (!sameAsCurrent) {
                if (!permanentAddress.state) newErrors['permState'] = true;
                if (!permanentAddress.district) newErrors['permDistrict'] = true;
                if (!permanentAddress.city) newErrors['permCity'] = true;
                if (!permanentAddress.pincode) newErrors['permPincode'] = true;
            }
        } else if (stepId === 4) {
            ['category', 'specialization', 'subDepartment', 'mode', 'advocateType', 'languages', 'issueDescription'].forEach(field => {
                if (!formData[field]) newErrors[field] = true;
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
            const res = await (authService as any).sendOtp(formData.email, true);
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
        country: 'India',
        state: '',
        city: '',
        district: '',
        address: '',
        pincode: '',
    });

    const [permanentAddress, setPermanentAddress] = useState({
        country: 'India',
        state: '',
        city: '',
        district: '',
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
            submissionData.append('district', currentAddress.district);
            submissionData.append('city', currentAddress.city);
            submissionData.append('officeAddress', currentAddress.address);
            submissionData.append('pincode', currentAddress.pincode);

            // Permanent Address Details
            submissionData.append('permState', sameAsCurrent ? currentAddress.state : permanentAddress.state);
            submissionData.append('permDistrict', sameAsCurrent ? currentAddress.district : permanentAddress.district);
            submissionData.append('permCity', sameAsCurrent ? currentAddress.city : permanentAddress.city);
            submissionData.append('permanentAddress', sameAsCurrent ? currentAddress.address : permanentAddress.address);
            submissionData.append('permPincode', sameAsCurrent ? currentAddress.pincode : permanentAddress.pincode);

            // Files
            if (formData.document) {
                submissionData.append('uploaddocument', formData.document);
            }
            if (formData.profilePic) {
                submissionData.append('profilePic', formData.profilePic);
            }
            if (formData.signature) {
                submissionData.append('signature', formData.signature, 'signature.png');
            }

            const response = await authService.registerClient(submissionData);
            if (response.data.success) {
                setRegistrationSuccess({ id: response.data.clientId || '' });
            } else {
                alert('Registration failed: ' + (response.data.error || 'Unknown error'));
            }
        } catch (err: any) {
            console.error('Client Registration Error:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'An unknown error occurred';
            alert(errorMessage);
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
                                <input
                                    value={formData.firstName || ''}
                                    onChange={(e) => updateFormData('firstName', e.target.value)}
                                    className={errors.firstName ? styles.inputError : ''}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Last Name *</label>
                                <input value={formData.lastName || ''} onChange={(e) => updateFormData('lastName', e.target.value)} className={errors.lastName ? styles.inputError : ''} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Gender *</label>
                                <select value={formData.gender || ''} onChange={(e) => updateFormData('gender', e.target.value)} className={errors.gender ? styles.inputError : ''}>
                                    <option value="">Select Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Date of Birth *</label>
                                <input type="date" value={formData.dob || ''} onChange={(e) => updateFormData('dob', e.target.value)} className={errors.dob ? styles.inputError : ''} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mobile *</label>
                                <input value={formData.mobile || ''} onChange={(e) => updateFormData('mobile', e.target.value)} className={errors.mobile ? styles.inputError : ''} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email *</label>
                                <input value={formData.email || ''} onChange={(e) => updateFormData('email', e.target.value)} className={errors.email ? styles.inputError : ''} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Password *</label>
                                <input type="password" value={formData.password || ''} onChange={(e) => updateFormData('password', e.target.value)} className={errors.password ? styles.inputError : ''} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Document Type *</label>
                                <select
                                    value={formData.documentType || ''}
                                    onChange={(e) => updateFormData('documentType', e.target.value)}
                                    className={errors.documentType ? styles.inputError : ''}
                                >
                                    <option value="">Select Document</option>
                                    <option>Aadhar</option>
                                    <option>PAN</option>
                                    <option>Voter</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Upload ID Proof * <span className={styles.fileHint}>(JPG, PNG, PDF | Max 5MB)</span></label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
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
                                            updateFormData('document', file);
                                        }
                                    }}
                                    className={errors.document ? styles.inputError : ''}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Upload Profile Photo * <span className={styles.fileHint}>(JPG, PNG | Max 5MB)</span></label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const allowedTypes = ['image/jpeg', 'image/png'];
                                            if (!allowedTypes.includes(file.type)) {
                                                alert('Invalid file type. Please upload JPG or PNG.');
                                                e.target.value = '';
                                                return;
                                            }
                                            if (file.size > 5 * 1024 * 1024) {
                                                alert('File size exceeds 5MB limit.');
                                                e.target.value = '';
                                                return;
                                            }
                                            updateFormData('profilePic', file);
                                        }
                                    }}
                                    className={errors.profilePic ? styles.inputError : ''}
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

                        {/* Mobile Verification (Firebase) - Hidden as per request */}
                        {/* 
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
                        */}
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
                                    readOnly
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>State *</label>
                                <select
                                    value={currentAddress.state}
                                    className={errors.currState ? styles.inputError : ''}
                                    onChange={(e) => {
                                        const newState = e.target.value;
                                        setCurrentAddress({ ...currentAddress, state: newState, district: '', city: '' });
                                        if (sameAsCurrent) {
                                            setPermanentAddress(prev => ({ ...prev, state: newState, district: '', city: '' }));
                                        }
                                    }}
                                >
                                    <option value="">Select State</option>
                                    {Object.keys(LOCATION_DATA_RAW).sort().map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>District *</label>
                                <select
                                    value={currentAddress.district}
                                    disabled={!currentAddress.state}
                                    className={errors.currDistrict ? styles.inputError : ''}
                                    onChange={(e) => {
                                        const newDist = e.target.value;
                                        setCurrentAddress({ ...currentAddress, district: newDist, city: '' });
                                        if (sameAsCurrent) {
                                            setPermanentAddress(prev => ({ ...prev, district: newDist, city: '' }));
                                        }
                                    }}
                                >
                                    <option value="">Select District</option>
                                    {currentAddress.state && Object.keys(LOCATION_DATA_RAW[currentAddress.state] || {}).sort().map(dist => (
                                        <option key={dist} value={dist}>{dist}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>City / Town *</label>
                                <select
                                    value={currentAddress.city}
                                    disabled={!currentAddress.district}
                                    className={errors.currCity ? styles.inputError : ''}
                                    onChange={(e) => {
                                        const newCity = e.target.value;
                                        setCurrentAddress({ ...currentAddress, city: newCity });
                                        if (sameAsCurrent) {
                                            setPermanentAddress(prev => ({ ...prev, city: newCity }));
                                        }
                                    }}
                                >
                                    <option value="">Select City</option>
                                    {currentAddress.state && currentAddress.district &&
                                        (LOCATION_DATA_RAW[currentAddress.state][currentAddress.district] || []).sort().map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Pin Code *</label>
                                <input
                                    value={currentAddress.pincode}
                                    className={errors.currPincode ? styles.inputError : ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCurrentAddress({ ...currentAddress, pincode: val });
                                        if (sameAsCurrent) {
                                            setPermanentAddress(prev => ({ ...prev, pincode: val }));
                                        }
                                    }}
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label>Current Address *</label>
                                <textarea
                                    value={currentAddress.address}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCurrentAddress({ ...currentAddress, address: val });
                                        if (sameAsCurrent) {
                                            setPermanentAddress(prev => ({ ...prev, address: val }));
                                        }
                                    }}
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
                                            setPermanentAddress({ ...currentAddress });
                                        }
                                    }}
                                />
                                Same as current address
                            </label>
                        </div>

                        {/* PERMANENT ADDRESS */}
                        {!sameAsCurrent && (
                            <>
                                <h4 className={styles.sectionTitle}>Permanent Address</h4>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Country *</label>
                                        <input
                                            value={permanentAddress.country}
                                            readOnly
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>State *</label>
                                        <select
                                            value={permanentAddress.state}
                                            onChange={(e) => {
                                                const newState = e.target.value;
                                                setPermanentAddress({ ...permanentAddress, state: newState, district: '', city: '' });
                                            }}
                                        >
                                            <option value="">Select State</option>
                                            {Object.keys(LOCATION_DATA_RAW).sort().map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>District *</label>
                                        <select
                                            value={permanentAddress.district}
                                            disabled={!permanentAddress.state}
                                            onChange={(e) => {
                                                const newDist = e.target.value;
                                                setPermanentAddress({ ...permanentAddress, district: newDist, city: '' });
                                            }}
                                        >
                                            <option value="">Select District</option>
                                            {permanentAddress.state && Object.keys(LOCATION_DATA_RAW[permanentAddress.state] || {}).sort().map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>City / Town *</label>
                                        <select
                                            value={permanentAddress.city}
                                            disabled={!permanentAddress.district}
                                            onChange={(e) => {
                                                const newCity = e.target.value;
                                                setPermanentAddress({ ...permanentAddress, city: newCity });
                                            }}
                                        >
                                            <option value="">Select City</option>
                                            {permanentAddress.state && permanentAddress.district &&
                                                (LOCATION_DATA_RAW[permanentAddress.state][permanentAddress.district] || []).sort().map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Pin Code *</label>
                                        <input
                                            value={permanentAddress.pincode}
                                            onChange={(e) => setPermanentAddress({ ...permanentAddress, pincode: e.target.value })}
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label>Permanent Address *</label>
                                        <textarea
                                            value={permanentAddress.address}
                                            onChange={(e) => setPermanentAddress({ ...permanentAddress, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

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
                                    className={errors.category ? styles.inputError : ''}
                                >
                                    <option value="">Select Category</option>
                                    {getOptions('specialization').map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Specialization *</label>
                                <select
                                    value={formData.specialization || ''}
                                    className={errors.specialization ? styles.inputError : ''}
                                    onChange={(e) => {
                                        updateFormData('specialization', e.target.value);
                                        updateFormData('subDepartment', ''); // Reset sub-dept on change
                                    }}
                                >
                                    <option value="">Select Specialization</option>
                                    {getOptions('specialization').map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Sub Department *</label>
                                <select
                                    value={formData.subDepartment || ''}
                                    onChange={(e) => updateFormData('subDepartment', e.target.value)}
                                    className={errors.subDepartment ? styles.inputError : ''}
                                >
                                    <option value="">Select Sub Department</option>
                                    {(getOptions('sub_department') as any[])
                                        .filter(opt => !formData.specialization || opt.parent === formData.specialization)
                                        .map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Consultation Mode *</label>
                                <select
                                    value={formData.mode || ''}
                                    onChange={(e) => updateFormData('mode', e.target.value)}
                                    className={errors.mode ? styles.inputError : ''}
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
                                    className={errors.advocateType ? styles.inputError : ''}
                                >
                                    <option value="">Select Type</option>
                                    <option>Senior</option>
                                    <option>Junior</option>
                                    <option>Any</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Languages *</label>
                                <div className={styles.languageSelectWrapper}>
                                    <select
                                        className={styles.selectInput}
                                        onChange={(e) => {
                                            const selectedLang = e.target.value;
                                            if (!selectedLang) return;

                                            const currentLangs = (formData.languages || '').split(',').filter((l: string) => l.trim());
                                            if (!currentLangs.includes(selectedLang)) {
                                                const newLangs = [...currentLangs, selectedLang];
                                                updateFormData('languages', newLangs.join(','));
                                            }
                                            e.target.value = ''; // Reset select
                                        }}
                                    >
                                        <option value="">Select Language</option>
                                        {getOptions('language').map((lang) => (
                                            <option key={lang.id} value={lang.label}>
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Selected Languages Chips */}
                                <div className={styles.languageChips} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                    {(formData.languages || '').split(',').filter((l: string) => l.trim()).map((lang: string, index: number) => (
                                        <span key={index} style={{
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            padding: '4px 10px',
                                            borderRadius: '16px',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            {lang}
                                            <X size={14} style={{ cursor: 'pointer' }} onClick={() => {
                                                const currentLangs = (formData.languages || '').split(',').filter((l: string) => l.trim());
                                                const newLangs = currentLangs.filter((l: string) => l !== lang);
                                                updateFormData('languages', newLangs.join(','));
                                            }} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label>Brief Legal Issue *</label>
                                <textarea
                                    value={formData.issueDescription || ''}
                                    className={errors.issueDescription ? styles.inputError : ''}
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

                            <label className={`${styles.checkboxRow} ${errors.declaration1 ? styles.inputError : ''}`}>
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

                            <label className={`${styles.checkboxRow} ${errors.declaration2 ? styles.inputError : ''}`}>
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

                            <label className={`${styles.checkboxRow} ${errors.declaration3 ? styles.inputError : ''}`}>
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
                                    className={`${styles.signatureCanvas} ${errors.signature ? styles.inputError : ''}`}
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

                        {/* CAPTCHA VERIFICATION */}
                        <div className={styles.formGroup} style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                            <label style={{ fontSize: '16px', color: '#daa520', marginBottom: '15px', display: 'block' }}>🛡️ Security Verification</label>
                            <div className={styles.captchaContainer}>
                                <div className={styles.captchaBox}>
                                    <span className={styles.captchaText}>LEX-CLIENT-88</span>
                                </div>
                                <div className={styles.captchaInputGroup}>
                                    <input
                                        type="text"
                                        placeholder="Type Code Above"
                                        className={`${styles.captchaInput} ${errors.captchaVerified ? styles.inputError : ''}`}
                                        style={{
                                            backgroundColor: '#1a1a1aff',
                                            border: '1px solid #333',
                                            color: '#fff',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            width: '200px'
                                        }}
                                        onChange={(e) => {
                                            if (e.target.value.toUpperCase() === 'LEX-CLIENT-88') {
                                                updateFormData('captchaVerified', true);
                                            } else {
                                                updateFormData('captchaVerified', false);
                                            }
                                        }}
                                    />
                                    {formData.captchaVerified && <span style={{ color: '#10b981', fontWeight: 'bold' }}>✔ Verified</span>}
                                </div>
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



            case 6:
                return (
                    <div className={styles.reviewContainer}>
                        <div className={styles.reviewSection}>
                            <div className={styles.reviewSectionHeader}>
                                <User size={20} color="#fbbf24" />
                                <h4>Personal Details</h4>
                            </div>
                            <div className={styles.reviewGrid}>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Full Name</span>
                                    <span className={styles.reviewValue}>{formData.firstName} {formData.lastName || 'N/A'}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Email Address</span>
                                    <span className={styles.reviewValue}><Mail size={14} style={{ marginRight: 6 }} />{formData.email || 'N/A'}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Phone Number</span>
                                    <span className={styles.reviewValue}><Phone size={14} style={{ marginRight: 6 }} />{formData.mobile || 'N/A'}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Date of Birth</span>
                                    <span className={styles.reviewValue}><Calendar size={14} style={{ marginRight: 6 }} />{formData.dob || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.reviewSection}>
                            <div className={styles.reviewSectionHeader}>
                                <MapPin size={20} color="#fbbf24" />
                                <h4>Address Information</h4>
                            </div>
                            <div className={styles.reviewGrid}>
                                <div className={styles.addressBlock}>
                                    <span className={styles.reviewLabel}>Current Address</span>
                                    <span className={styles.reviewValue}>
                                        {currentAddress.address}, {currentAddress.city}, {currentAddress.state} - {currentAddress.pincode}
                                    </span>
                                </div>
                                <div className={styles.addressBlock}>
                                    <span className={styles.reviewLabel}>Permanent Address</span>
                                    <span className={styles.reviewValue}>
                                        {sameAsCurrent ? 'Same as Current Address' : `${permanentAddress.address}, ${permanentAddress.city}, ${permanentAddress.state} - ${permanentAddress.pincode}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.reviewSection}>
                            <div className={styles.reviewSectionHeader}>
                                <Briefcase size={20} color="#fbbf24" />
                                <h4>Legal Assistance Required</h4>
                            </div>
                            <div className={styles.reviewGrid}>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Category</span>
                                    <span className={styles.reviewValue}>{formData.category || 'N/A'}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Specialization</span>
                                    <span className={styles.reviewValue}>{formData.specialization || 'N/A'}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Sub-Department</span>
                                    <span className={styles.reviewValue}>{formData.subDepartment || 'N/A'}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Consultation Mode</span>
                                    <span className={styles.reviewValue}><Clock size={14} style={{ marginRight: 6 }} />{formData.mode || 'N/A'}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Advocate Type</span>
                                    <span className={styles.reviewValue}><ShieldCheck size={14} style={{ marginRight: 6 }} />{formData.advocateType || 'N/A'}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Languages</span>
                                    <span className={styles.reviewValue}><Globe size={14} style={{ marginRight: 6 }} />{formData.languages || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.reviewSection}>
                            <div className={styles.reviewSectionHeader}>
                                <ShieldCheck size={20} color="#fbbf24" />
                                <h4>Verification Status</h4>
                            </div>
                            <div className={styles.reviewGrid}>
                                <div className={styles.statusCard}>
                                    <span className={styles.reviewLabel}>Email Verification</span>
                                    <span className={`${styles.badge} ${formData.emailVerified ? styles.badgeSuccess : styles.badgeError}`}>
                                        {formData.emailVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                <div className={styles.statusCard}>
                                    <span className={styles.reviewLabel}>Mobile Verification</span>
                                    <span className={`${styles.badge} ${formData.mobileVerified ? styles.badgeSuccess : styles.badgeError}`}>
                                        {formData.mobileVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                <div className={styles.statusCard}>
                                    <span className={styles.reviewLabel}>Captcha Status</span>
                                    <span className={`${styles.badge} ${formData.captchaVerified ? styles.badgeSuccess : styles.badgeError}`}>
                                        {formData.captchaVerified ? 'Completed' : 'Not Done'}
                                    </span>
                                </div>
                            </div>
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

    const handleClose = () => {
        if (registrationSuccess) {
            onClose();
            return;
        }
        if (window.confirm("Are you sure you want to cancel the registration process? All progress will be lost.")) {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <motion.div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
            >
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <FileText className={styles.hammerIcon} size={28} />
                        <div>
                            <h1>CLIENT REGISTRATION</h1>
                            <p>FIND THE BEST LEGAL ASSISTANCE FOR YOUR NEEDS</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Tabs */}
                <div className={styles.tabsContainer}>
                    {visibleSteps.map(step => (
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

                <div className={styles.footer}>
                    <button
                        className={styles.nextBtn}
                        onClick={() => {
                            // Find current index in visible steps
                            const currentIndex = visibleSteps.findIndex(s => s.id === currentStep);
                            const isLastStep = currentIndex === visibleSteps.length - 1;

                            if (!validateStep(currentStep)) {
                                alert('Please fill all highlighted required fields.');
                                return;
                            }

                            // Validation Specific to Steps (by ID)
                            if (currentStep === 2) {
                                if (!formData.emailVerified) {
                                    alert('Please verify your email via OTP before proceeding.');
                                    return;
                                }
                                if (!formData.mobileVerified) {
                                    alert('Please verify your mobile via SMS OTP before proceeding.');
                                    return;
                                }
                            }

                            if (isLastStep) {
                                const newErrors: Record<string, boolean> = {};
                                let hasError = false;

                                if (!formData.captchaVerified) { newErrors['captchaVerified'] = true; hasError = true; }
                                if (!formData.declaration1) { newErrors['declaration1'] = true; hasError = true; }
                                if (!formData.declaration2) { newErrors['declaration2'] = true; hasError = true; }
                                if (!formData.declaration3) { newErrors['declaration3'] = true; hasError = true; }
                                if (!formData.signature) { newErrors['signature'] = true; hasError = true; }

                                if (hasError) {
                                    setErrors(newErrors);
                                    alert('Please agree to all declarations, provide signature, and verify captcha.');
                                    return;
                                }
                                handleSubmit();
                            } else {
                                setCurrentStep(visibleSteps[currentIndex + 1].id);
                            }
                        }}
                    >
                        {visibleSteps.findIndex(s => s.id === currentStep) === visibleSteps.length - 1 ? 'Submit Application' : 'Next Step'}
                    </button>
                </div>

                {/* SUCCESS NOTIFICATION OVERLAY */}
                <AnimatePresence>
                    {registrationSuccess && (
                        <motion.div
                            className={styles.successOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className={styles.successCard}
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                            >
                                <div className={styles.successIconBox}>
                                    <CheckCircle size={60} color="#10b981" />
                                </div>
                                <h2 className={styles.successTitle}>Registration Complete!</h2>
                                <p className={styles.successText}>
                                    Thank you for registering with e-Advocate.
                                </p>

                                <div className={styles.idDisplayBox}>
                                    <span className={styles.idLabel}>YOUR CLIENT ID:</span>
                                    <h3 className={styles.generatedId}>{registrationSuccess.id}</h3>
                                </div>

                                <div className={styles.verificationNote}>
                                    <ShieldCheck size={20} className={styles.noteIcon} />
                                    <p>Your application is under verification. Please wait for <strong>12-24 hours</strong>. You will receive an email with your account details shortly.</p>
                                </div>

                                <button
                                    className={styles.finishBtn}
                                    onClick={onClose}
                                >
                                    Go to Homepage
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div >
        </div >
    );
};

export default ClientRegistration;
