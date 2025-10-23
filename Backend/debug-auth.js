require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');

async function debugAuth() {
  try {
    await connectDB();

    console.log('🔍 Checking admin user...\n');

    // Check if admin exists
    const admin = await User.findOne({ email: 'admin@example.com' }).select('+password');

    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Available users:');
      const users = await User.find({}).select('email firstName lastName role');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role}`);
      });
    } else {
      console.log('✅ Admin user found:');
      console.log(`  Email: ${admin.email}`);
      console.log(`  Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  Active: ${admin.isActive}`);
      console.log(`  Password hash: ${admin.password}`);

      // Test password
      console.log('\n🧪 Testing password...');
      const isMatch = await bcrypt.compare('admin123', admin.password);
      console.log(`  Password 'admin123' matches: ${isMatch ? '✅ YES' : '❌ NO'}`);

      // Test login simulation
      console.log('\n🔐 Testing login simulation...');
      const token = admin.generateAuthToken();
      console.log(`  Generated token: ${token.substring(0, 50)}...`);
      console.log(`  Token role: ${admin.role}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugAuth();
