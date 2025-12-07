-- =====================================================
-- TruEstate Database Schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- =====================================================

-- Drop table if exists (for fresh setup)
DROP TABLE IF EXISTS sales_transactions CASCADE;

-- Create sales_transactions table
CREATE TABLE sales_transactions (
    id SERIAL PRIMARY KEY,
    "Transaction ID" VARCHAR(50) UNIQUE NOT NULL,
    "Date" DATE NOT NULL,
    "Customer ID" VARCHAR(50) NOT NULL,
    "Customer Name" VARCHAR(255) NOT NULL,
    "Phone Number" VARCHAR(20),
    "Gender" VARCHAR(20),
    "Age" INTEGER,
    "Customer Region" VARCHAR(50),
    "Customer Type" VARCHAR(50),
    "Product ID" VARCHAR(50),
    "Product Name" VARCHAR(255),
    "Brand" VARCHAR(100),
    "Product Category" VARCHAR(100),
    "Tags" TEXT,
    "Quantity" INTEGER,
    "Price per Unit" DECIMAL(10, 2),
    "Discount Percentage" DECIMAL(5, 2),
    "Total Amount" DECIMAL(12, 2),
    "Final Amount" DECIMAL(12, 2),
    "Payment Method" VARCHAR(50),
    "Order Status" VARCHAR(50),
    "Delivery Type" VARCHAR(50),
    "Store ID" VARCHAR(50),
    "Store Location" VARCHAR(100),
    "Salesperson ID" VARCHAR(50),
    "Employee Name" VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast filtering
CREATE INDEX idx_customer_name ON sales_transactions("Customer Name");
CREATE INDEX idx_phone_number ON sales_transactions("Phone Number");
CREATE INDEX idx_product_name ON sales_transactions("Product Name");
CREATE INDEX idx_product_category ON sales_transactions("Product Category");
CREATE INDEX idx_date ON sales_transactions("Date");
CREATE INDEX idx_customer_region ON sales_transactions("Customer Region");
CREATE INDEX idx_gender ON sales_transactions("Gender");
CREATE INDEX idx_age ON sales_transactions("Age");
CREATE INDEX idx_payment_method ON sales_transactions("Payment Method");

-- Enable Row Level Security (RLS) but allow all reads for API
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads (for your API)
CREATE POLICY "Allow anonymous read access" ON sales_transactions
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert/update (optional - for admin)
CREATE POLICY "Allow authenticated insert" ON sales_transactions
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- HOW TO UPLOAD YOUR 10K RECORDS:
-- =====================================================
-- Option 1: Use Supabase Dashboard → Table Editor → Import CSV
--   1. Go to Table Editor
--   2. Click on sales_transactions table
--   3. Click "Insert" → "Import data from CSV"
--   4. Upload your CSV file (first 10K rows)
--
-- Option 2: Use this INSERT format for sample data:
-- INSERT INTO sales_transactions (
--     "Transaction ID", "Date", "Customer ID", "Customer Name", 
--     "Phone Number", "Gender", "Age", "Customer Region", "Customer Type",
--     "Product ID", "Product Name", "Brand", "Product Category", "Tags",
--     "Quantity", "Price per Unit", "Discount Percentage", 
--     "Total Amount", "Final Amount", "Payment Method", "Order Status",
--     "Delivery Type", "Store ID", "Store Location", "Salesperson ID", "Employee Name"
-- ) VALUES (
--     '1', '2023-03-23', 'CUST-40823', 'Neha Khan', '9720639364', 
--     'Male', 21, 'East', 'Returning', 'PROD-8721', 'Herbal Face Wash',
--     'SilkSkin', 'Beauty', 'organic,skincare', 5, 4268, 12, 
--     21340, 18779.2, 'UPI', 'Cancelled', 'Standard', 'ST-015', 
--     'Ahmedabad', 'EMP-7554', 'Harsh Agarwal'
-- );
-- =====================================================
