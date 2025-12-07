import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './SortDropdown.module.css';

const SortDropdown = ({ sortBy, sortOrder, onSort, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (field) => {
        // If same field, toggle order
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        onSort(field, newOrder);
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdown} ref={ref}>
            <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
                <span className={styles.label}>Sort by: </span>
                <span className={styles.value}>{sortBy} {sortOrder === 'asc' ? '(A-Z)' : '(Z-A)'}</span>
                <ChevronDown size={14} className={styles.icon} />
            </button>

            {isOpen && (
                <div className={styles.menu}>
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            className={`${styles.item} ${sortBy === opt.value ? styles.selected : ''}`}
                            onClick={() => handleSelect(opt.value)}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortDropdown;
