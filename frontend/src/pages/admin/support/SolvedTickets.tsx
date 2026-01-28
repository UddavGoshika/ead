import React from 'react';
import styles from './SolvedTickets.module.css';

const SolvedTickets: React.FC = () => {
    return (
        <div className={styles.container}>
            <h1>Solved Tickets</h1>
            <p>Welcome to the Solved Tickets management module.</p>
        </div>
    );
};

export default SolvedTickets;
