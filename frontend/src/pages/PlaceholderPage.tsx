import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PlaceholderPage: React.FC = () => {
    const location = useLocation();
    const pageName = location.pathname.substring(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div style={{
            padding: '100px 20px',
            textAlign: 'center',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#0a192f',
            color: '#fff'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#facc15' }}>{pageName || 'Page Under Construction'}</h1>
            <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px', opacity: 0.8 }}>
                We are currently working on this page to provide you with the best experience.
                Please check back soon for updates.
            </p>
            <Link to="/" style={{
                padding: '12px 24px',
                background: '#00a3ff',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'transform 0.2s'
            }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                Back to Home
            </Link>
        </div>
    );
};

export default PlaceholderPage;
