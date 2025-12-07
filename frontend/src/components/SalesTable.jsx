import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import styles from './SalesTable.module.css';

const SalesTable = ({ data, sortBy, sortOrder, onSort, visibleColumns = {} }) => {
    const handleSort = (field) => {
        // Toggle order if clicking same field
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        onSort(field, newOrder);
    };

    const renderSortIcon = (field) => {
        if (sortBy !== field) return null;
        return sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
    };

    const isVisible = (columnKey) => visibleColumns[columnKey] !== false;

    if (!data || data.length === 0) {
        return <div className={styles.emptyState}>No results found.</div>;
    }

    // Fields to display: Transaction Table (List/Grid) - All filter-related columns
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {isVisible('transactionId') && <th onClick={() => handleSort('Transaction ID')}>Transaction ID</th>}
                        {isVisible('date') && <th onClick={() => handleSort('Date')}>Date {renderSortIcon('Date')}</th>}
                        {isVisible('customerId') && <th>Customer ID</th>}
                        {isVisible('customerName') && <th onClick={() => handleSort('Customer Name')}>Customer Name {renderSortIcon('Customer Name')}</th>}
                        {isVisible('phoneNumber') && <th>Phone Number</th>}
                        {isVisible('gender') && <th>Gender</th>}
                        {isVisible('age') && <th onClick={() => handleSort('Age')}>Age {renderSortIcon('Age')}</th>}
                        {isVisible('customerRegion') && <th>Customer Region</th>}
                        {isVisible('productCategory') && <th>Product Category</th>}
                        {isVisible('tags') && <th>Tags</th>}
                        {isVisible('totalAmount') && <th onClick={() => handleSort('Total Amount')}>Total Amount {renderSortIcon('Total Amount')}</th>}
                        {isVisible('paymentMethod') && <th>Payment Method</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item['Transaction ID']}>
                            {isVisible('transactionId') && <td className={styles.metric}>{item['Transaction ID']}</td>}
                            {isVisible('date') && <td>{item['Date']}</td>}
                            {isVisible('customerId') && <td>{item['Customer ID']}</td>}
                            {isVisible('customerName') && <td><div className={styles.customerName}>{item['Customer Name']}</div></td>}
                            {isVisible('phoneNumber') && <td>{item['Phone Number']}</td>}
                            {isVisible('gender') && <td>{item['Gender']}</td>}
                            {isVisible('age') && <td className={styles.metric}>{item['Age']}</td>}
                            {isVisible('customerRegion') && <td>{item['Customer Region']}</td>}
                            {isVisible('productCategory') && <td><div className={styles.productName}>{item['Product Category']}</div></td>}
                            {isVisible('tags') && <td><div className={styles.tags}>{item['Tags']}</div></td>}
                            {isVisible('totalAmount') && <td className={styles.price}>₹{item['Total Amount']?.toLocaleString()}</td>}
                            {isVisible('paymentMethod') && <td>{item['Payment Method']}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SalesTable;
