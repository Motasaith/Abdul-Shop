const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Import models - assuming running from root
const User = require('./backend/models/User');

const checkUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');
        
        const user = await User.findById('6877a5c385180a512c89c30e');
        console.log('User found:', user ? user.email : 'No user found');
        
        if (user) {
            console.log('Current Email Verified Status:', user.emailVerified);
            if (!user.emailVerified) {
                console.log('Verifying user now...');
                user.emailVerified = true;
                await user.save();
                console.log('✅ User manually verified! Try logging in now.');
            } else {
                console.log('User is already verified.');
            }
        }
    } catch (error) {
        console.error('Error executing script:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit();
    }
};

checkUser();
