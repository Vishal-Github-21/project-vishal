# Retail Sales Management System

A modern, full-stack Retail Sales Management dashboard built with **React**, **Node.js**, and **Express**. This application allows users to visualize, search, filter, and manage sales transactions from a large CSV dataset.

![UI Screenshot](https://via.placeholder.com/800x600?text=Dashboard+Preview)

## Features

### 📊 Dashboard & Analytics
- **Overview Dashboard**: A clean "Welcome" view with key system status.
- **Stats Cards**: Real-time aggregation of `Total Units Sold`, `Total Quantity`, and `Discount Given` based on current filters.

### 🔍 Search & Filtering
- **Dynamic Search**: Instant search by Customer Name or Phone Number.
- **Advanced Filtering**: 
    - **Filter Bar**: Filter by Region, Gender, Category, Payment Method, Tags, and Date.
    - **Dynamic Options**: Tags and Date dropdowns are populated directly from the dataset.
- **Clear Filters**: One-click reset button.

### 📋 Data Table
- **Responsive Table**: Displays Transaction ID, Customer details, Product info, and Prices.
- **Sorting**: dedicated "Sort By" dropdown for Price, Quantity, Date, etc. (Handles numeric sorting correctly!).
- **Pagination**: 
    - Centered, numbered controls (`1 ... 5 6 7 ... 100`).
    - **Go-To Page**: Jump quickly to any specific page.

---

## Tech Stack

- **Frontend**: React (Vite), CSS Modules, Lucide React (Icons).
- **Backend**: Node.js, Express, `csv-parser` for data ingestion.
- **Data**: In-memory processing of `truestate_assignment_dataset.csv`.

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd TruEstate
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

You need to run **two separate terminals** (one for backend, one for frontend).

**Terminal 1 (Backend):**
```bash
cd backend
npm start
# Server runs on http://localhost:5001
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## Project Structure

```
TruEstate/
├── backend/
│   ├── data/                   # Place CSV file here
│   ├── src/
│   │   ├── controllers/        # Logic for Search, Sort, Filter
│   │   ├── utils/              # CSV Parsing logic
│   │   └── index.js            # Express Server entry
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/         # Reusable UI Components
    │   │   ├── Sidebar         # Navigation
    │   │   ├── FilterBar       # Complex Filtering
    │   │   ├── Pagination      # Advanced Paging
    │   │   ├── SalesTable      # Data Display
    │   │   └── ...
    │   ├── App.jsx             # Main Layout & State
    │   └── styles/             # Global CSS
    └── package.json
```

## Potential Future Enhancements
- **Authentication**: Login/Signup for Sales Agents vs. Managers.
- **Data Visualization**: Charts/Graphs using Recharts or Chart.js on the Dashboard.
- **Export to CSV**: Allow users to download the filtered dataset.
- **Dark Mode**: Toggle between Light and Dark themes.

---

**Developed by**: [Your Name/Team]
