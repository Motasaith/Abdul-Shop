const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

const testProduct = {
    name: 'HaggleAI Test Jacket',
    description: 'A genuine leather jacket perfect for testing HaggleAI.',
    price: 100.00,
    floorPrice: 80.00, // $80 floor
    category: 'Clothing',
    brand: 'TestBrand',
    countInStock: 10,
    images: [{ public_id: 'test_jacket_1', url: 'https://via.placeholder.com/150' }],
    tags: ['jacket', 'leather', 'test'],
    rating: 0,
    numReviews: 0
};

const seedTest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        let admin = await User.findOne({ email: 'admin@ecommerce.com' });
        if (!admin) {
            // Find any user if admin not found, just for dev
            admin = await User.findOne({});
        }

        if (!admin) {
            console.log("No user found to assign product to.");
            process.exit(1);
        }

        const productData = {
            ...testProduct,
            owner: admin._id,
            createdBy: admin._id
        };

        const product = await Product.findOneAndUpdate(
            { name: testProduct.name },
            { $set: productData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('Test Product Created/Updated:', product.name);
        console.log('ID:', product._id);
        console.log('Price: $100, Floor: $80');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedTest();
