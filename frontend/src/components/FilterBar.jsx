import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import styles from './FilterBar.module.css';

const FilterDropdown = ({ label, options, selected, onChange }) => {
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

    const handleSelect = (option) => {
        // Multi-select logic
        const current = selected ? selected.split(',') : [];
        let newSelected;
        if (current.includes(option)) {
            newSelected = current.filter(item => item !== option);
        } else {
            newSelected = [...current, option];
        }
        onChange(newSelected.join(','));
    };

    return (
        <div className={styles.dropdown} ref={ref}>
            <button className={`${styles.dropdownBtn} ${selected ? styles.active : ''}`} onClick={() => setIsOpen(!isOpen)}>
                {label} <ChevronDown size={14} />
            </button>
            {isOpen && (
                <div className={styles.dropdownMenu}>
                    {options.map(opt => (
                        <label key={opt} className={styles.option}>
                            <input
                                type="checkbox"
                                checked={selected?.split(',').includes(opt)}
                                onChange={() => handleSelect(opt)}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const RangeDropdown = ({ label, selectedMin, selectedMax, onMinChange, onMaxChange, options }) => {
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

    const isActive = selectedMin || selectedMax;

    return (
        <div className={styles.dropdown} ref={ref}>
            <button className={`${styles.dropdownBtn} ${isActive ? styles.active : ''}`} onClick={() => setIsOpen(!isOpen)}>
                {label} <ChevronDown size={14} />
            </button>
            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div className={styles.rangeContainer}>
                        <div className={styles.rangeGroup}>
                            <label className={styles.rangeLabel}>Min</label>
                            <select 
                                value={selectedMin || ''} 
                                onChange={(e) => onMinChange(e.target.value)}
                                className={styles.rangeSelect}
                            >
                                <option value="">Any</option>
                                {options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.rangeGroup}>
                            <label className={styles.rangeLabel}>Max</label>
                            <select 
                                value={selectedMax || ''} 
                                onChange={(e) => onMaxChange(e.target.value)}
                                className={styles.rangeSelect}
                            >
                                <option value="">Any</option>
                                {options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FilterBar = ({ filters, onChange, onClear, options }) => {
    // All values from actual dataset
    const regions = ['Central', 'East', 'North', 'South', 'West'];
    const genders = ['Female', 'Male'];
    const categories = ['Beauty', 'Clothing', 'Electronics'];
    const methods = ['Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Wallet'];

    // Dynamic Content (provided by App.jsx from Backend)
    const tags = options?.tags || ['accessories', 'beauty', 'casual', 'cotton', 'fashion', 'formal', 'fragrance-free', 'gadgets', 'makeup', 'organic', 'portable', 'skincare', 'smart', 'unisex', 'wireless'];
    
    // Age range options (18-65 from dataset)
    const ageOptions = Array.from({ length: 48 }, (_, i) => String(18 + i)); // 18 to 65
    
    // Date options - years from dataset (2021-2023)
    const dateOptions = ['2021', '2022', '2023'];

    return (
        <div className={styles.container}>
            <button className={styles.resetBtn} onClick={onClear} title="Reset Filters">
                <RotateCcw size={18} />
            </button>

            <FilterDropdown
                label="Customer Region"
                options={regions}
                selected={filters.region}
                onChange={(val) => onChange('region', val)}
            />
            <FilterDropdown
                label="Gender"
                options={genders}
                selected={filters.gender}
                onChange={(val) => onChange('gender', val)}
            />
            <FilterDropdown
                label="Product Category"
                options={categories}
                selected={filters.category}
                onChange={(val) => onChange('category', val)}
            />
            <FilterDropdown
                label="Payment Method"
                options={methods}
                selected={filters.paymentMethod}
                onChange={(val) => onChange('paymentMethod', val)}
            />
            <FilterDropdown
                label="Tags"
                options={tags}
                selected={filters.tags}
                onChange={(val) => onChange('tags', val)}
            />
            
            <RangeDropdown
                label="Age Range"
                options={ageOptions}
                selectedMin={filters.minAge}
                selectedMax={filters.maxAge}
                onMinChange={(val) => onChange('minAge', val)}
                onMaxChange={(val) => onChange('maxAge', val)}
            />
            
            <RangeDropdown
                label="Date (Year)"
                options={dateOptions}
                selectedMin={filters.startDate ? filters.startDate.substring(0, 4) : ''}
                selectedMax={filters.endDate ? filters.endDate.substring(0, 4) : ''}
                onMinChange={(val) => onChange('startDate', val ? `${val}-01-01` : '')}
                onMaxChange={(val) => onChange('endDate', val ? `${val}-12-31` : '')}
            />
        </div>
    );
};

export default FilterBar;
