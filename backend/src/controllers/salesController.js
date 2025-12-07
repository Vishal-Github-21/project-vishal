const { getSalesData } = require('../utils/dataProcessor');

const getSales = (req, res) => {
    try {
        let results = getSalesData();
        const {
            search,
            region,
            gender,
            minAge,
            maxAge,
            category,
            tags, // comma separated
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

        // 1. Search (Customer Name, Phone Number, Product Name, Product Category)
        // Supports comma-separated search terms (e.g., "aisha, clothing")
        // ALL terms must match (AND logic across terms)
        if (search) {
            const searchTerms = search.split(',').map(term => term.trim().toLowerCase()).filter(term => term.length > 0);
            
            results = results.filter(item => {
                // Item matches if ALL search terms match at least one searchable field
                return searchTerms.every(searchTerm =>
                    (item['Customer Name'] && item['Customer Name'].toLowerCase().includes(searchTerm)) ||
                    (item['Phone Number'] && item['Phone Number'].toString().includes(searchTerm)) ||
                    (item['Product Name'] && item['Product Name'].toLowerCase().includes(searchTerm)) ||
                    (item['Product Category'] && item['Product Category'].toLowerCase().includes(searchTerm))
                );
            });
        }

        // 2. Filters
        // Region (Multi-select)
        if (region) {
            const regions = region.split(',');
            results = results.filter(item => regions.includes(item['Customer Region']));
        }

        // Gender (Multi-select)
        if (gender) {
            const genders = gender.split(',');
            results = results.filter(item => genders.includes(item['Gender']));
        }

        // Age Range
        if (minAge) {
            results = results.filter(item => item['Age'] >= parseInt(minAge));
        }
        if (maxAge) {
            results = results.filter(item => item['Age'] <= parseInt(maxAge));
        }

        // Product Category (Multi-select)
        if (category) {
            const categories = category.split(',');
            results = results.filter(item => categories.includes(item['Product Category']));
        }

        // Tags (Multi-select logic - contains at least one of the tags? or all? usually any)
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim().toLowerCase());
            results = results.filter(item => {
                // Assuming Tags is a comma-separated string in the CSV or array
                // If CSV, it's a string like "Electronics, Gadget"
                if (!item['Tags']) return false;
                const itemTags = item['Tags'].split(',').map(t => t.trim().toLowerCase());
                return tagList.some(tag => itemTags.includes(tag));
            });
        }

        // Payment Method
        if (paymentMethod) {
            const methods = paymentMethod.split(',');
            results = results.filter(item => methods.includes(item['Payment Method']));
        }

        // Date Range
        if (startDate || endDate) {
            results = results.filter(item => {
                const itemDate = new Date(item['Date']);
                if (startDate && new Date(startDate) > itemDate) return false;
                // Set endDate to end of day if only date part is provided? 
                // Standard string comparison works if ISO, but let's trust Date obj
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (itemDate > end) return false;
                }
                return true;
            });
        }


        // 3. Sorting
        if (sortBy) {
            results.sort((a, b) => {
                let valA = a[sortBy];
                let valB = b[sortBy];

                // Numeric fields check
                if (sortBy === 'Quantity' || sortBy === 'Total Amount' || sortBy === 'Age' || sortBy === 'Discount' || sortBy === 'Final Amount') {
                    valA = Number(valA) || 0;
                    valB = Number(valB) || 0;
                    return sortOrder === 'asc' ? valA - valB : valB - valA;
                }

                // Date check
                if (sortBy === 'Date') {
                    return sortOrder === 'asc'
                        ? new Date(valA) - new Date(valB)
                        : new Date(valB) - new Date(valA);
                }

                // String default
                valA = (valA || '').toString().toLowerCase();
                valB = (valB || '').toString().toLowerCase();

                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        } else {
            // Default sort: Date (Newest First)
            results.sort((a, b) => new Date(b['Date']) - new Date(a['Date']));
        }

        // 5. Calculate Stats (on filtered results, before pagination)
        const stats = results.reduce((acc, item) => {
            const qty = Number(item['Quantity']) || 0;
            const finalAmt = Number(item['Final Amount']) || 0;
            const totalAmt = Number(item['Total Amount']) || 0;
            // Assuming Total Amount is pre-discount. If not available, we can calc from price * qty.
            // Discount = Total Amount - Final Amount
            const discount = totalAmt - finalAmt;

            acc.totalUnits += qty;
            acc.totalAmount += finalAmt;
            acc.totalDiscount += discount;
            return acc;
        }, { totalUnits: 0, totalAmount: 0, totalDiscount: 0 });

        // Round money values
        stats.totalAmount = Math.round(stats.totalAmount * 100) / 100;
        stats.totalDiscount = Math.round(stats.totalDiscount * 100) / 100;

        // 6. Pagination
        const limitNum = parseInt(limit) || 10;
        const total = results.length;
        const totalPages = Math.ceil(total / limitNum);

        // Clamp page to valid range (1 to totalPages)
        let pageNum = parseInt(page) || 1;
        if (pageNum < 1) pageNum = 1;
        if (pageNum > totalPages && totalPages > 0) pageNum = totalPages;

        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedResults = results.slice(startIndex, endIndex);

        // 7. Extract Unique Filters (Tags, Categories) for Frontend
        // Ideally this should be a separate endpoint or cached, but for this dataset it's fast enough.
        // We compute this from the COMPLETE dataset or filtered? Usually complete dataset for options.
        // Let's use the processor's full data for options.
        const allData = getSalesData();

        const uniqueTags = [...new Set(allData.flatMap(item =>
            (item['Tags'] || '').split(',').map(t => t.trim()).filter(t => t)
        ))].sort();

        const uniqueDates = [...new Set(allData.map(item => item['Date']))].sort().reverse().slice(0, 50); // Just top 50 recent dates for filter? Or years?
        // User wants "Date" filter. Usually a range. For now let's send recent dates or just years.

        // Metadata for frontend
        res.json({
            data: paginatedResults,
            stats,
            filters: {
                tags: uniqueTags
            },
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: totalPages
            }
        });

    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getSales };
