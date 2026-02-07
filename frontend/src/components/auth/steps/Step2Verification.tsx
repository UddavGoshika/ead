import React from 'react';
import { FileCheck, CheckCircle, RefreshCcw, Smartphone } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';
import { authService } from '../../../services/api';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../../firebase';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
    errors?: Record<string, boolean>;
}

const Step2Verification: React.FC<StepProps> = ({ formData, updateFormData, errors }) => {
    const [sending, setSending] = React.useState(false);
    const [verifying, setVerifying] = React.useState(false);
    const [countdown, setCountdown] = React.useState(0);
    const [emailMessage, setEmailMessage] = React.useState({ text: '', type: '' });

    // Mobile OTP States
    const [mobileSending, setMobileSending] = React.useState(false);
    const [mobileVerifying, setMobileVerifying] = React.useState(false);
    const [mobileCountdown, setMobileCountdown] = React.useState(0);
    const [mobileMessage, setMobileMessage] = React.useState({ text: '', type: '' });
    const [confirmationResult, setConfirmationResult] = React.useState<any>(null);

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
            setEmailMessage({ text: 'Please enter email in Step 1 first.', type: 'error' });
            return;
        }

        setSending(true);
        setEmailMessage({ text: '', type: '' });
        try {
            const res = await (authService as any).sendOtp(formData.email);
            if (res.data.success) {
                setEmailMessage({ text: 'OTP sent to your email.', type: 'success' });
                setCountdown(60);
            } else {
                setEmailMessage({ text: res.data.error || 'Failed to send OTP.', type: 'error' });
            }
        } catch (err: any) {
            setEmailMessage({ text: err.response?.data?.error || 'Connection error.', type: 'error' });
        } finally {
            setSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!formData.emailOtp || formData.emailOtp.length !== 6) {
            setEmailMessage({ text: 'Enter 6-digit OTP.', type: 'error' });
            return;
        }

        setVerifying(true);
        setEmailMessage({ text: '', type: '' });
        try {
            const res = await (authService as any).verifyOtp(formData.email, formData.emailOtp);
            if (res.data.success) {
                setEmailMessage({ text: 'Email verified successfully!', type: 'success' });
                updateFormData({ emailVerified: true });
            } else {
                setEmailMessage({ text: res.data.error || 'Invalid OTP.', type: 'error' });
            }
        } catch (err: any) {
            setEmailMessage({ text: err.response?.data?.error || 'Verification failed.', type: 'error' });
        } finally {
            setVerifying(false);
        }
    };

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    console.log('reCAPTCHA verified');
                },
                'expired-callback': () => {
                    console.log('reCAPTCHA expired');
                }
            });
        }
    };

    const handleSendMobileOtp = async () => {
        console.log('Original phone number:', formData.mobile);

        if (!formData.mobile) {
            setMobileMessage({ text: 'Please enter mobile in Step 1 first.', type: 'error' });
            return;
        }

        setMobileSending(true);
        setMobileMessage({ text: '', type: '' });
        try {
            setupRecaptcha();
            const appVerifier = (window as any).recaptchaVerifier;

            // Robust Sanitization for E.164
            let rawMobile = String(formData.mobile).trim();

            // 1. Remove all non-digit and non-plus characters (e.g., spaces, hyphens, brackets)
            let cleaned = rawMobile.replace(/[^0-9+]/g, "");

            // 2. Handle missing country code for India (10 digits)
            // If it's exactly 10 digits, assume +91
            if (/^\d{10}$/.test(cleaned)) {
                cleaned = '+91' + cleaned;
            }

            // 3. If it starts with '91' and is 12 digits, prepend '+'
            if (/^91\d{10}$/.test(cleaned)) {
                cleaned = '+' + cleaned;
            }

            // 4. Final check: Must start with '+' and have sufficient length
            if (!cleaned.startsWith('+')) {
                // If arguably it's a number without country code but not 10 digits (e.g. 11), prompt user
                // But for now, let's try assuming it's a valid number that needs a + if missing
                cleaned = '+' + cleaned;
            }

            console.log('Formatted phone number for Firebase:', cleaned);

            const confirmation = await signInWithPhoneNumber(auth, cleaned, appVerifier);
            setConfirmationResult(confirmation);
            setMobileMessage({ text: 'OTP sent successfully via SMS.', type: 'success' });
            setMobileCountdown(60);
        } catch (err: any) {
            console.error('Firebase Auth Error:', err);
            setMobileMessage({ text: 'Error sending SMS: ' + (err.message || 'Check configuration'), type: 'error' });

            // Reset Recaptcha on error so user can try again
            if ((window as any).recaptchaVerifier) {
                try {
                    (window as any).recaptchaVerifier.clear();
                } catch (e) { console.error(e); }
                (window as any).recaptchaVerifier = null;
                // Re-remove the recaptcha container if needed, or it might duplicate
                const container = document.getElementById('recaptcha-container');
                if (container) container.innerHTML = '';
            }
        } finally {
            setMobileSending(false);
        }
    };

    const handleVerifyMobileOtp = async () => {
        if (!formData.phoneOtp || formData.phoneOtp.length !== 6) {
            setMobileMessage({ text: 'Enter 6-digit OTP.', type: 'error' });
            return;
        }
        if (!confirmationResult) {
            setMobileMessage({ text: 'Please send OTP first.', type: 'error' });
            return;
        }

        setMobileVerifying(true);
        setMobileMessage({ text: '', type: '' });
        try {
            await confirmationResult.confirm(formData.phoneOtp);
            setMobileMessage({ text: 'Mobile verified successfully!', type: 'success' });
            updateFormData({ mobileVerified: true });
        } catch (err: any) {
            console.error('Mobile verification error:', err);
            setMobileMessage({ text: 'Invalid Mobile OTP.', type: 'error' });
        } finally {
            setMobileVerifying(false);
        }
    };

    const handleEmailOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (/^\d{0,6}$/.test(value)) {
            updateFormData({ emailOtp: value });
        }
    };

    const handlePhoneOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (/^\d{0,6}$/.test(value)) {
            updateFormData({ phoneOtp: value });
        }
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
                <FileCheck size={20} />
                <h3>Verification</h3>
            </div>

            <div id="recaptcha-container"></div>

            <div className={styles.formGrid}>
                {/* Email OTP */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>
                        EMAIL OTP <span className={styles.required}>*</span>
                        {formData.email && <span style={{ textTransform: 'none', marginLeft: '10px', color: '#64748b' }}>({formData.email})</span>}
                    </label>
                    <div className={styles.otpInputWrapper}>
                        <input
                            type="text"
                            placeholder="Enter 6-digit Email OTP"
                            value={formData.emailOtp || ''}
                            onChange={handleEmailOtpChange}
                            maxLength={6}
                            disabled={formData.emailVerified}
                            className={errors?.emailOtp ? styles.inputError : ''}
                        />
                        {!formData.emailVerified ? (
                            <button
                                className={styles.verifyBtn}
                                onClick={formData.emailOtp?.length === 6 ? handleVerifyOtp : handleSendOtp}
                                disabled={sending || verifying || (countdown > 0 && !formData.emailOtp)}
                            >
                                {sending ? 'Sending...' : verifying ? 'Verifying...' : (formData.emailOtp?.length === 6 ? 'Verify OTP' : 'Send OTP')}
                            </button>
                        ) : (
                            <div className={styles.verifiedBadge}>
                                <CheckCircle size={18} /> Verified
                            </div>
                        )}
                    </div>
                    {emailMessage.text && (
                        <p style={{ color: emailMessage.type === 'success' ? '#10b981' : '#ff4d4d', fontSize: '0.8rem', marginTop: '5px' }}>
                            {emailMessage.text}
                        </p>
                    )}
                </div>

                {/* Mobile OTP */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Smartphone size={14} />
                        MOBILE OTP <span className={styles.required}></span>
                        {formData.mobile && <span style={{ textTransform: 'none', marginLeft: '10px', color: '#64748b' }}>({formData.mobile})</span>}
                    </label>
                    <div className={styles.otpInputWrapper}>
                        <input
                            type="text"
                            placeholder="Enter 6-digit Mobile OTP"
                            value={formData.phoneOtp || ''}
                            onChange={handlePhoneOtpChange}
                            maxLength={6}
                            disabled={formData.mobileVerified}
                            className={errors?.phoneOtp ? styles.inputError : ''}
                        />
                        {!formData.mobileVerified ? (
                            <button
                                className={styles.verifyBtn}
                                onClick={formData.phoneOtp?.length === 6 ? handleVerifyMobileOtp : handleSendMobileOtp}
                                disabled={mobileSending || mobileVerifying || (mobileCountdown > 0 && !formData.phoneOtp)}
                            >
                                {mobileSending ? 'Sending...' : mobileVerifying ? 'Verifying...' : (formData.phoneOtp?.length === 6 ? 'Verify' : 'Send SMS')}
                            </button>
                        ) : (
                            <div className={styles.verifiedBadge}>
                                <CheckCircle size={18} /> Verified
                            </div>
                        )}
                    </div>
                    {mobileMessage.text && (
                        <p style={{ color: mobileMessage.type === 'success' ? '#10b981' : '#ff4d4d', fontSize: '0.8rem', marginTop: '5px' }}>
                            {mobileMessage.text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step2Verification;

