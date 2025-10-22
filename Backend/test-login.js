require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');

async function testLogin() {
  try {
    await connectDB();
    
    console.log('Testing login credentials...\n');
    
    const testCredentials = [
      { email: 'admin@digitalsoko.com', password: 'admin123' },
      { email: 'john@example.com', password: 'password123' },
      { email: 'jane@example.com', password: 'password123' },
    ];
    
    for (const cred of testCredentials) {
      console.log(`Testing: ${cred.email}`);
      
      const user = await User.findOne({ email: cred.email }).select('+password');
      
      if (!user) {
        console.log(`  ❌ User not found\n`);
        continue;
      }
      
      console.log(`  ✓ User found: ${user.firstName} ${user.lastName}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive}`);
      
      const isMatch = await bcrypt.compare(cred.password, user.password);
      
      if (isMatch) {
        console.log(`  ✅ Password matches!\n`);
      } else {
        console.log(`  ❌ Password does NOT match\n`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
