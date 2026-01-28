import React from 'react';
import { Clock, Check } from 'lucide-react';
import styles from '../AdvocateRegistration.module.css';

interface StepProps {
    formData: any;
    updateFormData: (data: any) => void;
}

const consultationTypes = [
    { id: 'phone', label: 'Phone Consultation' },
    { id: 'video', label: 'Video Consultation' },
    { id: 'inperson', label: 'In-person Visit' }
];

const daysList = [
    { id: 'mon', label: 'Mon' },
    { id: 'tue', label: 'Tue' },
    { id: 'wed', label: 'Wed' },
    { id: 'thu', label: 'Thu' },
    { id: 'fri', label: 'Fri' },
    { id: 'sat', label: 'Sat' },
    { id: 'sun', label: 'Sun' }
];

const Step8Availability: React.FC<StepProps> = ({ formData, updateFormData }) => {

    const toggleConsultationType = (id: string) => {
        const current = formData.consultationTypes || [];
        const updated = current.includes(id)
            ? current.filter((t: string) => t !== id)
            : [...current, id];

        updateFormData({ consultationTypes: updated });
    };

    const toggleDay = (day: string) => {
        const current = formData.availableDays || [];
        const updated = current.includes(day)
            ? current.filter((d: string) => d !== day)
            : [...current, day];

        updateFormData({ availableDays: updated });
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
                <Clock size={20} />
                <h3>Availability & Consultation</h3>
            </div>

            {/* ================= CONSULTATION MODE ================= */}
            <div className={styles.consultationTypes}>
                <label className={styles.label}>
                    CONSULTATION MODE <span className={styles.required}>*</span>
                </label>

                <div className={styles.checkboxGrid}>
                    {consultationTypes.map((type) => (
                        <div
                            key={type.id}
                            className={`${styles.checkboxItem} ${(formData.consultationTypes || []).includes(type.id)
                                ? styles.checked
                                : ''
                                }`}
                            onClick={() => toggleConsultationType(type.id)}
                        >
                            <div className={styles.checkbox}>
                                {(formData.consultationTypes || []).includes(type.id) && (
                                    <Check size={14} />
                                )}
                            </div>
                            <span>{type.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ================= AVAILABLE DAYS ================= */}
            <div className={styles.consultationTypes}>
                <label className={styles.label}>
                    AVAILABLE DAYS <span className={styles.required}>*</span>
                </label>

                <div className={styles.checkboxGrid}>
                    {daysList.map((day) => (
                        <div
                            key={day.id}
                            className={`${styles.checkboxItem} ${(formData.availableDays || []).includes(day.id)
                                ? styles.checked
                                : ''
                                }`}
                            onClick={() => toggleDay(day.id)}
                        >
                            <div className={styles.checkbox}>
                                {(formData.availableDays || []).includes(day.id) && (
                                    <Check size={14} />
                                )}
                            </div>
                            <span>{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ================= WORKING HOURS & FEE ================= */}
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>
                        WORKING HOURS – FROM <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="time"
                        name="workStart"
                        value={formData.workStart || '09:00'}
                        onChange={(e) =>
                            updateFormData({ workStart: e.target.value })
                        }
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>
                        WORKING HOURS – TO <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="time"
                        name="workEnd"
                        value={formData.workEnd || '18:00'}
                        onChange={(e) =>
                            updateFormData({ workEnd: e.target.value })
                        }
                    />
                </div>

            </div>
        </div>
    );
};

export default Step8Availability;
