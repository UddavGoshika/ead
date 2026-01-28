import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
}

const Step3Password: React.FC<StepProps> = ({ formData, updateFormData }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
                <Lock size={20} />
                <h3>Account Security</h3>
            </div>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>PASSWORD <span className={styles.required}>*</span></label>
                    <div className={styles.inputIconWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Min 8 characters"
                            value={formData.password || ''}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>CONFIRM PASSWORD <span className={styles.required}>*</span></label>
                    <div className={styles.inputIconWrapper}>
                        <input
                            type={showConfirm ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Re-enter password"
                            value={formData.confirmPassword || ''}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => setShowConfirm(!showConfirm)}
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            </div>
            <div className={styles.passwordRules}>
                <p>Password must include:</p>
                <ul>
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One number & one special character</li>
                </ul>
            </div>
        </div>
    );
};

export default Step3Password;
