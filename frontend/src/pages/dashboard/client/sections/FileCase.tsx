import React, { useState } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { caseService } from '../../../../services/api';
import { LEGAL_DOMAINS } from '../../../../data/legalDomainData';
import { LOCATION_DATA_RAW } from '../../../../components/layout/statesdis';


interface Props {
    backToHome: () => void;
    showToast: (msg: string) => void;
}

const FileCase: React.FC<Props> = ({ backToHome, showToast }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        location: '',
        court: '',
        department: '',
        subDepartment: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await caseService.fileCase(formData);
            showToast('Case filed successfully!');
            backToHome();
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.message || 'Failed to file case');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', color: 'white', animation: 'fadeIn 0.3s ease' }}>
            <button onClick={backToHome} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>File a New Case</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Submit your case details to generate a formal record.</p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', maxWidth: '800px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#cbd5e1' }}>Case Title *</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            type="text"
                            required
                            placeholder="e.g., Property Dispute"
                            style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#cbd5e1' }}>Court Type</label>
                        <select
                            name="court"
                            value={formData.court}
                            onChange={handleChange}
                            style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none' }}
                        >
                            <option value="">Select Court</option>
                            <option>Supreme Court</option>
                            <option>High Court</option>
                            <option>District Court</option>
                            <option>Consumer Forum</option>
                            <option>Tribunal</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#cbd5e1' }}>Legal Department *</label>
                        <select
                            name="category"
                            value={formData.category} // Using category as department mainly
                            onChange={(e) => setFormData({ ...formData, category: e.target.value, department: e.target.value })}
                            required
                            style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none' }}
                        >
                            <option value="">Select Department</option>
                            {Object.keys(LEGAL_DOMAINS).map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#cbd5e1' }}>Location (City/State)</label>
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            type="text"
                            placeholder="e.g. Mumbai, Maharashtra"
                            style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: '#cbd5e1' }}>Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Describe the details of your case..."
                        style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', minHeight: '150px', outline: 'none' }}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '14px',
                        borderRadius: '8px',
                        background: '#facc15',
                        color: '#0f172a',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '10px'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    {loading ? 'Submitting...' : 'Submit Case'}
                </button>
            </form>
        </div>
    );
};

export default FileCase;
