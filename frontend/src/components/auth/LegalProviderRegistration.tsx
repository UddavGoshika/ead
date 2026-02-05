import React, { useState } from 'react';
import { X, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LegalProviderRegistration.module.css';
import { authService } from '../../services/api';

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

interface LegalProviderRegistrationProps {
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

const LegalProviderRegistration: React.FC<LegalProviderRegistrationProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<any>({
        // Step 1 - Personal
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
        phoneOtp: '',

        // Step 3 - Password
        password: '',
        confirmPassword: '',

        // Step 4 - Education (Optional for Providers)
        degree: '',
        university: '',
        college: '',
        passingYear: '',
        enrollmentNumber: '',
        degreeCertificate: null,
        aboutMe: '',

        // Step 5 - Practice (Optional for Providers)
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
        currCity: '',
        currDistrict: '',
        currPincode: '',
        permAddress: '',
        permState: '',
        permCity: '',
        permDistrict: '',
        permPincode: '',
        sameAsCurrent: false,

        // Step 7 - Career (Optional for Providers)
        currentFirm: '',
        position: '',
        workType: '',
        languages: [],
        otherLanguages: '',
        careerBio: '',
        website: '',
        linkedin: '',

        // Step 8 - Availability
        consultationTypes: [],
        availableDays: [],
        workStart: '09:00',
        workEnd: '18:00',
        consultFee: '',

        // Step 9 - Review & Submit
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

    const updateFormData = (newData: any) => {
        setFormData((prev: any) => ({ ...prev, ...newData }));
    };

    const renderStepContent = () => {
        const props = { formData, updateFormData, onSubmit: handleNext };
        switch (currentStep) {
            case 1: return <Step1Personal {...props} />;
            case 2: return <Step2Verification {...props} />;
            case 3: return <Step3Password {...props} />;
            case 4: return <Step4Education {...props} isOptional={true} />;
            case 5: return <Step5Practice {...props} isOptional={true} />;
            case 6: return <Step6Location {...props} />;
            case 7: return <Step7Career {...props} isOptional={true} />;
            case 8: return <Step8Availability {...props} />;
            case 9: return <Step9Review {...props} />;
            default: return null;
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return (
                    formData.firstName &&
                    formData.lastName &&
                    formData.gender &&
                    formData.dob &&
                    formData.mobile &&
                    formData.email &&
                    formData.idProofType &&
                    formData.idProofDocument &&
                    formData.profilePhoto
                );
            case 2:
                return (
                    formData.emailVerified &&
                    formData.mobileVerified
                );
            case 3:
                return formData.password && formData.confirmPassword && (formData.password === formData.confirmPassword);

            case 4: return true; // Education is optional for Providers
            case 5: return true; // Practice is optional for Providers
            case 7: return true; // Career is optional for Providers

            case 6:
                return (
                    formData.currAddress &&
                    formData.currState &&
                    formData.currCity &&
                    formData.currPincode &&
                    (
                        formData.sameAsCurrent ||
                        (formData.permAddress &&
                            formData.permState &&
                            formData.permCity &&
                            formData.permPincode)
                    )
                );

            case 8:
                return (
                    Array.isArray(formData.consultationTypes) &&
                    formData.consultationTypes.length > 0 &&
                    Array.isArray(formData.availableDays) &&
                    formData.availableDays.length > 0 &&
                    formData.workStart &&
                    formData.workEnd
                );

            case 9:
                return (
                    formData.terms1 &&
                    formData.terms2 &&
                    formData.terms3 &&
                    formData.terms4 &&
                    formData.signatureProvided &&
                    formData.signatureDate &&
                    formData.captchaVerified
                );

            default:
                return true;
        }
    };

    const handleNext = async () => {
        if (!isStepValid()) {
            alert('Please fill all required fields correctly before proceeding.');
            return;
        }

        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            try {
                const submissionData = new FormData();
                const fileFieldsMapping: Record<string, string> = {
                    profilePhoto: 'adr-profilePic',
                    degreeCertificate: 'adr-degreeCert',
                    idProofDocument: 'adr-idProof',
                    practiceLicense: 'adr-practiceLicense',
                    signature: 'signature'
                };

                Object.keys(formData).forEach(key => {
                    const value = formData[key];
                    if (value === null || value === undefined) return;

                    if (fileFieldsMapping[key]) {
                        submissionData.append(fileFieldsMapping[key], value);
                    } else if (Array.isArray(value)) {
                        submissionData.append(key, JSON.stringify(value));
                    } else {
                        if (value instanceof File || value instanceof Blob) return;
                        submissionData.append(key, value);
                    }
                });

                // Force role for provider registration
                submissionData.set('role', 'legal_provider');

                const response = await authService.registerAdvocate(submissionData);
                if (response.data.success) {
                    const advId = response.data.advocateId || response.data.uniqueId || 'Assigned shortly';
                    alert(`Legal Provider registration submitted successfully!\n\nYour Unique ID is: ${advId}\n\nPlease keep this ID for future reference.`);
                    onClose();
                } else {
                    alert('Registration failed: ' + (response.data.error || 'Unknown error'));
                }
            } catch (err: any) {
                console.error('Registration Error:', err);
                alert('Connection error: ' + (err.response?.data?.error || err.message));
            }
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
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <Briefcase className={styles.hammerIcon} size={24} />
                        <h2>Legal Advisor Registration</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} /> X
                    </button>
                </div>

                <div className={styles.stepperContainer}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                    <div className={styles.steps}>
                        {steps.map(step => (
                            <div
                                key={step.id}
                                className={`${styles.stepItem} ${currentStep === step.id ? styles.activeStep : ''} ${currentStep > step.id ? styles.completedStep : ''}`}
                                onClick={() => setCurrentStep(step.id)}
                            >
                                <div className={styles.stepCircle}>{step.id}</div>
                                <span className={styles.stepLabel}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

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

                <div className={styles.footer}>
                    <button
                        className={styles.backBtn}
                        disabled={currentStep === 1}
                        onClick={() => setCurrentStep(prev => prev - 1)}
                    >
                        Previous
                    </button>
                    <button className={styles.nextBtn} onClick={handleNext}>
                        {([4, 5, 7].includes(currentStep)) ? 'Skip & Continue' :
                            (currentStep === steps.length ? 'Submit Application' : 'Continue')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LegalProviderRegistration;
