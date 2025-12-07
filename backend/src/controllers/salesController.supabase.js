/**
 * Sales Controller - Supabase Version
 * Uses Supabase JS Client for simple queries
 */

const { supabase } = require('../db/supabase');

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

        // VALIDATION
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

        // Build Supabase query
        let query = supabase.from('sales_transactions').select('*', { count: 'exact' });

        // 1. Search (across multiple fields using OR)
        if (search) {
            const searchTerms = search.split(',').map(term => term.trim()).filter(term => term.length > 0);
            
            // Build OR conditions for search
            const orConditions = searchTerms.map(term => 
                `"Customer Name".ilike.%${term}%,"Phone Number".ilike.%${term}%,"Product Name".ilike.%${term}%,"Product Category".ilike.%${term}%`
            ).join(',');
            
            query = query.or(orConditions);
        }

        // 2. Region filter
        if (region) {
            const regions = region.split(',');
            query = query.in('Customer Region', regions);
        }

        // 3. Gender filter
        if (gender) {
            const genders = gender.split(',');
            query = query.in('Gender', genders);
        }

        // 4. Age range
        if (minAge) {
            query = query.gte('Age', parseInt(minAge));
        }
        if (maxAge) {
            query = query.lte('Age', parseInt(maxAge));
        }

        // 5. Category filter
        if (category) {
            const categories = category.split(',');
            query = query.in('Product Category', categories);
        }

        // 6. Tags filter (using ilike for partial match)
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim());
            // Match any tag
            const tagConditions = tagList.map(tag => `"Tags".ilike.%${tag}%`).join(',');
            query = query.or(tagConditions);
        }

        // 7. Payment method filter
        if (paymentMethod) {
            const methods = paymentMethod.split(',');
            query = query.in('Payment Method', methods);
        }

        // 8. Date range
        if (startDate) {
            query = query.gte('Date', startDate);
        }
        if (endDate) {
            query = query.lte('Date', endDate);
        }

        // 9. Sorting
        const sortColumn = sortBy || 'Date';
        const ascending = sortOrder.toLowerCase() !== 'desc';
        query = query.order(sortColumn, { ascending: !ascending }); // Default newest first

        // 10. Pagination
        const limitNum = parseInt(limit) || 10;
        const pageNum = parseInt(page) || 1;
        const offset = (pageNum - 1) * limitNum;
        
        query = query.range(offset, offset + limitNum - 1);

        // Execute query
        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase query error:', error);
            return res.status(500).json({ 
                message: 'Database query failed',
                error: error.message 
            });
        }

        // Calculate stats from the fetched data
        // Note: For accurate stats on filtered data, we'd need a separate query
        // For simplicity, we calculate from the current page (or you can add a stats query)
        const stats = {
            totalUnits: data.reduce((sum, item) => sum + (parseInt(item['Quantity']) || 0), 0),
            totalAmount: Math.round(data.reduce((sum, item) => sum + (parseFloat(item['Final Amount']) || 0), 0) * 100) / 100,
            totalDiscount: Math.round(data.reduce((sum, item) => {
                const total = parseFloat(item['Total Amount']) || 0;
                const final = parseFloat(item['Final Amount']) || 0;
                return sum + (total - final);
            }, 0) * 100) / 100
        };

        // Get unique tags for filters
        const { data: tagsData } = await supabase
            .from('sales_transactions')
            .select('Tags')
            .not('Tags', 'is', null)
            .limit(1000);

        const uniqueTags = [...new Set(
            (tagsData || [])
                .flatMap(item => (item.Tags || '').split(',').map(t => t.trim()))
                .filter(t => t.length > 0)
        )].sort();

        // Calculate pagination
        const total = count || 0;
        const totalPages = Math.ceil(total / limitNum);

        // Send response (same format as original API)
        res.json({
            data: data || [],
            stats,
            filters: {
                tags: uniqueTags
            },
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages
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
