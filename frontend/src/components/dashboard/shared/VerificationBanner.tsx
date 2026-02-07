import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

const VerificationBanner: React.FC = () => {
    return (
        <div style={{
            background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(24acc15, 0.2)',
            borderLeft: '4px solid #facc15',
            padding: '12px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <div style={{
                background: 'rgba(250, 204, 21, 0.1)',
                padding: '8px',
                borderRadius: '10px'
            }}>
                <AlertCircle size={22} color="#facc15" />
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ color: '#facc15', margin: 0, fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px' }}>
                    ACCOUNT UNDER VERIFICATION
                </h4>
                <p style={{ color: '#94a3b8', margin: '2px 0 0', fontSize: '12px', lineHeight: '1.4' }}>
                    Your profile is currently being reviewed by our verification team. Full features like <strong>Interests</strong>, <strong>Chat</strong> and <strong>Case Management</strong> will be enabled once approved.
                </p>
            </div>
            <div style={{
                fontSize: '11px',
                color: '#64748b',
                background: 'rgba(255,255,255,0.03)',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                Est: 12-24 Hours
            </div>
        </div>
    );
};

export default VerificationBanner;
