import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './ColumnToggle.module.css';

const ColumnToggle = ({ visibleColumns, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);

    const allColumns = [
        { key: 'transactionId', label: 'Transaction ID', default: true },
        { key: 'date', label: 'Date', default: true },
        { key: 'customerId', label: 'Customer ID', default: true },
        { key: 'customerName', label: 'Customer Name', default: true },
        { key: 'phoneNumber', label: 'Phone Number', default: true },
        { key: 'gender', label: 'Gender', default: true },
        { key: 'age', label: 'Age', default: true },
        { key: 'customerRegion', label: 'Customer Region', default: true },
        { key: 'productCategory', label: 'Product Category', default: true },
        { key: 'tags', label: 'Tags', default: true },
        { key: 'totalAmount', label: 'Total Amount', default: true },
        { key: 'paymentMethod', label: 'Payment Method', default: true }
    ];

    const handleToggle = (columnKey) => {
        onToggle(columnKey);
    };

    const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

    return (
        <div className={styles.container}>
            <button 
                className={styles.toggleBtn}
                onClick={() => setIsOpen(!isOpen)}
                title="Toggle column visibility"
            >
                {isOpen ? <EyeOff size={18} /> : <Eye size={18} />}
                Columns ({visibleCount}/{allColumns.length})
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span>Show/Hide Columns</span>
                        <button 
                            className={styles.resetBtn}
                            onClick={() => {
                                const defaults = {};
                                allColumns.forEach(col => defaults[col.key] = col.default);
                                allColumns.forEach(col => onToggle(col.key, col.default));
                            }}
                        >
                            Reset
                        </button>
                    </div>
                    <div className={styles.columnList}>
                        {allColumns.map(column => (
                            <label key={column.key} className={styles.columnItem}>
                                <input
                                    type="checkbox"
                                    checked={visibleColumns[column.key] !== false}
                                    onChange={() => handleToggle(column.key)}
                                />
                                <span>{column.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColumnToggle;
