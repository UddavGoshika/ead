import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./PaymentMethods.module.css";

interface GatewayState {
    isActive: boolean;
    mode: 'sandbox' | 'live';
    credentials: Record<string, any>;
}

const Section = ({
    title,
    onSave,
    isActive,
    onToggle,
    children,
}: {
    title: string;
    onSave: () => void;
    isActive: boolean;
    onToggle: (val: boolean) => void;
    children: React.ReactNode;
}) => (
    <div className={styles.card}>
        <div className={styles.cardHeader}>
            <h3>{title}</h3>
            <label className={styles.switch}>
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => onToggle(e.target.checked)}
                />
                <span className={styles.slider} />
            </label>
        </div>

        <div className={styles.content}>{children}</div>

        <div className={styles.actions}>
            <button className={styles.saveBtn} onClick={onSave}>Save</button>
        </div>
    </div>
);

const PaymentCredentials: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, GatewayState>>({
        paypal: { isActive: true, mode: 'sandbox', credentials: {} },
        instamojo: { isActive: true, mode: 'sandbox', credentials: {} },
        stripe: { isActive: true, mode: 'sandbox', credentials: {} },
        razorpay: { isActive: true, mode: 'sandbox', credentials: {} },
        paytm: { isActive: true, mode: 'sandbox', credentials: {} },
        paystack: { isActive: true, mode: 'sandbox', credentials: {} },
        aamarpay: { isActive: true, mode: 'sandbox', credentials: {} },
        sslcommerz: { isActive: true, mode: 'sandbox', credentials: {} },
        phonepe: { isActive: true, mode: 'sandbox', credentials: {} },
        upi: { isActive: true, mode: 'sandbox', credentials: {} },
        cashfree: { isActive: false, mode: 'sandbox', credentials: {} },
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get("/api/payments/admin/settings");
            if (res.data.success) {
                const newSettings = { ...settings };
                res.data.settings.forEach((s: any) => {
                    newSettings[s.gateway] = {
                        isActive: s.isActive,
                        mode: s.mode,
                        credentials: s.credentials
                    };
                });
                setSettings(newSettings);
            }
        } catch (err) {
            console.error("Error fetching payment settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (gateway: string) => {
        try {
            const res = await axios.post("/api/payments/admin/settings", {
                gateway,
                ...settings[gateway]
            });
            if (res.data.success) {
                alert(`${gateway.toUpperCase()} settings saved successfully!`);
            }
        } catch (err) {
            alert("Error saving settings");
        }
    };

    const updateCreds = (gateway: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [gateway]: {
                ...prev[gateway],
                credentials: {
                    ...prev[gateway].credentials,
                    [key]: value
                }
            }
        }));
    };

    const updateStatus = (gateway: string, isActive: boolean) => {
        setSettings(prev => ({
            ...prev,
            [gateway]: { ...prev[gateway], isActive }
        }));
    };

    const updateMode = (gateway: string, mode: 'sandbox' | 'live') => {
        setSettings(prev => ({
            ...prev,
            [gateway]: { ...prev[gateway], mode }
        }));
    };

    if (loading) return <div>Loading Payment Settings...</div>;

    return (
        <div className={styles.page}>
            {/* STRIPE */}
            <Section
                title="Stripe Credential"
                isActive={settings.stripe.isActive}
                onToggle={(val) => updateStatus('stripe', val)}
                onSave={() => handleSave('stripe')}
            >
                <input
                    placeholder="Stripe Public Key"
                    value={settings.stripe.credentials.public_key || ''}
                    onChange={(e) => updateCreds('stripe', 'public_key', e.target.value)}
                />
                <input
                    placeholder="Stripe Secret Key"
                    value={settings.stripe.credentials.secret_key || ''}
                    onChange={(e) => updateCreds('stripe', 'secret_key', e.target.value)}
                />
            </Section>

            {/* RAZORPAY */}
            <Section
                title="Razorpay Credential"
                isActive={settings.razorpay.isActive}
                onToggle={(val) => updateStatus('razorpay', val)}
                onSave={() => handleSave('razorpay')}
            >
                <input
                    placeholder="Razorpay Key"
                    value={settings.razorpay.credentials.key || ''}
                    onChange={(e) => updateCreds('razorpay', 'key', e.target.value)}
                />
                <input
                    placeholder="Razorpay Secret"
                    value={settings.razorpay.credentials.secret || ''}
                    onChange={(e) => updateCreds('razorpay', 'secret', e.target.value)}
                />
            </Section>

            {/* PAYTM */}
            <Section
                title="Paytm Credential"
                isActive={settings.paytm.isActive}
                onToggle={(val) => updateStatus('paytm', val)}
                onSave={() => handleSave('paytm')}
            >
                <select
                    value={settings.paytm.mode}
                    onChange={(e) => updateMode('paytm', e.target.value as any)}
                >
                    <option value="live">Production</option>
                    <option value="sandbox">Sandbox</option>
                </select>
                <input
                    placeholder="Paytm Merchant ID"
                    value={settings.paytm.credentials.merchantId || ''}
                    onChange={(e) => updateCreds('paytm', 'merchantId', e.target.value)}
                />
                <input
                    placeholder="Paytm Merchant Key"
                    value={settings.paytm.credentials.merchantKey || ''}
                    onChange={(e) => updateCreds('paytm', 'merchantKey', e.target.value)}
                />
                <input
                    placeholder="Paytm Merchant Website"
                    value={settings.paytm.credentials.website || ''}
                    onChange={(e) => updateCreds('paytm', 'website', e.target.value)}
                />
            </Section>

            {/* UPI (Added for consistency) */}
            <Section
                title="UPI QR Settings"
                isActive={settings.upi.isActive}
                onToggle={(val) => updateStatus('upi', val)}
                onSave={() => handleSave('upi')}
            >
                <input
                    placeholder="UPI ID (e.g. name@okaxis)"
                    value={settings.upi.credentials.upiId || ''}
                    onChange={(e) => updateCreds('upi', 'upiId', e.target.value)}
                />
                <input
                    placeholder="Payee Name"
                    value={settings.upi.credentials.payeeName || ''}
                    onChange={(e) => updateCreds('upi', 'payeeName', e.target.value)}
                />
            </Section>

            {/* CASHFREE */}
            <Section
                title="Cashfree Payments"
                isActive={settings.cashfree?.isActive ?? false}
                onToggle={(val) => updateStatus('cashfree', val)}
                onSave={() => handleSave('cashfree')}
            >
                <div style={{ marginBottom: '15px', color: '#cbd5e1', fontSize: '13px' }}>
                    <span style={{ color: '#facc15' }}>Note:</span> Platform Fee is <strong>2%</strong> per transaction.
                </div>
                <select
                    value={settings.cashfree?.mode || 'sandbox'}
                    onChange={(e) => updateMode('cashfree', e.target.value as any)}
                >
                    <option value="live">Production</option>
                    <option value="sandbox">Sandbox</option>
                </select>
                <input
                    placeholder="App ID (Client ID)"
                    type="text"
                    value={settings.cashfree?.credentials?.appId || ''}
                    onChange={(e) => updateCreds('cashfree', 'appId', e.target.value)}
                />
                <input
                    placeholder="Secret Key (Client Secret)"
                    type="password"
                    value={settings.cashfree?.credentials?.secretKey || ''}
                    onChange={(e) => updateCreds('cashfree', 'secretKey', e.target.value)}
                />
            </Section>

        </div>
    );
};

export default PaymentCredentials;
