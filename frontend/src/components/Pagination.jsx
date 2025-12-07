import React, { useState } from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [jumpPage, setJumpPage] = useState('');

    const handleJump = (e) => {
        e.preventDefault();
        const page = parseInt(jumpPage);
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    // Logic for cleaner pagination (1 ... 4 5 6 ... N)
    const rangeWithDots = [];
    const delta = 1;

    // Calculate range around current
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    if (totalPages <= 7) {
        // If few pages, show all
        for (let i = 1; i <= totalPages; i++) rangeWithDots.push(i);
    } else {
        rangeWithDots.push(1);

        if (left > 2) rangeWithDots.push('...');

        for (let i = left; i <= right; i++) rangeWithDots.push(i);

        if (right < totalPages - 1) rangeWithDots.push('...');

        rangeWithDots.push(totalPages);
    }

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                {rangeWithDots.map((page, index) => (
                    page === '...' ? (
                        <span key={`dots-${index}`} className={styles.dots}>...</span>
                    ) : (
                        <button
                            key={page}
                            className={`${styles.button} ${currentPage === page ? styles.active : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <form onSubmit={handleJump} className={styles.jumpForm}>
                <span className={styles.jumpLabel}>Go to</span>
                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    className={styles.jumpInput}
                />
            </form>
        </div>
    );
};

export default Pagination;
