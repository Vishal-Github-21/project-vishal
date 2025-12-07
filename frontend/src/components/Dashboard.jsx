import React from 'react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome Back, Vishal</h1>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>Overview</h3>
                    <p>System operating normally.</p>
                </div>
                <div className={styles.card}>
                    <h3>Recent Activity</h3>
                    <p>No new alerts.</p>
                </div>
                <div className={styles.card}>
                    <h3>Quick Links</h3>
                    <p>Go to Nexus to view Sales.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
