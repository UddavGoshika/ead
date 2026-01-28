import React, { useState } from 'react';
import { Copy, Check, Calendar, Gift, Zap } from 'lucide-react';
import styles from './PromoCodes.module.css';

interface Promo {
    id: string;
    code: string;
    title: string;
    description: string;
    discount: string;
    expiry: string;
    status: 'active' | 'expired';
}

const PromoCodes: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [applying, setApplying] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const promos: Promo[] = [
        {
            id: '1',
            code: 'PREMIUM20',
            title: 'First Premium Upgrade',
            description: 'Get 20% off on your first membership upgrade to Elite status.',
            discount: '20% OFF',
            expiry: '2025-12-31',
            status: 'active'
        },
        {
            id: '2',
            code: 'FREECASE',
            title: 'New User Special',
            description: 'File your first case with 50% reduced processing fee.',
            discount: '50% OFF',
            expiry: '2025-06-15',
            status: 'active'
        },
        {
            id: '3',
            code: 'LAWYER50',
            title: 'Advocate Consultation',
            description: 'Enjoy a fixed discount on your first online consultation.',
            discount: '$50 CREDIT',
            expiry: '2024-12-31',
            status: 'expired'
        },
        {
            id: '4',
            code: 'TATITO10',
            title: 'Tatito ecosystem Bonus',
            description: 'Special bonus for users using multiple Tatito services.',
            discount: '10% EXTRA',
            expiry: '2025-09-20',
            status: 'active'
        }
    ];

    const handleApply = () => {
        if (!inputValue) return;
        setApplying(true);
        setTimeout(() => {
            alert(`Promo code "${inputValue}" applied successfully!`);
            setApplying(false);
            setInputValue('');
        }, 1500);
    };

    const copyToClipboard = (id: string, code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Exclusive Offers</h2>
                <p>Enjoy premium benefits and discounts with your special promocodes.</p>
            </div>

            <section className={styles.applySection}>
                <h3>Apply a new code</h3>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Enter your promocode here..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                    />
                    <button
                        className={styles.applyBtn}
                        onClick={handleApply}
                        disabled={applying || !inputValue}
                    >
                        {applying ? 'Applying...' : 'Redeem Now'}
                    </button>
                </div>
            </section>

            <div className={styles.promoGrid}>
                {promos.map((promo) => (
                    <div key={promo.id} className={styles.promoCard}>
                        <div className={styles.cardDecoration}></div>
                        <div className={styles.promoHeader}>
                            <div className={styles.iconWrapper}>
                                {promo.status === 'active' ? <Zap size={24} /> : <Gift size={24} />}
                            </div>
                            <span className={`${styles.badge} ${promo.status === 'active' ? styles.active : styles.expired}`}>
                                {promo.status}
                            </span>
                        </div>

                        <div className={styles.promoInfo}>
                            <h4>{promo.title}</h4>
                            <p>{promo.description}</p>
                        </div>

                        <div className={styles.promoCode}>
                            <span className={styles.codeText}>{promo.code}</span>
                            <button
                                className={styles.copyBtn}
                                onClick={() => copyToClipboard(promo.id, promo.code)}
                                title="Copy to clipboard"
                            >
                                {copiedId === promo.id ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                            </button>
                        </div>

                        <div className={styles.promoFooter}>
                            <div className={styles.expiryDate}>
                                <Calendar size={14} />
                                {promo.status === 'active' ? 'Expires' : 'Expired'}: {promo.expiry}
                            </div>
                            <div className={styles.discount}>
                                {promo.discount}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PromoCodes;
