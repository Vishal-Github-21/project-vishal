import React, { useState } from 'react';
import { Download } from 'lucide-react';
import styles from './ExportButton.module.css';

const ExportButton = ({ data, filters }) => {
    const [exporting, setExporting] = useState(false);

    const exportToCSV = () => {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        setExporting(true);

        try {
            // Prepare CSV headers
            const headers = [
                'Transaction ID',
                'Date',
                'Customer ID',
                'Customer Name',
                'Phone Number',
                'Gender',
                'Age',
                'Customer Region',
                'Customer Type',
                'Product ID',
                'Product Name',
                'Brand',
                'Product Category',
                'Tags',
                'Quantity',
                'Price per Unit',
                'Discount Percentage',
                'Total Amount',
                'Final Amount',
                'Payment Method',
                'Order Status',
                'Delivery Type',
                'Store ID',
                'Store Location',
                'Salesperson ID',
                'Employee Name'
            ];

            // Prepare CSV rows
            const rows = data.map(item => [
                item['Transaction ID'] || '',
                item['Date'] || '',
                item['Customer ID'] || '',
                item['Customer Name'] || '',
                item['Phone Number'] || '',
                item['Gender'] || '',
                item['Age'] || '',
                item['Customer Region'] || '',
                item['Customer Type'] || '',
                item['Product ID'] || '',
                item['Product Name'] || '',
                item['Brand'] || '',
                item['Product Category'] || '',
                item['Tags'] || '',
                item['Quantity'] || '',
                item['Price per Unit'] || '',
                item['Discount Percentage'] || '',
                item['Total Amount'] || '',
                item['Final Amount'] || '',
                item['Payment Method'] || '',
                item['Order Status'] || '',
                item['Delivery Type'] || '',
                item['Store ID'] || '',
                item['Store Location'] || '',
                item['Salesperson ID'] || '',
                item['Employee Name'] || ''
            ]);

            // Escape CSV values
            const escapeCSV = (value) => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            };

            // Build CSV content
            const csvContent = [
                headers.map(escapeCSV).join(','),
                ...rows.map(row => row.map(escapeCSV).join(','))
            ].join('\n');

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            // Generate filename with timestamp and active filters
            const timestamp = new Date().toISOString().split('T')[0];
            const filterCount = Object.values(filters).filter(v => v).length;
            const filename = `sales_export_${timestamp}${filterCount > 0 ? '_filtered' : ''}.csv`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Show success message
            setTimeout(() => {
                alert(`Successfully exported ${data.length} records!`);
            }, 100);

        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <button 
            className={styles.exportBtn}
            onClick={exportToCSV}
            disabled={exporting || !data || data.length === 0}
            title={`Export ${data?.length || 0} filtered records to CSV`}
        >
            <Download size={18} />
            {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
    );
};

export default ExportButton;
