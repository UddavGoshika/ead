import React, { useState } from 'react';
import { X, Hammer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdvocateRegistration.module.css';
import { authService } from '../../services/api';
import { useAdminConfig } from '../../hooks/useAdminConfig';

// Import Step Components
import Step1Personal from './steps/Step1Personal';
import Step2Verification from './steps/Step2Verification';
import Step3Password from './steps/Step3Password';
import Step4Education from './steps/Step4Education';
import Step5Practice from './steps/Step5Practice';
import Step6Location from './steps/Step6Location';
import Step7Career from './steps/Step7Career';
import Step8Availability from './steps/Step8Availability';
import Step9Review from './steps/Step9Review';

interface AdvocateRegistrationProps {
    onClose: () => void;
}

const steps = [
    { id: 1, label: 'PERSONAL' },
    { id: 2, label: 'VERIFICATION' },
    { id: 3, label: 'PASSWORD' },
    { id: 4, label: 'EDUCATION' },
    { id: 5, label: 'PRACTICE' },
    { id: 6, label: 'LOCATION' },
    { id: 7, label: 'CAREER' },
    { id: 8, label: 'AVAILABILITY' },
    { id: 9, label: 'REVIEW' },
];

const stepMapping: Record<number, string> = {
    1: "Personal Information",
    2: "Verification Status",
    3: "Password",
    4: "Education",
    5: "Professional Practice",
    6: "Location",
    7: "Professional Career",
    8: "Availability",
    9: "Review & Submit"
};

const AdvocateRegistration: React.FC<AdvocateRegistrationProps> = ({ onClose }) => {
    const { isSectionEnabled } = useAdminConfig('advocate');

    // Filter steps based on enabled sections
    const visibleSteps = steps.filter(step => isSectionEnabled(stepMapping[step.id]));

    // Initialize currentStep to the first visible step
    const [currentStep, setCurrentStep] = useState<number>(visibleSteps.length > 0 ? visibleSteps[0].id : 1);

    const [formData, setFormData] = useState<any>({
        firstName: '',
        lastName: '',
        gender: '',
        dob: '',
        mobile: '',
        email: '',
        idProofType: '',
        idProofDocument: null,
        profilePhoto: null,

        // Step 2 - Verification
        emailOtp: '',
        phoneOtp: '', // Note: In logic we use emailOtp/mobileOtp check but fields might be these

        // Step 3 - Password
        password: '',
        confirmPassword: '',

        // Step 4 - Education
        degree: '',
        university: '',
        college: '',
        passingYear: '',
        enrollmentNumber: '',
        degreeCertificate: null,
        aboutMe: '',

        // Step 5 - Practice
        barRegNo: '',
        stateBar: '',
        courtOfPractice: '',
        experienceRange: '',
        specialization: '',
        subSpecialization: '',
        barAssociation: '',
        practiceLicense: null,

        // Step 6 - Location
        currAddress: '',
        currState: '',
        currDistrict: '',
        currCity: '',
        currPincode: '',
        sameAsCurrent: false,
        permAddress: '',
        permState: '',
        permDistrict: '',
        permCity: '',
        permPincode: '',

        // Step 7 - Career
        workType: '',
        careerBio: '',
        languages: [],

        // Step 8 - Availability
        workStart: '',
        workEnd: '',
        availableDays: [],
        consultationTypes: [],
        consultFee: '',

        // Step 9 - Review & Terms
        terms1: false,
        terms2: false,
        terms3: false,
        terms4: false,
        signatureProvided: false,
        signatureDate: '',
        emailVerified: false,
        mobileVerified: false,
        legalDocumentation: [],
        captchaVerified: false,
    });

    const [registrationSuccess, setRegistrationSuccess] = useState<{ id: string } | null>(null);
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const updateFormData = (newData: any) => {
        setErrors({}); // Clear errors on change
        setFormData((prev: any) => ({ ...prev, ...newData }));
    };

    const renderStepContent = () => {
        const props = { formData, updateFormData, onSubmit: handleNext, errors };
        switch (currentStep) {
            case 1: return <Step1Personal {...props} />;
            case 2: return <Step2Verification {...props} />;
            case 3: return <Step3Password {...props} />;
            case 4: return <Step4Education {...props} />;
            case 5: return <Step5Practice {...props} role="advocate" />;
            case 6: return <Step6Location {...props} />;
            case 7: return <Step7Career {...props} role="advocate" />;
            case 8: return <Step8Availability {...props} />;
            case 9: return <Step9Review {...props} />;
            default: return null;
        }
    };

    const validateAndHighlight = () => {
        const newErrors: Record<string, boolean> = {};

        const requiredFields: Record<number, string[]> = {
            1: ['firstName', 'lastName', 'gender', 'dob', 'mobile', 'email', 'idProofType', 'idProofDocument', 'profilePhoto'],
            4: ['degree', 'university', 'college', 'passingYear', 'enrollmentNumber', 'degreeCertificate', 'aboutMe'],
            5: ['barRegNo', 'stateBar', 'courtOfPractice', 'experienceRange', 'specialization', 'practiceLicense'],
            6: ['currAddress', 'currState', 'currDistrict', 'currCity', 'currPincode'],
            7: ['workType', 'careerBio'],
            9: ['terms1', 'terms2', 'terms3', 'terms4', 'signatureProvided', 'captchaVerified']
        };

        const fields = requiredFields[currentStep] || [];
        fields.forEach(field => {
            if (!formData[field]) newErrors[field] = true;
        });

        if (currentStep === 2) {
            if (!formData.emailVerified) newErrors['emailOtp'] = true;
            if (!formData.mobileVerified) newErrors['phoneOtp'] = true;
        }

        if (currentStep === 3) {
            if (!formData.password) newErrors['password'] = true;
            if (!formData.confirmPassword) newErrors['confirmPassword'] = true;
            if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
                newErrors['confirmPassword'] = true;
                alert('Passwords do not match');
            }
        }

        if (currentStep === 6 && !formData.sameAsCurrent) {
            ['permAddress', 'permState', 'permDistrict', 'permCity', 'permPincode'].forEach(field => {
                if (!formData[field]) newErrors[field] = true;
            });
        }

        if (currentStep === 7) {
            if (!formData.languages || formData.languages.length === 0) newErrors['languages'] = true;
        }

        if (currentStep === 8) {
            if (!formData.workStart) newErrors['workStart'] = true;
            if (!formData.workEnd) newErrors['workEnd'] = true;
            if (!formData.availableDays || formData.availableDays.length === 0) newErrors['availableDays'] = true;
            if (!formData.consultationTypes || formData.consultationTypes.length === 0) newErrors['consultationTypes'] = true;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validateAndHighlight()) {
            alert('Please fill all highlighted required fields.');
            return;
        }

        const currentIndex = visibleSteps.findIndex(s => s.id === currentStep);
        if (currentIndex < visibleSteps.length - 1) {
            setCurrentStep(visibleSteps[currentIndex + 1].id);
        } else {
            // Submit logic...
            try {
                // Actual Backend Submission using FormData for files
                const submissionData = new FormData();

                // Define file fields for special handling
                const fileFieldsMapping: Record<string, string> = {
                    profilePhoto: 'adr-profilePic',
                    degreeCertificate: 'adr-degreeCert',
                    idProofDocument: 'adr-idProof',
                    practiceLicense: 'adr-practiceLicense',
                    signature: 'signature'
                };

                Object.keys(formData).forEach(key => {
                    const value = formData[key];

                    // Skip null/undefined
                    if (value === null || value === undefined) return;

                    // Handle special file fields
                    if (fileFieldsMapping[key]) {
                        submissionData.append(fileFieldsMapping[key], value);
                    }
                    // Handle arrays
                    else if (Array.isArray(value)) {
                        submissionData.append(key, JSON.stringify(value));
                    }
                    // Handle all others (ensure they aren't accidentally sent as binary if they are objects)
                    else {
                        // If it's a File/Blob but not in our mapping, skip it to avoid MulterErrors
                        if (value instanceof File || value instanceof Blob) {
                            console.warn(`Skipping unhandled file field: ${key}`);
                            return;
                        }

                        // Otherwise append as is (strings, numbers, booleans)
                        submissionData.append(key, value);
                    }
                });

                // Log FormData for debugging Multer matches
                console.log('--- FormData contents ---');
                for (let [key, value] of (submissionData as any).entries()) {
                    console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
                }
                console.log('------------------------');

                const response = await authService.registerAdvocate(submissionData);
                if (response.data.success) {
                    const advId = response.data.advocateId || response.data.uniqueId || 'Assigned shortly';
                    setRegistrationSuccess({ id: advId });
                } else {
                    alert('Registration failed: ' + (response.data.error || 'Unknown error'));
                }
            } catch (err: any) {
                console.error('Registration Error:', err);
                const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'An unknown error occurred';
                alert(errorMessage);
            }
        }
    };

    const handlePrevious = () => {
        const currentIndex = visibleSteps.findIndex(s => s.id === currentStep);
        if (currentIndex > 0) {
            setCurrentStep(visibleSteps[currentIndex - 1].id);
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
                    <div className={styles.headerTitle}>
                        <Hammer className={styles.hammerIcon} size={24} />
                        <h2>Advocate Registration</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Stepper */}
                <div className={styles.stepperContainer}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{
                                width: `${visibleSteps.length > 1 ? ((visibleSteps.findIndex(s => s.id === currentStep)) / (visibleSteps.length - 1)) * 100 : 0}%`
                            }}
                        />
                    </div>
                    <div className={styles.steps}>
                        {visibleSteps.map((step, index) => {
                            const isCompleted = visibleSteps.findIndex(s => s.id === currentStep) > index;
                            const isActive = step.id === currentStep;

                            return (
                                <div
                                    key={step.id}
                                    className={`${styles.stepItem} ${isActive ? styles.activeStep : ''} ${isCompleted ? styles.completedStep : ''}`}
                                    onClick={() => {
                                        // Optional: Only allow clicking on visited steps or next step
                                        setCurrentStep(step.id);
                                    }}
                                >
                                    <div className={styles.stepCircle}>
                                        {step.id}
                                    </div>
                                    <span className={styles.stepLabel}>{step.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={styles.content}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className={styles.footer}>
                    <button
                        className={styles.backBtn}
                        disabled={visibleSteps.length > 0 && currentStep === visibleSteps[0].id}
                        onClick={handlePrevious}
                    >
                        Previous
                    </button>
                    <button
                        className={styles.nextBtn}
                        onClick={handleNext}
                    >
                        {visibleSteps.length > 0 && currentStep === visibleSteps[visibleSteps.length - 1].id ? 'Submit Application' : 'Continue'}
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
                                    <div className={styles.checkCircle}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                <h2 className={styles.successTitle}>Registration Submitted!</h2>
                                <p className={styles.successText}>
                                    Your application as an Advocate has been received.
                                </p>

                                <div className={styles.idDisplayBox}>
                                    <span className={styles.idLabel}>YOUR ADVOCATE ID:</span>
                                    <h3 className={styles.generatedId}>{registrationSuccess.id}</h3>
                                </div>

                                <div className={styles.verificationNote}>
                                    <p>Your profile is currently <strong>Under Verification</strong>. Please wait for <strong>12-24 hours</strong>. You will receive an email confirmation once approved.</p>
                                </div>

                                <button
                                    className={styles.finishBtn}
                                    onClick={onClose}
                                >
                                    Finish & Go to Home
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default AdvocateRegistration;
