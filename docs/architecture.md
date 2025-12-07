# Architecture Document

## Overview
The Retail Sales Management System is a full-stack application designed to handle large datasets with performant search, filtering, and pagination. It follows a clean separation of concerns between the frontend (UI/UX) and backend (Data Processing & API).

## Backend Architecture
**Stack**: Node.js, Express
**Responsibility**: Data serving, Business logic, filtering engine.

- **Entry Point**: `src/index.js` initializes the server and loads data into memory.
- **Data Layer**: `src/utils/dataProcessor.js` reads the CSV file on startup and parses it into an in-memory array of objects. This ensures fast read operations (O(1) access, O(N) filtering) suitable for the provided dataset size.
- **Controller**: `src/controllers/salesController.js` contains the core business logic. It applies filters sequentially:
    1. Text Search (Includes check)
    2. Multi-select categorical filters (Array includes)
    3. Range filters (Date, Numeric comparison)
    4. Sorting (Array sort with custom comparator)
    5. Pagination (Slice)
- **Routes**: `src/routes/salesRoutes.js` exposes the REST API.

## Frontend Architecture
**Stack**: React, Vite, CSS Modules
**Responsibility**: User Interface, State Management, API Integration.

- **Component Structure**:
    - `App.jsx`: Central state manager. usage of `useDebounce` hook for performance.
    - `SearchBar`: Controlled input component.
    - `FilterPanel`: Sidebar for complex filtering interactions.
    - `SalesTable`: Presentational component displaying the data grid.
    - `Pagination`: Functional component for navigation controls.
- **Styling**: `styles/global.css` (Variables, Reset) + CSS Modules (Component isolation).
- **Service Layer**: `services/api.js` abstracts Axios calls, providing a clean interface for data fetching.

## Data Flow
1. **User Action**: User types in SearchBar or selects a Filter.
2. **State Update**: React state updates. `debouncedSearch` waits for input to settle.
3. **API Call**: `useEffect` triggers `fetchSales` with new query parameters.
4. **Backend Processing**: Express receives request -> Controller applies filters to in-memory data -> Returns JSON.
5. **UI Update**: Frontend receives new data list + pagination metadata -> Renders `SalesTable`.

## Folder Structure
```
root/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── utils/
│   │   └── index.js
│   └── data/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
└── docs/
```
