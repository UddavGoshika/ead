import React from 'react';
import { ActionModal } from '../../../../components/dashboard/shared/ActionModal';
import { AlertCircle, ArrowUpRight, Shield, MessageSquare } from 'lucide-react';

interface EscalationModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: string;
    onEscalate: (level: number, reason: string) => void;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({ isOpen, onClose, ticketId, onEscalate }) => {
    const [level, setLevel] = React.useState(2);
    const [reason, setReason] = React.useState('');

    return (
        <ActionModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Escalate Ticket ${ticketId}`}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#ef444410', border: '1px solid #ef444430', borderRadius: '8px', color: '#ef4444' }}>
                    <AlertCircle size={20} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Escalating this ticket will notify the Support Lead and appropriate managers.</span>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>Escalation Level</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {[1, 2, 3].map((l) => (
                            <button
                                key={l}
                                onClick={() => setLevel(l)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: level === l ? '#3b82f6' : '#334155',
                                    background: level === l ? '#3b82f620' : '#0f172a',
                                    color: level === l ? '#3b82f6' : '#94a3b8',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {l === 1 ? <MessageSquare size={16} /> : l === 2 ? <Shield size={16} /> : <ArrowUpRight size={16} />}
                                Level {l}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>Reason for Escalation</label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginBottom: '12px' }}
                    >
                        <option value="">Select a reason...</option>
                        <option value="Technical Complexity">Technical Complexity</option>
                        <option value="Urgent Billing Issue">Urgent Billing Issue</option>
                        <option value="Legal Compliance">Legal Compliance</option>
                        <option value="Client Dissatisfaction">Client Dissatisfaction</option>
                        <option value="Other">Other (Specify below)</option>
                    </select>
                    <textarea
                        placeholder="Additional details..."
                        style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', resize: 'none' }}
                        rows={4}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                    <button
                        onClick={() => onEscalate(level, reason)}
                        style={{ padding: '10px 20px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Confirm Escalation
                    </button>
                </div>
            </div>
        </ActionModal>
    );
};
