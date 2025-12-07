import React from 'react';
import { X } from 'lucide-react';
import styles from './FilterPanel.module.css';

const FilterPanel = ({ filters, onChange, onClose, onClear }) => {
    // All values from actual dataset
    const regions = ['Central', 'East', 'North', 'South', 'West'];
    const genders = ['Female', 'Male'];
    const categories = ['Beauty', 'Clothing', 'Electronics'];

    const handleCheckboxChange = (field, value) => {
        const currentValues = filters[field] ? filters[field].split(',') : [];
        let newValues;
        if (currentValues.includes(value)) {
            newValues = currentValues.filter(v => v !== value);
        } else {
            newValues = [...currentValues, value];
        }
        onChange(field, newValues.join(','));
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.panel}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Filters</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={styles.scrollArea}>
                    {/* Region */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Region</h3>
                        {regions.map(r => (
                            <label key={r} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={filters.region?.split(',').includes(r)}
                                    onChange={() => handleCheckboxChange('region', r)}
                                />
                                {r}
                            </label>
                        ))}
                    </div>

                    {/* Gender */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Gender</h3>
                        {genders.map(g => (
                            <label key={g} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={filters.gender?.split(',').includes(g)}
                                    onChange={() => handleCheckboxChange('gender', g)}
                                />
                                {g}
                            </label>
                        ))}
                    </div>

                    {/* Category */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Category</h3>
                        {categories.map(c => (
                            <label key={c} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={filters.category?.split(',').includes(c)}
                                    onChange={() => handleCheckboxChange('category', c)}
                                />
                                {c}
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.clearBtn} onClick={onClear}>Clear All</button>
                    <button className={styles.applyBtn} onClick={onClose}>Apply</button>
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
