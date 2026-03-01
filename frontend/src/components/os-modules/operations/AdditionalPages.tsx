import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from '../../dashboard/shared/DataTable';
import { Calendar, ShieldCheck, UserCheck, Database, FileBarChart, Truck } from 'lucide-react';

export const OpsResourcePlanning: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/operations/resource-planning').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar /> Resource Planning</h2>
            <DataTable
                columns={[{ header: 'Dept', accessor: 'department' }, { header: 'Capacity', accessor: 'capacity' }, { header: 'HC', accessor: 'head_count' }, { header: 'Need Next Mo', accessor: 'need_next_month' }]}
                data={data}
                keyExtractor={(item: any) => item.department}
            />
        </div>
    );
};

export const OpsQualityAudit: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/operations/quality-audit').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck /> Quality QA Audit</h2>
            <DataTable
                columns={[{ header: 'Audit ID', accessor: 'audit_id' }, { header: 'Process', accessor: 'process' }, { header: 'Score', accessor: 'score' }, { header: 'Result', accessor: 'result' }]}
                data={data}
                keyExtractor={(item: any) => item.audit_id}
            />
        </div>
    );
};

export const OpsAgentMetrics: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/operations/agent-metrics').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><UserCheck /> Agent Performance</h2>
            <DataTable
                columns={[{ header: 'Agent', accessor: 'agent' }, { header: 'Talk Time', accessor: 'talk_time' }, { header: 'Conversion', accessor: 'conversion' }, { header: 'Status', accessor: 'status' }]}
                data={data}
                keyExtractor={(item: any) => item.agent}
            />
        </div>
    );
};

export const OpsDataTracking: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/operations/data-tracking').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Database /> Data Workflow</h2>
            <DataTable
                columns={[{ header: 'Stream', accessor: 'stream' }, { header: 'Volume', accessor: 'volume' }, { header: 'Accuracy', accessor: 'accuracy' }, { header: 'Delay', accessor: 'delay' }]}
                data={data}
                keyExtractor={(item: any) => item.stream}
            />
        </div>
    );
};

export const OpsReports: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/operations/ops-reports').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><FileBarChart /> Strategic Ops Reports</h2>
            <DataTable
                columns={[{ header: 'Report', accessor: 'report' }, { header: 'Generated', accessor: 'generated' }, { header: 'Type', accessor: 'type' }]}
                data={data}
                keyExtractor={(item: any) => item.report}
            />
        </div>
    );
};

export const OpsSupplyChain: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/operations/supply-chain').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Truck /> Supply Chain & Vendors</h2>
            <DataTable
                columns={[{ header: 'Vendor', accessor: 'vendor' }, { header: 'Service', accessor: 'service' }, { header: 'Cost/mo', accessor: 'cost_mo' }, { header: 'Health', accessor: 'health' }]}
                data={data}
                keyExtractor={(item: any) => item.vendor}
            />
        </div>
    );
};
