import React from 'react';
import { ArrowLeft, Send } from 'lucide-react';

interface Props {
    backToHome: () => void;
    showToast: (msg: string) => void;
}

const FileCase: React.FC<Props> = ({ backToHome, showToast }) => {
    return (
        <div style={{ padding: '20px', color: 'white' }}>
            <button onClick={backToHome} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Register a New Consultation</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Provide details to list your professional services or case involvement.</p>

            <form onSubmit={(e) => { e.preventDefault(); showToast('Consultation registered successfully!'); backToHome(); }} style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>Consultation Title</label>
                    <input type="text" required placeholder="e.g., Corporate Strategy Session" style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>Specialization</label>
                    <select style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white' }}>
                        <option>Civil</option>
                        <option>Criminal</option>
                        <option>Family</option>
                        <option>Corporate</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>Professional Summary</label>
                    <textarea required placeholder="Describe the consultation or case scope..." style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', minHeight: '150px' }}></textarea>
                </div>
                <button type="submit" style={{ padding: '14px', borderRadius: '8px', background: '#facc15', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Send size={18} /> Submit Details
                </button>
            </form>
        </div>
    );
};

export default FileCase;
