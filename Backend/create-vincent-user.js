require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');

async function createUser() {
  try {
    await connectDB();

    console.log('Creating user: vincentbet@gmail.com\n');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'vincentbet@gmail.com' });

    if (existingUser) {
      console.log('✅ User already exists');
      console.log(`   Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Active: ${existingUser.isActive}`);
      process.exit(0);
    }

    // Create user (password will be hashed by the pre-save hook)
    const newUser = new User({
      firstName: 'Vincent',
      lastName: 'Bet',
      email: 'vincentbet@gmail.com',
      password: 'password123', // Default password
      role: 'admin', // Make admin for testing
      isActive: true,
      phone: '+254700000001',
      location: 'Nairobi, Kenya'
    });

    await newUser.save();

    console.log('✅ User created successfully!');
    console.log('Email: vincentbet@gmail.com');
    console.log('Password: password123');
    console.log('Role: admin');
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
}

createUser();
