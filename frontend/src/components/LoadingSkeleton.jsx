import React from 'react';
import styles from './LoadingSkeleton.module.css';

const LoadingSkeleton = () => {
    return (
        <div className={styles.container}>
            {/* Stats Cards Skeleton */}
            <div className={styles.statsRow}>
                {[1, 2, 3].map(i => (
                    <div key={i} className={styles.statCard}>
                        <div className={styles.skeletonLine} style={{ width: '60%', height: '16px' }}></div>
                        <div className={styles.skeletonLine} style={{ width: '80%', height: '32px', marginTop: '12px' }}></div>
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className={styles.tableContainer}>
                {/* Table Header */}
                <div className={styles.tableHeader}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className={styles.headerCell}>
                            <div className={styles.skeletonLine} style={{ width: '80%', height: '14px' }}></div>
                        </div>
                    ))}
                </div>

                {/* Table Rows */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
                    <div key={row} className={styles.tableRow}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(col => (
                            <div key={col} className={styles.tableCell}>
                                <div 
                                    className={styles.skeletonLine} 
                                    style={{ 
                                        width: `${60 + Math.random() * 30}%`, 
                                        height: '14px' 
                                    }}
                                ></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination Skeleton */}
            <div className={styles.paginationSkeleton}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={styles.skeletonCircle}></div>
                ))}
            </div>
        </div>
    );
};

export default LoadingSkeleton;
