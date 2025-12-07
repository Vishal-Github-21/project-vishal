import { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import SalesTable from './components/SalesTable';
import Pagination from './components/Pagination';
import FilterBar from './components/FilterBar';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import Dashboard from './components/Dashboard';
import SortDropdown from './components/SortDropdown';
import ExportButton from './components/ExportButton';
import ColumnToggle from './components/ColumnToggle';
import LoadingSkeleton from './components/LoadingSkeleton';
import ThemeToggle from './components/ThemeToggle';
import { fetchSales } from './services/api';
import useDebounce from './hooks/useDebounce';
import styles from './App.module.css';

function App() {
  const [currentView, setCurrentView] = useState('nexus'); // 'dashboard' | 'nexus'

  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Dynamic Options from Backend
  const [filterOptions, setFilterOptions] = useState({
    tags: [],
    dates: []
  });

  // State for query params
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('Customer Name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('visibleColumns');
    return saved ? JSON.parse(saved) : {};
  });

  const debouncedSearch = useDebounce(search, 300);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleColumnToggle = (columnKey, value) => {
    const newColumns = { ...visibleColumns };
    if (value !== undefined) {
      newColumns[columnKey] = value;
    } else {
      newColumns[columnKey] = !visibleColumns[columnKey];
    }
    setVisibleColumns(newColumns);
    localStorage.setItem('visibleColumns', JSON.stringify(newColumns));
  };

  const loadData = useCallback(async () => {
    // Check view if needed, but for filters loading we might want them initially.
    // For now, loadData handles list fetching.
    // Only fetch data if we are in the 'nexus' view to save resources,
    // or fetch it anyway if requirements need it ready. 
    // For this assignment, let's fetch when params change, even if hidden, 
    // or just fetch when view is 'nexus'. 
    // Let's stick to fetching when in nexus or if filters change while in nexus.
    if (currentView !== 'nexus') return;

    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: 10,
        search: debouncedSearch,
        sortBy,
        sortOrder,
        ...filters
      };
      const result = await fetchSales(params);
      setData(result.data);
      setStats(result.stats);
      setPagination(result.pagination);

      // Update options if available and not set (or always update to reflect data? usually static list is fine)
      if (result.filters) {
        setFilterOptions(prev => ({
          ...prev,
          tags: result.filters.tags || []
        }));
      }
    } catch (err) {
      // Display backend validation errors or generic error
      const errorMsg = err.response?.data?.message || 'Failed to load data. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, debouncedSearch, sortBy, sortOrder, filters, currentView]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler helpers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const sortOptions = [
    { label: 'Date', value: 'Date' },
    { label: 'Customer Name', value: 'Customer Name' },
    { label: 'Quantity', value: 'Quantity' },
    { label: 'Total Amount', value: 'Total Amount' }
  ];

  return (
    <div className={styles.appContainer}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} theme={theme} onToggleTheme={toggleTheme} />

      <div className={styles.contentArea}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>{currentView === 'dashboard' ? 'Dashboard' : 'Sales Management'}</h1>
          {currentView === 'nexus' && (
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder="Search: Customer Name, Category "
            />
          )}
        </header>

        <main className={styles.main}>
          {currentView === 'dashboard' ? (
            <Dashboard />
          ) : (
            <>
              <div className={styles.filtersRow}>
                <FilterBar
                  filters={filters}
                  onChange={handleFilterChange}
                  onClear={clearFilters}
                  options={filterOptions}
                />
                <SortDropdown
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSortChange}
                  options={sortOptions}
                />
              </div>

              <div className={styles.statsRow}>
                <StatsCards stats={stats} />
              </div>

              <div className={styles.actionsRow}>
                <ExportButton data={data} filters={filters} />
                <ColumnToggle visibleColumns={visibleColumns} onToggle={handleColumnToggle} />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              {loading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  <SalesTable
                    data={data}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSortChange}
                    visibleColumns={visibleColumns}
                  />
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
                  />
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
