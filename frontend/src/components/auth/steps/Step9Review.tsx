import React, { useEffect, useRef, useState } from 'react';
import { ClipboardList, PenTool } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
    onSubmit: () => void;
    errors?: Record<string, boolean>;
}

const ReviewRow = ({ label, value }: { label: string; value?: any }) => (
    <div className={styles.reviewRow}>
        <span className={styles.reviewLabel}>{label}</span>
        <span className={styles.reviewValue}>{value || '-'}</span>
    </div>
);

const Step9Review: React.FC<StepProps> = ({ formData, updateFormData, onSubmit, errors }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [termsUnlocked, setTermsUnlocked] = useState(false);

    /* ================= SIGNATURE ================= */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.offsetWidth;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
        }
    }, []);

    const start = (e: React.MouseEvent) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setDrawing(true);
    };

    const draw = (e: React.MouseEvent) => {
        if (!drawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
    };

    const stop = () => {
        if (!drawing) return;
        setDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.toBlob((blob) => {
                if (blob) {
                    updateFormData({
                        signature: blob,
                        signatureProvided: true,
                        signatureDate: new Date().toISOString()
                    });
                }
            }, 'image/png');
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateFormData({
                signature: null,
                signatureProvided: false
            });
        }
    };

    /* ================= TERMS ================= */
    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
            setTermsUnlocked(true);
        }
    };

    const canSubmit =
        formData.terms1 &&
        formData.terms2 &&
        formData.terms3 &&
        formData.terms4 &&
        formData.signatureProvided &&
        formData.signatureDate;

    return (
        <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
                <ClipboardList size={18} />
                <h3>Review & Submit</h3>
            </div>

            {/* ========== PERSONAL ========= */}
            <div className={styles.reviewSection}>
                <h4>Personal Details</h4>
                <ReviewRow label="Name" value={`${formData.firstName} ${formData.lastName}`} />
                <ReviewRow label="Gender" value={formData.gender} />
                <ReviewRow label="DOB" value={formData.dob} />
                <ReviewRow label="Mobile" value={formData.mobile} />
                <ReviewRow label="Email" value={formData.email} />
                <ReviewRow label="ID Proof Type" value={formData.idProofType} />
            </div>

            {/* ========== EDUCATION ========= */}
            <div className={styles.reviewSection}>
                <h4>Educational Details</h4>
                <ReviewRow label="Degree" value={formData.degree} />
                <ReviewRow label="University" value={formData.university} />
                <ReviewRow label="College" value={formData.college} />
                <ReviewRow label="Graduation Year" value={formData.passingYear} />
                <ReviewRow label="Enrollment No" value={formData.enrollmentNumber} />
            </div>

            {/* ========== PRACTICE ========= */}
            <div className={styles.reviewSection}>
                <h4>Practice Information</h4>
                <ReviewRow label="Court" value={formData.courtOfPractice} />
                <ReviewRow label="Experience" value={formData.experienceRange} />
                <ReviewRow label="Specialization" value={formData.specialization} />
                <ReviewRow label="Sub-Specialization" value={formData.subSpecialization} />
                <ReviewRow label="Bar Association" value={formData.barAssociation} />
            </div>

            {/* ========== LOCATION ========= */}
            <div className={styles.reviewSection}>
                <h4>Location Details</h4>
                <ReviewRow label="State" value={formData.currState} />
                <ReviewRow label="City" value={formData.currCity} />
                <ReviewRow label="Current Address" value={formData.currAddress} />
                <ReviewRow label="Permanent Address" value={formData.sameAsCurrent ? 'Same as Current' : formData.permAddress} />
                <ReviewRow label="Pincode" value={formData.currPincode} />
            </div>

            {/* ========== CAREER ========= */}
            <div className={styles.reviewSection}>
                <h4>Career Information</h4>
                <ReviewRow label="Firm" value={formData.currentFirm} />
                <ReviewRow label="Position" value={formData.position} />
                <ReviewRow label="Work Type" value={formData.workType} />
                <ReviewRow label="Languages" value={formData.languages?.join(', ')} />
            </div>

            {/* ========== AVAILABILITY ========= */}
            <div className={styles.reviewSection}>
                <h4>Availability</h4>
                <ReviewRow label="Consultation Mode" value={formData.consultationMode?.join(', ')} />
                <ReviewRow label="Available Days" value={formData.availableDays?.join(', ')} />
                <ReviewRow label="Working Hours" value={`${formData.workStart} – ${formData.workEnd}`} />
            </div>

            {/* ========== TERMS ========= */}
            <div className={styles.termsSection}>
                <div className={styles.termsHeader}>
                    <h3>📄 Terms & Conditions</h3>
                    <div className={styles.scrollIndicator}>
                        <span>Scroll to read all terms</span>
                    </div>
                </div>

                <div className={styles.termsContent}>
                    <div
                        className={styles.termsScrollable}
                        onScroll={onScroll}
                        id="adr-terms-scrollable"
                    >


                        <h4>Registration Agreement</h4>
                        <p>By submitting this registration form, you enter into a binding agreement with LegalConnect Platform:
                        </p>

                        <h5>1. Information Accuracy</h5>
                        <p>You certify that all information provided is true, accurate, and complete to the best of your
                            knowledge. Any false information may result in immediate termination of your account and legal action.
                        </p>

                        <h5>2. Bar Council Compliance</h5>
                        <p>You agree to abide by all rules, regulations, and ethical guidelines set forth by the Bar Council of
                            India and your respective State Bar Council.</p>

                        <h5>3. Professional Conduct</h5>
                        <p>You agree to maintain the highest standards of professional conduct, including but not limited to:
                        </p>
                        <ul>
                            <li>Client confidentiality and attorney-client privilege</li>
                            <li>Conflict of interest avoidance</li>
                            <li>Timely communication with clients</li>
                            <li>Professional fee structure compliance</li>
                        </ul>

                        <h5>4. Platform Rules</h5>
                        <p>You agree to:</p>
                        <ul>
                            <li>Use the platform only for legitimate legal services</li>
                            <li>Not engage in any fraudulent activities</li>
                            <li>Respect platform's fee structure and commission</li>
                            <li>Maintain accurate availability status</li>
                        </ul>

                        <h5>5. Privacy Policy</h5>
                        <p>You accept our Privacy Policy which governs how we collect, use, and protect your personal and
                            professional information.</p>

                        <h5>6. Data Verification</h5>
                        <p>You authorize us to verify all submitted documents and information through appropriate
                            channels.</p>

                        <h5>7. Account Security</h5>
                        <p>You are responsible for maintaining the confidentiality of your account credentials and for all
                            activities under your account.</p>

                        <h5>8. Service Fees</h5>
                        <p>You agree to the platform's commission structure and payment terms for services rendered through the
                            platform.</p>

                        <h5>9. Termination</h5>
                        <p>We reserve the right to suspend or terminate your account for violations of these terms or for any
                            other lawful reason.</p>

                        <h5>10. Governing Law</h5>
                        <p>This agreement shall be governed by and construed in accordance with the laws of India.</p>

                        <div className={styles.termsEnd}>
                            <strong>
                                By checking the boxes below, you acknowledge and agree to all terms.
                            </strong>
                        </div>
                    </div>
                </div>

                <div className={styles.termsCheckboxes}>
                    {[1, 2, 3, 4].map((i) => (
                        <label key={i} className={`${styles.termCheckbox} ${errors?.[`terms${i}`] ? styles.inputError : ''}`}>
                            <input
                                type="checkbox"
                                disabled={!termsUnlocked}
                                checked={formData[`terms${i}`] || false}
                                onChange={(e) =>
                                    updateFormData({ [`terms${i}`]: e.target.checked })
                                }
                            />

                            <span>
                                {i === 1 && "I certify that all information is true"}
                                {i === 2 && "I agree to BCI norms and professional ethics"}
                                {i === 3 && "I accept the Privacy Policy"}
                                {i === 4 && "I agree to platform rules and fee structure"}
                            </span>
                        </label>
                    ))}
                </div>
            </div>


            {/* ========== CAPTCHA VERIFICATION ========= */}
            <div className={styles.signatureSection}>
                <h4>🛡️ Security Verification</h4>
                <div className={styles.captchaContainer}>
                    <div className={styles.captchaBox}>
                        <span className={styles.captchaText}>LEX-7A9B2</span>
                    </div>
                    <div className={styles.captchaInputGroup}>
                        <input
                            type="text"
                            placeholder="Type Code Above"
                            className={`${styles.captchaInput} ${errors?.captchaVerified ? styles.inputError : ''}`}
                            onChange={(e) => {
                                if (e.target.value.toUpperCase() === 'LEX-7A9B2') {
                                    updateFormData({ captchaVerified: true });
                                } else {
                                    updateFormData({ captchaVerified: false });
                                }
                            }}
                        />
                        {formData.captchaVerified && <span className={styles.verifySuccess}>✔ Verified</span>}
                    </div>
                </div>
            </div>

            {/* ========== SIGNATURE ========= */}
            <div className={styles.signatureSection}>
                <h4><PenTool size={14} /> Digital Signature</h4>

                <canvas
                    ref={canvasRef}
                    className={`${styles.signatureCanvas} ${errors?.signatureProvided ? styles.inputError : ''}`}
                    onMouseDown={start}
                    onMouseMove={draw}
                    onMouseUp={stop}
                    onMouseLeave={stop}
                />

                <button className={styles.clearBtn} onClick={clearSignature}>
                    Clear Signature
                </button>

                <input
                    type="date"
                    placeholder="Date"
                    value={formData.signatureDate ? formData.signatureDate.split('T')[0] : new Date().toISOString().split('T')[0]}
                    readOnly
                    className={styles.dateInput}
                />
            </div>


        </div>
    );
};

export default Step9Review;
