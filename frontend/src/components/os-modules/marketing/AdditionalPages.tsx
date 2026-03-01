import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from '../../dashboard/shared/DataTable';
import { Users, TrendingUp, BarChart, Briefcase } from 'lucide-react';

export const MarketingTeamPerformance: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/marketing/team-performance').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Users /> Team Performance</h2>
            <DataTable
                columns={[{ header: 'Member', accessor: 'member' }, { header: 'Campaigns', accessor: 'campaign_count' }, { header: 'Conv Rate', accessor: 'conversion_avg' }, { header: 'Rating', accessor: 'rating' }]}
                data={data}
                keyExtractor={(item: any) => item.member}
            />
        </div>
    );
};

export const MarketingSEOGrowth: React.FC = () => {
    const [data, setData] = useState<any>(null);
    useEffect(() => { axios.get('/api/marketing/seo-growth').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp /> SEO & Organic Growth</h2>
            {data && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', color: '#fff' }}>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
                        <div>Organic Traffic</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.organic_traffic.toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
                        <div>Domain Authority</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.domain_authority}</div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
                        <div>Keyword Ranking (Top 10)</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.keyword_ranking_top10}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const MarketingAnalysis: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/marketing/market-analysis').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><BarChart /> Market Analysis</h2>
            <DataTable
                columns={[{ header: 'Segment', accessor: 'segment' }, { header: 'Attractiveness', accessor: 'attractiveness' }, { header: 'Market Share', accessor: 'share' }]}
                data={data}
                keyExtractor={(item: any) => item.segment}
            />
        </div>
    );
};

export const MarketingAgencies: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/marketing/agency-management').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Briefcase /> Agency Management</h2>
            <DataTable
                columns={[{ header: 'Agency', accessor: 'agency' }, { header: 'Budget Managed', accessor: 'budget_managed' }, { header: 'ROAS', accessor: 'roas' }, { header: 'Status', accessor: 'status' }]}
                data={data}
                keyExtractor={(item: any) => item.agency}
            />
        </div>
    );
};
