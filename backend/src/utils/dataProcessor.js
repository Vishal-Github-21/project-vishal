const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let salesData = [];

const loadData = () => {
    return new Promise((resolve, reject) => {
        const dataPath = path.join(__dirname, '../../data/truestate_assignment_dataset.csv');
        const results = [];

        fs.createReadStream(dataPath)
            .pipe(csv())
            .on('data', (data) => {
                // Simple type conversion could happen here if needed, 
                // but for now we keep it raw or do minimal processing
                // We will parse numbers during filtering/sorting or right here.
                // Let's parse numbers here for efficiency.

                const processed = {
                    ...data,
                    'Age': parseInt(data['Age'], 10),
                    'Quantity': parseInt(data['Quantity'], 10),
                    'Price per Unit': parseFloat(data['Price per Unit']),
                    'Discount Percentage': parseFloat(data['Discount Percentage']),
                    'Total Amount': parseFloat(data['Total Amount']),
                    'Final Amount': parseFloat(data['Final Amount']),
                    // Parse date if possible, but the format might need checking. 
                    // Assuming standard format or ISO. If not, we might need moment or custom parsing.
                    // keeping date as string for initial load, will handle checks later or 
                    // assuming it's parsable.
                    // Let's just keep strict types for numbers.
                };
                results.push(processed);
            })
            .on('end', () => {
                salesData = results;
                console.log(`Loaded ${salesData.length} sales records.`);
                resolve(salesData);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

const getSalesData = () => {
    return salesData;
};

module.exports = { loadData, getSalesData };
