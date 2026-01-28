const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Configuration
const API_URL = 'http://localhost:5000/api/haggle/negotiate';
const PRODUCT_NAME = 'HaggleAI Test Jacket';

const runVerification = async () => {
    console.log('--- Starting HaggleAI Verification ---');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const product = await Product.findOne({ name: PRODUCT_NAME });

        if (!product) {
            console.error('Test product not found. Run seedHaggleTest.js first.');
            process.exit(1);
        }

        const productId = product._id;
        const floorPrice = product.floorPrice;
        console.log(`Testing with Product: ${product.name} (Floor: $${floorPrice})`);

        // Test 1: Lowball Offer (Should Reject)
        console.log('\nTest 1: Sending Lowball Offer ($50)...');
        try {
            const res1 = await axios.post(API_URL, {
                productId: productId,
                offer: 50
            });
            console.log('Response:', res1.data);
            if (res1.data.data.status === 'rejected') {
                console.log('✅ PASS: Lowball offer rejected.');
            } else {
                console.log('❌ FAIL: Lowball offer accepted?');
            }
        } catch (err) {
            console.log('Error in Test 1:', err.response ? err.response.data : err.message);
        }

        // Test 2: Good Offer (Should Accept)
        console.log('\nTest 2: Sending Good Offer ($90)...');
        try {
            const res2 = await axios.post(API_URL, {
                productId: productId,
                offer: 90
            });
            console.log('Response:', res2.data);
            if (res2.data.data.status === 'accepted') {
                console.log('✅ PASS: Good offer accepted.');
            } else {
                console.log('❌ FAIL: Good offer rejected?');
            }
        } catch (err) {
            console.log('Error in Test 2:', err.response ? err.response.data : err.message);
        }

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

// We need the server running for axios to hit localhost:5000
// Checking if we can run this standalone or need to start server.
// Since we are in the same environment, we can't easily "start server in background" and run this script 
// without complex orchestration in this shell. 
// BUT, I can just interpret the logic directly if I mock the request, OR I can assume the user has the server running?
// Actually, `run_command` can run background processes.
// Let's first check if the server is running. If not, I'll start it.

runVerification();
