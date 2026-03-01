import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from '../../dashboard/shared/DataTable';
import { Book, TrendingUp, Smile } from 'lucide-react';

export const SupportKnowledgeBase: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/support/knowledge-base').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Book /> Knowledge Base</h2>
            <DataTable
                columns={[{ header: 'Article', accessor: 'article' }, { header: 'Category', accessor: 'category' }, { header: 'Helpfulness', accessor: 'helpfulness' }, { header: 'Views', accessor: 'views' }]}
                data={data}
                keyExtractor={(item: any) => item.article}
            />
        </div>
    );
};

export const SupportSLATrends: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/support/sla-trends').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp /> SLA Trends</h2>
            <DataTable
                columns={[{ header: 'Month', accessor: 'month' }, { header: 'Compliance', accessor: 'compliance' }, { header: 'Breaches', accessor: 'breaches' }]}
                data={data}
                keyExtractor={(item: any) => item.month}
            />
        </div>
    );
};

export const SupportCSATDetailed: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/support/csat-detailed').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Smile /> Customer Satisfaction Detailed</h2>
            <DataTable
                columns={[{ header: 'Rating', accessor: (i: any) => `${i.rating} Stars` }, { header: 'Count', accessor: 'count' }, { header: 'Sentiment', accessor: 'sentiment' }]}
                data={data}
                keyExtractor={(item: any) => item.rating.toString()}
            />
        </div>
    );
};
