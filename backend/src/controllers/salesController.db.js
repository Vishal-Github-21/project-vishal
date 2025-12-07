/**
 * Sales Controller - Database Version
 * Uses PostgreSQL for querying sales data
 */

const db = require('../db/connection');

/**
 * Get sales data with filtering, sorting, and pagination
 */
const getSales = async (req, res) => {
    try {
        const {
            search,
            region,
            gender,
            minAge,
            maxAge,
            category,
            tags,
            paymentMethod,
            startDate,
            endDate,
            sortBy,
            sortOrder = 'asc',
            page = 1,
            limit = 10
        } = req.query;

        // VALIDATION: Check for invalid input ranges
        if (minAge && maxAge && parseInt(minAge) > parseInt(maxAge)) {
            return res.status(400).json({
                message: 'Invalid age range: minimum age cannot be greater than maximum age',
                error: 'INVALID_AGE_RANGE'
            });
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                message: 'Invalid date range: start date cannot be after end date',
                error: 'INVALID_DATE_RANGE'
            });
        }

        // Build WHERE clause dynamically
        const conditions = [];
        const params = [];
        let paramCount = 0;

        // 1. Search (Full-text search across multiple fields)
        if (search) {
            const searchTerms = search.split(',').map(term => term.trim()).filter(term => term.length > 0);
            
            searchTerms.forEach(term => {
                paramCount++;
                conditions.push(`(
                    LOWER(customer_name) LIKE LOWER($${paramCount}) OR
                    phone_number LIKE $${paramCount} OR
                    LOWER(product_name) LIKE LOWER($${paramCount}) OR
                    LOWER(product_category) LIKE LOWER($${paramCount})
                )`);
                params.push(`%${term}%`);
            });
        }

        // 2. Region filter (multi-select)
        if (region) {
            const regions = region.split(',');
            paramCount++;
            conditions.push(`customer_region = ANY($${paramCount})`);
            params.push(regions);
        }

        // 3. Gender filter (multi-select)
        if (gender) {
            const genders = gender.split(',');
            paramCount++;
            conditions.push(`gender = ANY($${paramCount})`);
            params.push(genders);
        }

        // 4. Age range filter
        if (minAge) {
            paramCount++;
            conditions.push(`age >= $${paramCount}`);
            params.push(parseInt(minAge));
        }
        if (maxAge) {
            paramCount++;
            conditions.push(`age <= $${paramCount}`);
            params.push(parseInt(maxAge));
        }

        // 5. Product category filter (multi-select)
        if (category) {
            const categories = category.split(',');
            paramCount++;
            conditions.push(`product_category = ANY($${paramCount})`);
            params.push(categories);
        }

        // 6. Tags filter (contains any of the specified tags)
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim());
            const tagConditions = tagList.map(tag => {
                paramCount++;
                params.push(`%${tag}%`);
                return `LOWER(tags) LIKE LOWER($${paramCount})`;
            });
            conditions.push(`(${tagConditions.join(' OR ')})`);
        }

        // 7. Payment method filter (multi-select)
        if (paymentMethod) {
            const methods = paymentMethod.split(',');
            paramCount++;
            conditions.push(`payment_method = ANY($${paramCount})`);
            params.push(methods);
        }

        // 8. Date range filter
        if (startDate) {
            paramCount++;
            conditions.push(`date >= $${paramCount}`);
            params.push(startDate);
        }
        if (endDate) {
            paramCount++;
            conditions.push(`date <= $${paramCount}`);
            params.push(endDate);
        }

        // Build WHERE clause
        const whereClause = conditions.length > 0 
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        // 3. Build ORDER BY clause
        let orderByClause = 'ORDER BY date DESC'; // Default sort
        
        if (sortBy) {
            // Map frontend field names to database column names
            const columnMap = {
                'Customer Name': 'customer_name',
                'Date': 'date',
                'Age': 'age',
                'Quantity': 'quantity',
                'Total Amount': 'total_amount',
                'Final Amount': 'final_amount',
                'Discount': 'discount_percentage',
                'Product Category': 'product_category',
                'Customer Region': 'customer_region',
                'Payment Method': 'payment_method'
            };
            
            const dbColumn = columnMap[sortBy] || sortBy.toLowerCase().replace(/ /g, '_');
            const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            orderByClause = `ORDER BY ${dbColumn} ${direction}`;
        }

        // 4. Calculate stats (before pagination)
        const statsQuery = `
            SELECT 
                COALESCE(SUM(quantity), 0) as total_units,
                COALESCE(SUM(final_amount), 0) as total_amount,
                COALESCE(SUM(total_amount - final_amount), 0) as total_discount,
                COUNT(*) as total_records
            FROM sales_transactions
            ${whereClause}
        `;

        const statsResult = await db.query(statsQuery, params);
        const stats = {
            totalUnits: parseInt(statsResult.rows[0].total_units),
            totalAmount: Math.round(parseFloat(statsResult.rows[0].total_amount) * 100) / 100,
            totalDiscount: Math.round(parseFloat(statsResult.rows[0].total_discount) * 100) / 100
        };
        const totalRecords = parseInt(statsResult.rows[0].total_records);

        // 5. Pagination
        const limitNum = parseInt(limit) || 10;
        const totalPages = Math.ceil(totalRecords / limitNum);
        let pageNum = parseInt(page) || 1;
        
        if (pageNum < 1) pageNum = 1;
        if (pageNum > totalPages && totalPages > 0) pageNum = totalPages;

        const offset = (pageNum - 1) * limitNum;

        // 6. Get paginated data
        const dataQuery = `
            SELECT 
                transaction_id as "Transaction ID",
                date as "Date",
                customer_id as "Customer ID",
                customer_name as "Customer Name",
                phone_number as "Phone Number",
                gender as "Gender",
                age as "Age",
                customer_region as "Customer Region",
                customer_type as "Customer Type",
                product_id as "Product ID",
                product_name as "Product Name",
                brand as "Brand",
                product_category as "Product Category",
                tags as "Tags",
                quantity as "Quantity",
                price_per_unit as "Price per Unit",
                discount_percentage as "Discount Percentage",
                total_amount as "Total Amount",
                final_amount as "Final Amount",
                payment_method as "Payment Method",
                order_status as "Order Status",
                delivery_type as "Delivery Type",
                store_id as "Store ID",
                store_location as "Store Location",
                salesperson_id as "Salesperson ID",
                employee_name as "Employee Name"
            FROM sales_transactions
            ${whereClause}
            ${orderByClause}
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        const dataResult = await db.query(dataQuery, [...params, limitNum, offset]);

        // 7. Get unique tags for filters (from all data, not filtered)
        const tagsQuery = `
            SELECT DISTINCT unnest(string_to_array(tags, ',')) as tag
            FROM sales_transactions
            WHERE tags IS NOT NULL AND tags != ''
            ORDER BY tag
        `;
        const tagsResult = await db.query(tagsQuery);
        const uniqueTags = tagsResult.rows
            .map(row => row.tag.trim())
            .filter(tag => tag.length > 0);

        // 8. Send response
        res.json({
            data: dataResult.rows,
            stats,
            filters: {
                tags: uniqueTags
            },
            pagination: {
                total: totalRecords,
                page: pageNum,
                limit: limitNum,
                totalPages: totalPages
            }
        });

    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { getSales };
