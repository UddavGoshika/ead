import React, { useState } from 'react';
import { X, Award, ShieldCheck } from 'lucide-react';
import styles from './MemberPackageModal.module.css';

interface Member {
    id: string;
    name: string;
    plan: string;
}

interface Props {
    member: Member | null;
    onClose: () => void;
    onUpdatePlan: (id: string, newPlan: string) => void;
}

const planCategories = [
    {
        name: 'Free',
        isMainOnly: true,
        plans: ['Free']
    },
    {
        name: 'Pro',
        plans: ['Pro Silver', 'Pro Gold', 'Pro Platinum']
    },
    {
        name: 'Pro Lite',
        plans: ['Pro Lite Silver', 'Pro Lite Gold', 'Pro Lite Platinum']
    },
    {
        name: 'Ultra Pro',
        plans: ['Ultra Pro Silver', 'Ultra Pro Gold', 'Ultra Pro Platinum']
    }
];

const MemberPackageModal: React.FC<Props> = ({ member, onClose, onUpdatePlan }) => {
    const [selectedPlan, setSelectedPlan] = useState(member?.plan || 'Free');

    if (!member) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h2>Manage Membership Plan</h2>
                        <p className={styles.memberSub}>Editing: <strong>{member.name}</strong></p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <div className={styles.content}>
                    <div className={styles.blockGrid}>
                        {planCategories.map((category) => (
                            <div key={category.name} className={styles.block}>
                                <div className={styles.categoryName}>{category.name}</div>
                                <div className={styles.optionsWrapper}>
                                    {category.isMainOnly ? (
                                        <button
                                            className={`${styles.optionBtn} ${selectedPlan === 'Free' ? styles.active : ''}`}
                                            onClick={() => setSelectedPlan('Free')}
                                        >
                                            <Award size={18} />
                                            <span>Select Free</span>
                                        </button>
                                    ) : (
                                        <div className={styles.subOptions}>
                                            {category.plans.map(plan => {
                                                const level = plan.split(' ').pop(); // Silver, Gold, or Platinum
                                                return (
                                                    <button
                                                        key={plan}
                                                        className={`${styles.optionBtn} ${selectedPlan === plan ? styles.active : ''}`}
                                                        onClick={() => setSelectedPlan(plan)}
                                                    >
                                                        <ShieldCheck size={16} />
                                                        <span>{level}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.selectionInfo}>
                        <span>Plan to Assign:</span>
                        <strong className={styles.selectedName}>{selectedPlan}</strong>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        <button
                            className={styles.updateBtn}
                            onClick={() => onUpdatePlan(member.id, selectedPlan)}
                            disabled={selectedPlan === member.plan}
                        >
                            Confirm {selectedPlan}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberPackageModal;
