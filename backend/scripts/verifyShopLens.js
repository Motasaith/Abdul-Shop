const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api/shoplens/analyze';

async function verifyShopLens(imagePath) {
    if (!fs.existsSync(imagePath)) {
        console.error(`Error: Image file not found at ${imagePath}`);
        process.exit(1);
    }

    console.log(`Testing ShopLens with image: ${imagePath}`);

    // Test just one mode to trigger the log
    const mode = 'fashion';
    console.log(`\n--- Testing Mode: ${mode.toUpperCase()} ---`);
    try {
        const form = new FormData();
        form.append('image', fs.createReadStream(imagePath));
        form.append('mode', mode);

        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        console.log(`Status: ${response.status}`);
        console.log('AI Comment:', response.data.ai_comment);

    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
    }
}

const imageArg = process.argv[2];
if (imageArg) verifyShopLens(imageArg);
else console.log("Please provide image path");
