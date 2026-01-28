import React from 'react';
import styles from './MyTickets.module.css';

const MyTickets: React.FC = () => {
    return (
        <div className={styles.container}>
            <h1>My Tickets</h1>
            <p>Welcome to the My Tickets management module.</p>
        </div>
    );
};

export default MyTickets;
