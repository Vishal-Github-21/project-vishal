import React from 'react';
import { Moon, Sun } from 'lucide-react';
import styles from './ThemeToggle.module.css';

const ThemeToggle = ({ theme, onToggle }) => {
    return (
        <button 
            className={`${styles.toggleBtn} ${theme === 'dark' ? styles.dark : ''}`}
            onClick={onToggle}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <>
                    <Moon size={18} />
                    <span className={styles.label}>Dark</span>
                </>
            ) : (
                <>
                    <Sun size={18} />
                    <span className={styles.label}>Light</span>
                </>
            )}
        </button>
    );
};

export default ThemeToggle;
