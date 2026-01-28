import React from 'react';
import { FileCheck, CheckCircle, RefreshCcw } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';
import { authService } from '../../../services/api';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
}

const Step2Verification: React.FC<StepProps> = ({ formData, updateFormData }) => {
    const [sending, setSending] = React.useState(false);
    const [verifying, setVerifying] = React.useState(false);
    const [countdown, setCountdown] = React.useState(0);
    const [message, setMessage] = React.useState({ text: '', type: '' });

    React.useEffect(() => {
        let timer: any;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendOtp = async () => {
        if (!formData.email) {
            setMessage({ text: 'Please enter email in Step 1 first.', type: 'error' });
            return;
        }

        setSending(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await (authService as any).sendOtp(formData.email);
            if (res.data.success) {
                setMessage({ text: 'OTP sent to your email.', type: 'success' });
                setCountdown(60);
            } else {
                setMessage({ text: res.data.error || 'Failed to send OTP.', type: 'error' });
            }
        } catch (err: any) {
            setMessage({ text: err.response?.data?.error || 'Connection error.', type: 'error' });
        } finally {
            setSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!formData.emailOtp || formData.emailOtp.length !== 6) {
            setMessage({ text: 'Enter 6-digit OTP.', type: 'error' });
            return;
        }

        setVerifying(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await (authService as any).verifyOtp(formData.email, formData.emailOtp);
            if (res.data.success) {
                setMessage({ text: 'Email verified successfully!', type: 'success' });
                updateFormData({ emailVerified: true });
            } else {
                setMessage({ text: res.data.error || 'Invalid OTP.', type: 'error' });
            }
        } catch (err: any) {
            setMessage({ text: err.response?.data?.error || 'Verification failed.', type: 'error' });
        } finally {
            setVerifying(false);
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (/^\d{0,6}$/.test(value)) {
            updateFormData({ emailOtp: value });
        }
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
                <FileCheck size={20} />
                <h3>Verification</h3>
            </div>

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
                            name="emailOtp"
                            placeholder="Enter 6-digit Email OTP"
                            value={formData.emailOtp || ''}
                            onChange={handleOtpChange}
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            disabled={formData.emailVerified}
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

                    {countdown > 0 && !formData.emailVerified && (
                        <p className={styles.resendText}>
                            Resend available in {countdown}s
                        </p>
                    )}
                    {countdown === 0 && !formData.emailVerified && formData.email && (
                        <button
                            className={styles.resendLink}
                            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                            onClick={handleSendOtp}
                            disabled={sending}
                        >
                            <RefreshCcw size={12} style={{ marginRight: '4px' }} /> Resend OTP
                        </button>
                    )}

                    {message.text && (
                        <p style={{
                            color: message.type === 'success' ? '#10b981' : '#ff4d4d',
                            fontSize: '0.85rem',
                            marginTop: '8px',
                            fontWeight: 500
                        }}>
                            {message.text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step2Verification;
