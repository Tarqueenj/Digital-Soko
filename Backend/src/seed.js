require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const User = require('./models/User');
const Product = require('./models/Product');
const Trade = require('./models/Trade');

// Sample data
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@digitalsoko.com',
    password: 'admin123',
    role: 'admin',
    phone: '+254700000001',
  },
  {
    firstName: 'John',
    lastName: 'Seller',
    email: 'john@example.com',
    password: 'password123',
    role: 'seller',
    phone: '+254700000002',
  },
  {
    firstName: 'Jane',
    lastName: 'Buyer',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
    phone: '+254700000003',
  },
  {
    firstName: 'Mike',
    lastName: 'Trader',
    email: 'mike@example.com',
    password: 'password123',
    role: 'seller',
    phone: '+254700000004',
  },
  {
    firstName: 'Sarah',
    lastName: 'Customer',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'customer',
    phone: '+254700000005',
  },
];

const products = [
  // Electronics
  {
    name: 'MacBook Pro 16" M2',
    description: 'High-performance laptop with M2 chip, 16GB RAM, 512GB SSD. Perfect for developers and designers.',
    price: 180000,
    category: 'Electronics',
    condition: 'Like New',
    tradeType: 'TopUp',
    stock: 1,
    tags: ['laptop', 'apple', 'macbook', 'computer'],
    images: [
      {
        public_id: 'sample_macbook',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      },
    ],
  },
  {
    name: 'iPhone 14 Pro Max',
    description: '256GB, Space Black, excellent condition with original box and accessories.',
    price: 120000,
    category: 'Electronics',
    condition: 'Like New',
    tradeType: 'FullAmount',
    stock: 1,
    tags: ['phone', 'iphone', 'apple', 'smartphone'],
    images: [
      {
        public_id: 'sample_iphone',
        url: 'https://images.unsplash.com/photo-1592286927505-4fd4d3d4ef9f?w=500',
      },
    ],
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    description: '512GB, Phantom Black, brand new sealed with warranty.',
    price: 95000,
    category: 'Electronics',
    condition: 'New',
    tradeType: 'Barter',
    stock: 1,
    tags: ['phone', 'samsung', 'android', 'smartphone'],
    images: [
      {
        public_id: 'sample_samsung',
        url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
      },
    ],
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Premium noise-cancelling wireless headphones, barely used.',
    price: 28000,
    category: 'Electronics',
    condition: 'Like New',
    tradeType: 'TopUp',
    stock: 1,
    tags: ['headphones', 'sony', 'audio', 'wireless'],
    images: [
      {
        public_id: 'sample_headphones',
        url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
      },
    ],
  },
  {
    name: 'iPad Air 5th Gen',
    description: '64GB, WiFi, Space Gray with Apple Pencil included.',
    price: 55000,
    category: 'Electronics',
    condition: 'Used',
    tradeType: 'Barter',
    stock: 1,
    tags: ['tablet', 'ipad', 'apple'],
    images: [
      {
        public_id: 'sample_ipad',
        url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
      },
    ],
  },

  // Furniture
  {
    name: 'Modern Office Desk',
    description: 'Solid wood desk with cable management, 150cm x 75cm.',
    price: 25000,
    category: 'Furniture',
    condition: 'Used',
    tradeType: 'FullAmount',
    stock: 1,
    tags: ['desk', 'furniture', 'office', 'wood'],
    images: [
      {
        public_id: 'sample_desk',
        url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500',
      },
    ],
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Herman Miller Aeron-style chair, adjustable, excellent back support.',
    price: 18000,
    category: 'Furniture',
    condition: 'Like New',
    tradeType: 'TopUp',
    stock: 1,
    tags: ['chair', 'furniture', 'office', 'ergonomic'],
    images: [
      {
        public_id: 'sample_chair',
        url: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500',
      },
    ],
  },

  // Sports
  {
    name: 'Mountain Bike - Trek X-Caliber',
    description: '29" wheels, 21-speed, aluminum frame, great for trails.',
    price: 45000,
    category: 'Sports',
    condition: 'Used',
    tradeType: 'Barter',
    stock: 1,
    tags: ['bike', 'bicycle', 'mountain bike', 'sports'],
    images: [
      {
        public_id: 'sample_bike',
        url: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500',
      },
    ],
  },
  {
    name: 'PlayStation 5 Console',
    description: 'PS5 Disc Edition with 2 controllers and 3 games.',
    price: 65000,
    category: 'Electronics',
    condition: 'Like New',
    tradeType: 'TopUp',
    stock: 1,
    tags: ['gaming', 'playstation', 'ps5', 'console'],
    images: [
      {
        public_id: 'sample_ps5',
        url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
      },
    ],
  },

  // Clothing
  {
    name: 'Nike Air Jordan 1 Retro',
    description: 'Size 42, Chicago colorway, authentic, excellent condition.',
    price: 15000,
    category: 'Clothing',
    condition: 'Like New',
    tradeType: 'Barter',
    stock: 1,
    tags: ['shoes', 'sneakers', 'nike', 'jordan'],
    images: [
      {
        public_id: 'sample_sneakers',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      },
    ],
  },

  // Home & Garden
  {
    name: 'Espresso Coffee Machine',
    description: 'Breville Barista Express, semi-automatic, with grinder.',
    price: 32000,
    category: 'Home & Garden',
    condition: 'Used',
    tradeType: 'FullAmount',
    stock: 1,
    tags: ['coffee', 'espresso', 'machine', 'kitchen'],
    images: [
      {
        public_id: 'sample_coffee',
        url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
      },
    ],
  },
  {
    name: 'Smart TV 55" 4K',
    description: 'Samsung QLED, HDR, smart features, wall mount included.',
    price: 48000,
    category: 'Electronics',
    condition: 'Like New',
    tradeType: 'TopUp',
    stock: 1,
    tags: ['tv', 'television', 'samsung', '4k', 'smart'],
    images: [
      {
        public_id: 'sample_tv',
        url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
      },
    ],
  },
];

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Trade.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      // Don't hash password here - the User model pre-save hook will do it
      const user = await User.create(userData);
      
      createdUsers.push(user);
      console.log(`   ✓ Created ${user.role}: ${user.email}`);
    }
    console.log(`✅ ${createdUsers.length} users created\n`);

    // Create products (assign to sellers)
    console.log('📦 Creating products...');
    const sellers = createdUsers.filter(u => u.role === 'seller' || u.role === 'admin');
    const createdProducts = [];
    
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      const seller = sellers[i % sellers.length]; // Distribute products among sellers
      
      const product = await Product.create({
        ...productData,
        seller: seller._id,
      });
      
      createdProducts.push(product);
      console.log(`   ✓ Created: ${product.name} (Ksh ${product.price.toLocaleString()}) - Seller: ${seller.firstName}`);
    }
    console.log(`✅ ${createdProducts.length} products created\n`);

    // Create sample trades
    console.log('🔄 Creating sample trades...');
    const buyers = createdUsers.filter(u => u.role === 'customer');
    const sampleTrades = [
      {
        // Fair barter trade
        requestedItem: createdProducts[1], // iPhone
        offeredItem: createdProducts[4], // iPad
        buyer: buyers[0],
        tradeType: 'BarterPlusMoney',
        moneyAmount: 65000,
      },
      {
        // Money only trade
        requestedItem: createdProducts[5], // Office Desk
        offeredItem: null,
        buyer: buyers[1],
        tradeType: 'MoneyOnly',
        moneyAmount: 25000,
      },
      {
        // Unfair trade (will be flagged)
        requestedItem: createdProducts[0], // MacBook
        offeredItem: createdProducts[9], // Sneakers
        buyer: buyers[0],
        tradeType: 'BarterOnly',
        moneyAmount: 0,
      },
      {
        // Fair barter + money
        requestedItem: createdProducts[8], // PS5
        offeredItem: createdProducts[3], // Headphones
        buyer: buyers[1],
        tradeType: 'BarterPlusMoney',
        moneyAmount: 37000,
      },
      {
        // Pending barter trade
        requestedItem: createdProducts[7], // Mountain Bike
        offeredItem: createdProducts[10], // Coffee Machine
        buyer: buyers[0],
        tradeType: 'BarterPlusMoney',
        moneyAmount: 13000,
      },
    ];

    const createdTrades = [];
    for (const tradeData of sampleTrades) {
      const { requestedItem, offeredItem, buyer, tradeType, moneyAmount } = tradeData;
      
      let offeringValue = moneyAmount || 0;
      if (offeredItem) {
        offeringValue += offeredItem.price;
      }

      const trade = await Trade.create({
        requestedItem: {
          itemId: requestedItem._id,
          name: requestedItem.name,
          price: requestedItem.price,
          image: requestedItem.images[0]?.url || '',
        },
        offeredItem: offeredItem ? {
          itemId: offeredItem._id,
          name: offeredItem.name,
          price: offeredItem.price,
          image: offeredItem.images[0]?.url || '',
        } : null,
        buyer: buyer._id,
        seller: requestedItem.seller,
        tradeType,
        moneyAmount,
        offeringValue,
        requestingValue: requestedItem.price,
      });

      createdTrades.push(trade);
      
      const statusIcon = trade.needsReview ? '⚠️' : '✓';
      const fairnessColor = trade.fairnessScore >= 70 ? '🟢' : trade.fairnessScore >= 50 ? '🟡' : '🔴';
      
      console.log(`   ${statusIcon} Trade: ${requestedItem.name} ← ${offeredItem?.name || 'Cash'} + Ksh ${moneyAmount.toLocaleString()}`);
      console.log(`      ${fairnessColor} Fairness: ${trade.fairnessScore}% | Status: ${trade.status}`);
    }
    console.log(`✅ ${createdTrades.length} trades created\n`);

    // Approve some trades
    console.log('✅ Approving some trades...');
    const admin = createdUsers.find(u => u.role === 'admin');
    
    // Approve the fair trades
    await Trade.findByIdAndUpdate(createdTrades[0]._id, {
      status: 'Approved',
      approvedBy: admin._id,
      approvedDate: new Date(),
    });
    console.log('   ✓ Approved fair barter+money trade');

    await Trade.findByIdAndUpdate(createdTrades[1]._id, {
      status: 'Approved',
      approvedBy: admin._id,
      approvedDate: new Date(),
    });
    console.log('   ✓ Approved money-only trade');

    // Reject the unfair trade
    await Trade.findByIdAndUpdate(createdTrades[2]._id, {
      status: 'Rejected',
      rejectedBy: admin._id,
      rejectedDate: new Date(),
      rejectionReason: 'Price difference too large (91.7%). Unfair to seller.',
    });
    console.log('   ✓ Rejected unfair trade\n');

    // Summary
    console.log('📊 SEEDING SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`   - Admins: ${createdUsers.filter(u => u.role === 'admin').length}`);
    console.log(`   - Sellers: ${createdUsers.filter(u => u.role === 'seller').length}`);
    console.log(`   - Customers: ${createdUsers.filter(u => u.role === 'customer').length}`);
    console.log(`\n📦 Products created: ${createdProducts.length}`);
    console.log(`   - Total value: Ksh ${createdProducts.reduce((sum, p) => sum + p.price, 0).toLocaleString()}`);
    console.log(`\n🔄 Trades created: ${createdTrades.length}`);
    console.log(`   - Pending: ${createdTrades.filter(t => t.status === 'Pending').length}`);
    console.log(`   - Approved: 2`);
    console.log(`   - Rejected: 1`);
    console.log(`   - Flagged for review: ${createdTrades.filter(t => t.needsReview).length}`);
    
    console.log('\n🔐 LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('Admin:');
    console.log('  Email: admin@digitalsoko.com');
    console.log('  Password: admin123');
    console.log('\nSeller:');
    console.log('  Email: john@example.com');
    console.log('  Password: password123');
    console.log('\nCustomer:');
    console.log('  Email: jane@example.com');
    console.log('  Password: password123');
    
    console.log('\n✅ Database seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seeding
seedDatabase();
