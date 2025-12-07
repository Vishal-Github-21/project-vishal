import React from 'react';
import { Info } from 'lucide-react';
import styles from './StatsCards.module.css';

const StatsCards = ({ stats }) => {
    return (
        <div className={styles.container}>
            {/* Total Units Sold */}
            <div className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.label}>Total units sold</span>
                    <Info size={14} className={styles.icon} />
                </div>
                <div className={styles.value}>{stats?.totalUnits || 0}</div>
            </div>

            {/* Total Amount */}
            <div className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.label}>Total Amount</span>
                    <Info size={14} className={styles.icon} />
                </div>
                <div className={styles.value}>
                    ₹{stats?.totalAmount?.toLocaleString() || 0}
                    <span className={styles.subValue}> (19 SRs)</span> {/* Mocking the SRs/sub-text */}
                </div>
            </div>

            {/* Total Discount */}
            <div className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.label}>Total Discount</span>
                    <Info size={14} className={styles.icon} />
                </div>
                <div className={styles.value}>
                    ₹{stats?.totalDiscount?.toLocaleString() || 0}
                    <span className={styles.subValue}> (45 SRs)</span>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;
