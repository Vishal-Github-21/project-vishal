# Backend - Retail Sales Management System

Rest API service handling data processing and retrieval.

## Setup
```bash
npm install
npm start
```

## API Endpoints

### GET /api/sales
Retrieve sales data.

**Parameters:**
- `page`: Page number (default 1)
- `limit`: Items per page (default 10)
- `search`: Search term
- `sortBy`: Field to sort by
- `sortOrder`: 'asc' or 'desc'
- `region`: Comma-separated regions
- `gender`: Comma-separated genders
- `category`: Comma-separated categories
