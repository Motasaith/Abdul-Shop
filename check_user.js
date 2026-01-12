const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findById('6877a5c385180a512c89c30e');
        console.log('User found:', user);
        if (user) {
            console.log('Email Verified:', user.emailVerified);
            if (!user.emailVerified) {
                console.log('Verifying user now...');
                user.emailVerified = true;
                await user.save();
                console.log('User manually verified!');
            }
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkUser();
