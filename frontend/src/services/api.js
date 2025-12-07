import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/sales';

console.log('API URL:', API_URL); // Debug log to verify URL

export const fetchSales = async (params) => {
    try {
        const response = await axios.get(API_URL, { params });
        // Normalize response: backend returns { data: [], pagination: {} }
        return response.data;
    } catch (error) {
        console.error('Error fetching sales data:', error);
        throw error;
    }
};
