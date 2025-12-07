# TruEstate: Retail Sales Management System - AI Coding Agent Guide

## Architecture Overview

**Full-stack React + Node.js/Express dashboard** for managing large sales datasets with real-time search, filtering, and pagination. The system uses **in-memory data processing** on the backend for fast filtering operations.

### Key Components & Data Flow
1. **Backend** (`backend/src/`): Express server loads CSV into memory on startup, applies sequential filters
2. **Frontend** (`frontend/src/`): React app with debounced search, multi-select filters, dynamic pagination
3. **Data Flow**: User action → State update → debounced API call → Backend filters in-memory array → Response with data + pagination metadata

### Critical Files
- **Backend entry**: `backend/src/index.js` - loads data via `dataProcessor`, initializes routes
- **Filter logic**: `backend/src/controllers/salesController.js` - sequentially applies: search → categorical filters → range filters → sort → pagination
- **Frontend state manager**: `frontend/src/App.jsx` - manages search, filters, sort, pagination, current view (dashboard vs nexus)
- **API abstraction**: `frontend/src/services/api.js` - single fetch function with query params

---

## Development Workflows

### Running the Application
Requires **two separate terminals**:
```bash
# Terminal 1: Backend (Node.js/Express)
cd backend && npm start  # Port 5001

# Terminal 2: Frontend (Vite dev server)
cd frontend && npm run dev  # Port 5173
```

### Building for Production
```bash
# Backend: Copy backend/ folder to production
# Frontend: 
cd frontend && npm run build  # Outputs to dist/
npm run preview  # Test production build locally
```

### Code Quality
```bash
# Frontend linting
cd frontend && npm run lint
```

---

## Project-Specific Conventions

### Backend Query Parameter Format
All filters use **comma-separated strings** in query params (converted to arrays in controller):
```javascript
// Valid API calls:
/api/sales?region=North,South&gender=Male,Female&category=Electronics
// In controller: region.split(',') → ['North', 'South']
```

### Frontend State Management Pattern (App.jsx)
- **Three state layers**: Raw user input (`search`, `filters`), processed values (`debouncedSearch`), API results (`data`, `pagination`)
- **Debouncing**: `useDebounce` hook (300ms) prevents excessive API calls during typing
- **Page reset**: Any filter/search change resets pagination to page 1
- **View switching**: `currentView` toggles between 'dashboard' and 'nexus' - only fetch data when in 'nexus' view

### CSS Organization
- **Global styles**: `frontend/src/styles/global.css` (variables, reset)
- **Component isolation**: Each component has `.module.css` file (e.g., `SalesTable.module.css`)
- **Import pattern**: `import styles from './ComponentName.module.css'` → `className={styles.className}`

### Data Type Conversions
Backend `dataProcessor.js` converts CSV strings during load (not runtime):
```javascript
'Age': parseInt(data['Age'], 10),
'Quantity': parseInt(data['Quantity'], 10),
'Price per Unit': parseFloat(...),
// Dates kept as strings (CSV format), parsed during filtering if needed
```

---

## Integration Points & External Dependencies

### Backend Dependencies
- **express**: Server framework
- **csv-parser**: Streams CSV file into objects (used in `dataProcessor.js`)
- **cors**: Enables frontend cross-origin requests
- **dotenv**: Environment variables (e.g., PORT)

### Frontend Dependencies
- **axios**: HTTP client for `api.js`
- **lucide-react**: Icon library (e.g., ArrowUp/ArrowDown in SalesTable)
- **react**, **react-dom**: UI framework
- **Vite**: Dev server & build tool

### Cross-Component Communication
- **No prop drilling**: App.jsx passes callbacks (`handleFilterChange`, `handleSearchChange`, `handleSortChange`)
- **FilterPanel** → updates App state → triggers `loadData()` → fetches from `/api/sales`
- **SalesTable** receives `sortBy`, `sortOrder`, `onSort` callback to avoid managing sort state in table

---

## Common Development Patterns

### Adding a New Filter
1. Add field to `backend/src/controllers/salesController.js` getSales function (before sorting)
2. Add query param parsing: `const { newFilter } = req.query`
3. Add filter logic: `if (newFilter) { results = results.filter(...) }`
4. Add UI component in `frontend/src/components/FilterBar.jsx` or `FilterPanel.jsx`
5. Add state in App.jsx: `filters: { ..., newFilter: '' }`
6. Connect via `handleFilterChange` callback

### Modifying Sorting
- Frontend: `SalesTable.jsx` defines clickable columns, calls `onSort(field, newOrder)`
- Backend: `salesController.js` handles sort with custom comparator for numeric/date fields
- Note: Numeric fields must be pre-parsed in `dataProcessor.js` for correct sorting

### Pagination Implementation
- **Backend**: Returns `pagination: { page, totalPages, total }`
- **Frontend**: `Pagination.jsx` displays numbered controls, `App.jsx` manages current `page` state
- **Reset on filter**: Any filter change → `setPagination({ page: 1 })`

---

## Performance Considerations

### In-Memory Data Strategy
- **Why**: CSV loaded once at startup → O(N) filtering instead of database queries
- **Trade-off**: Limited to dataset size that fits in Node.js heap (~500MB-1GB typical)
- **When to change**: If dataset > 100K rows and response time > 1s, consider paginated backend sorting or database

### Frontend Optimization
- **Debouncing search** (300ms in `useDebounce.js`) prevents API call on every keystroke
- **useCallback in App.jsx** ensures stable references for dependent effects
- **CSS Modules** prevent style conflicts without CSS-in-JS overhead

---

## Testing & Debugging

### Backend
- Health check: `curl http://localhost:5001/` (returns "API is running...")
- Test endpoint: `curl "http://localhost:5001/api/sales?search=John&limit=5"`
- Check data load: Server logs `"Loaded X sales records."`

### Frontend
- React DevTools: Inspect component state, especially `filters` and `pagination`
- Network tab: Verify query params are correctly serialized (e.g., `region=North,South`)
- Console errors: Check for CORS issues (backend PORT must match axios API_URL)

---

## Known Limitations & Future Improvements

- **No persistence**: Filters not saved to URL/localStorage (page refresh resets state)
- **CSV-only**: Hard-coded path `backend/data/truestate_assignment_dataset.csv`
- **No error boundaries**: Frontend error in one component may crash entire app
- **No sorting validation**: Backend doesn't validate sort field exists in CSV
