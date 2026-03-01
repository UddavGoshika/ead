import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from '../../dashboard/shared/DataTable';
import { User, FileText, Map, ShieldCheck } from 'lucide-react';

export const GMStaffManagement: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/executive/staff').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><User /> Staff Management</h2>
            <DataTable
                columns={[{ header: 'ID', accessor: 'id' }, { header: 'Name', accessor: 'name' }, { header: 'Role', accessor: 'role' }, { header: 'Status', accessor: 'status' }]}
                data={data}
                keyExtractor={(item: any) => item.id}
            />
        </div>
    );
};

export const GMDocuments: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/executive/documents').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText /> Company Documents</h2>
            <DataTable
                columns={[{ header: 'Name', accessor: 'name' }, { header: 'Type', accessor: 'type' }, { header: 'Owner', accessor: 'owner' }, { header: 'Modified', accessor: 'last_modified' }]}
                data={data}
                keyExtractor={(item: any) => item.id}
            />
        </div>
    );
};

export const GMRoadmap: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/executive/roadmap').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Map /> Strategic Roadmap</h2>
            <DataTable
                columns={[{ header: 'Phase', accessor: 'phase' }, { header: 'Mission', accessor: 'mission' }, { header: 'Status', accessor: 'status' }, { header: 'Completion', accessor: (i: any) => `${i.completion}%` }]}
                data={data}
                keyExtractor={(item: any) => item.phase}
            />
        </div>
    );
};

export const GMCompliance: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/executive/compliance').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck /> Risk & Compliance</h2>
            <DataTable
                columns={[{ header: 'Audit', accessor: 'audit' }, { header: 'Score', accessor: 'score' }, { header: 'Status', accessor: 'status' }, { header: 'Next Audit', accessor: 'next_audit' }]}
                data={data}
                keyExtractor={(item: any) => item.audit}
            />
        </div>
    );
};
