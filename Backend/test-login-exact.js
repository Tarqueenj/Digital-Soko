require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');

async function testLogin() {
  try {
    await connectDB();
    
    console.log('🔍 Testing login with exact credentials...\n');
    
    const testEmail = 'admin@example.com';
    const testPassword = 'admin123';
    
    // Find user exactly as the auth controller does
    const user = await User.findOne({ email: testEmail }).select('+password');
    
    if (!user) {
      console.log('❌ User not found with email:', testEmail);
      
      // List all users to debug
      console.log('\nAll users in database:');
      const allUsers = await User.find({}).select('email firstName lastName role isActive');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.firstName} ${u.lastName}) - Role: ${u.role} - Active: ${u.isActive}`);
      });
      
      process.exit(1);
    }
    
    console.log('✅ User found:', user.email);
    console.log('   Name:', user.firstName, user.lastName);
    console.log('   Role:', user.role);
    console.log('   Active:', user.isActive);
    
    // Test password comparison exactly as auth controller does
    console.log('\n🔐 Testing password comparison...');
    const isPasswordMatch = await user.comparePassword(testPassword);
    
    if (isPasswordMatch) {
      console.log('✅ Password matches! Login should work.');
      
      // Generate token to verify JWT works
      const token = user.generateAuthToken();
      console.log('✅ Token generated successfully');
      console.log('   Token preview:', token.substring(0, 50) + '...');
      
    } else {
      console.log('❌ Password does NOT match!');
      console.log('   This is why login is failing.');
      
      // Debug password hash
      console.log('\n🔍 Password debug:');
      console.log('   Stored hash:', user.password);
      console.log('   Test password:', testPassword);
      
      // Try manual bcrypt comparison
      const bcrypt = require('bcryptjs');
      const manualTest = await bcrypt.compare(testPassword, user.password);
      console.log('   Manual bcrypt test:', manualTest ? '✅ PASS' : '❌ FAIL');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
}

testLogin();
