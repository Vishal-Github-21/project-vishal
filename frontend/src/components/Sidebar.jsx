import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Box,
    FileInput,
    Receipt,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import styles from './Sidebar.module.css';

const Sidebar = ({ currentView, onViewChange, theme, onToggleTheme }) => {
    const [isServicesOpen, setIsServicesOpen] = useState(true);

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <div className={styles.logo}>V</div>
                <div className={styles.brandInfo}>
                    <div className={styles.brandName}>Vault</div>
                    <div className={styles.userName}>Vishal Mukkannavar</div>
                </div>
            </div>

            <nav className={styles.nav}>
                <div className={styles.navGroup}>
                    <button
                        className={`${styles.navItem} ${currentView === 'dashboard' ? styles.active : ''}`}
                        onClick={() => onViewChange('dashboard')}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${currentView === 'nexus' ? styles.active : ''}`}
                        onClick={() => onViewChange('nexus')}
                    >
                        <Box size={18} />
                        <span>Nexus</span>
                    </button>
                    <button className={styles.navItem}>
                        <FileInput size={18} />
                        <span>Intake</span>
                    </button>
                </div>

                <div className={styles.navGroup}>
                    <div
                        className={styles.groupTitleRow}
                        onClick={() => setIsServicesOpen(!isServicesOpen)}
                    >
                        <span className={styles.groupTitle}>Services</span>
                        {isServicesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>

                    {isServicesOpen && (
                        <div className={styles.subGroup}>
                            <a href="#" className={styles.navItem}>
                                <span className={styles.dot}></span>
                                <span>Pre-active</span>
                            </a>
                            <a href="#" className={styles.navItem}>
                                <span className={styles.dot}></span>
                                <span>Active</span>
                            </a>
                            <a href="#" className={styles.navItem}>
                                <span className={styles.dot}></span>
                                <span>Blocked</span>
                            </a>
                            <a href="#" className={styles.navItem}>
                                <span className={styles.dot}></span>
                                <span>Closed</span>
                            </a>
                        </div>
                    )}
                </div>

                <div className={styles.navGroup}>
                    <div className={styles.groupTitle}>Invoices</div>
                    <a href="#" className={styles.navItem}>
                        <Receipt size={18} />
                        <span>Proforma Invoices</span>
                    </a>
                    <a href="#" className={styles.navItem}>
                        <Receipt size={18} />
                        <span>Final Invoices</span>
                    </a>
                </div>
            </nav>

            <div className={styles.sidebarFooter}>
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
        </aside>
    );
};

export default Sidebar;
