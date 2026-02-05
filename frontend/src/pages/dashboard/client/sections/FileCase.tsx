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
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    const states = Object.keys(LOCATION_DATA_RAW);
    const districts = selectedState ? Object.keys(LOCATION_DATA_RAW[selectedState] || {}) : [];
    const cities = (selectedState && selectedDistrict) ? LOCATION_DATA_RAW[selectedState][selectedDistrict] : [];

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        state: '',
        district: '',
        city: '',
        court: '',
        department: '',
        subDepartment: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'state') {
            setSelectedState(value);
            setSelectedDistrict('');
            setFormData(prev => ({ ...prev, state: value, district: '', city: '' }));
        } else if (name === 'district') {
            setSelectedDistrict(value);
            setFormData(prev => ({ ...prev, district: value, city: '' }));
        } else if (name === 'department') {
            setFormData(prev => ({ ...prev, department: value, category: value, subDepartment: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.department) {
            showToast('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            // Construct location string for backward compatibility
            const locationString = `${formData.city}, ${formData.district}, ${formData.state}`.replace(/^, |, $/g, '');
            const submissionData = {
                ...formData,
                location: locationString
            };

            await caseService.fileCase(submissionData);
            showToast('Case filed successfully!');
            backToHome();
        } catch (err: any) {
            console.error("Submission Error:", err);
            showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to file case');
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

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', maxWidth: '900px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#cbd5e1' }}>Legal Department *</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
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
                        <label style={{ fontSize: '14px', color: '#cbd5e1' }}>Sub-Department</label>
                        <select
                            name="subDepartment"
                            value={formData.subDepartment}
                            onChange={handleChange}
                            disabled={!formData.department}
                            style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none' }}
                        >
                            <option value="">Select Sub-Department</option>
                            {formData.department && LEGAL_DOMAINS[formData.department]?.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#cbd5e1' }}>State</label>
                        <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none' }}
                        >
                            <option value="">Select State</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#cbd5e1' }}>District</label>
                        <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            disabled={!formData.state}
                            style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none' }}
                        >
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#cbd5e1' }}>City</label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            disabled={!formData.district}
                            style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none' }}
                        >
                            <option value="">Select City</option>
                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
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
                        style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', minHeight: '120px', outline: 'none' }}
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
