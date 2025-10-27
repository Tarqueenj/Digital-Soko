# Digital Soko - Complete System Documentation

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Backend API](#backend-api)
- [Frontend Features](#frontend-features)
- [Admin Dashboard](#admin-dashboard)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Trade System](#trade-system)
- [Reports System](#reports-system)
- [Deployment](#deployment)

## 🎯 System Overview

**Digital Soko** is a comprehensive barter trading platform built with Node.js, Express, MongoDB, and vanilla JavaScript. It enables users to trade items through multiple mechanisms including full cash purchases, barter-only trades, and hybrid cash-plus-barter transactions.

### 🚀 Key Features
- **Multi-modal Trading**: Cash, barter, and hybrid transactions
- **Smart Pricing**: AI-powered fairness analysis and overcharging detection
- **Admin Dashboard**: Complete platform management and analytics
- **Reports System**: User reporting for pricing concerns
- **Real-time Analytics**: Visual charts and business insights
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend     │    │    Database     │
│   (Vanilla JS)  │◄──►│   (Node/Express)│◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ - HTML/CSS/JS   │    │ - REST API      │    │ - User Data     │
│ - Admin Panel   │    │ - Auth System   │    │ - Products      │
│ - Charts        │    │ - Trade Logic   │    │ - Trades        │
│ - Reports       │    │ - Reports API   │    │ - Reports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ⚡ Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd digital-soko

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies (if any)
cd ..
npm install  # Only if package.json exists in root
```

### 2. Environment Configuration

Create `.env` file in Backend directory:

```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digital-soko

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRE=7d

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload (Cloudinary - optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Database Setup

```bash
# Create admin user
cd Backend
node create-admin.js

# Verify admin user
node debug-auth.js
```

### 4. Start Servers

```bash
# Terminal 1: Backend
cd Backend
npm run dev

# Terminal 2: Frontend
cd /path/to/digital-soko
python3 -m http.server 3000

# Or use live-server:
npx live-server --port=3000
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000/admin-dashboard.html

## 🔐 Authentication

### Admin Login
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: admin (full platform access)

### User Registration
Users can register with:
- Email and password
- Personal information
- Role selection (customer/seller)

### JWT Token Management
- Tokens stored in localStorage
- Automatic token refresh
- Role-based access control

## 📊 Backend API

### Core Endpoints

#### Authentication
```javascript
POST /api/v1/auth/register     // User registration
POST /api/v1/auth/login        // User login
GET  /api/v1/auth/me          // Get current user
PUT  /api/v1/auth/me          // Update profile
```

#### Products
```javascript
GET    /api/v1/products        // Get all products
POST   /api/v1/products        // Create product
GET    /api/v1/products/:id    // Get product by ID
PUT    /api/v1/products/:id    // Update product
DELETE /api/v1/products/:id    // Delete product
```

#### Trades
```javascript
GET    /api/v1/trades          // Get all trades
POST   /api/v1/trades          // Create trade request
PUT    /api/v1/trades/:id/approve  // Approve trade
PUT    /api/v1/trades/:id/reject   // Reject trade
```

#### Reports
```javascript
GET    /api/v1/reports         // Get all reports
POST   /api/v1/reports         // Create report
PUT    /api/v1/reports/:id/status  // Update report status
DELETE /api/v1/reports/:id     // Delete report
```

## 🎨 Frontend Features

### User Dashboard
- Product browsing and search
- Shopping cart functionality
- Trade request creation
- Order management
- Profile settings

### Trade System
- **Full Cash**: Direct purchase
- **Barter Only**: Item exchange
- **Hybrid**: Cash + barter combination

### Smart Pricing
- Fairness score calculation
- Overcharging detection (>30% difference)
- Automatic flagging for admin review

## 🛠️ Admin Dashboard

### Access
- **URL**: `/admin-dashboard.html`
- **Authentication**: Admin role required
- **Features**: Complete platform management

### Sections

#### 1. Items Management
- View all products
- Delete inappropriate items
- Export product data
- Bulk operations

#### 2. Trades Monitor
- Review pending trades
- Approve/reject trades
- Fairness analysis
- Flagged trades (red background)

#### 3. Reports Management
- User pricing reports
- Report statistics
- Resolve/dismiss reports
- Report analytics

#### 4. Analytics Dashboard
- Category distribution charts
- Trade type analysis
- Condition breakdown
- Price range visualization

#### 5. Platform Settings
- Configuration options
- Data backup/restore
- Platform reset (danger zone)

### Analytics Charts
- **Category Distribution**: Items by category
- **Trade Types**: Cash vs barter vs hybrid
- **Condition Analysis**: New vs used items
- **Price Ranges**: Distribution across price brackets

## 💾 Database Models

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['customer', 'seller', 'admin'],
  phone: String,
  avatar: Object,
  address: Array,
  isEmailVerified: Boolean,
  isActive: Boolean,
  timestamps: true
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  condition: Enum ['New', 'Used'],
  tradeType: Enum ['Full Amount', 'Barter Only', 'Barter Plus Money'],
  images: Array,
  seller: ObjectId (ref: User),
  isActive: Boolean,
  timestamps: true
}
```

### Trade Model
```javascript
{
  requestedItem: ObjectId (ref: Product),
  requestingValue: Number,
  offeredItem: ObjectId (ref: Product), // optional
  offeringValue: Number,
  moneyAmount: Number, // for hybrid trades
  tradeType: String,
  status: Enum ['Pending', 'Approved', 'Rejected', 'Completed'],
  fairnessScore: Number,
  valueDifference: Number,
  needsReview: Boolean,
  timestamps: true
}
```

### Report Model
```javascript
{
  productId: ObjectId (ref: Product),
  productName: String,
  productPrice: Number,
  reason: Enum ['overpriced', 'underpriced', 'misleading', 'other'],
  comment: String,
  status: Enum ['pending', 'reviewed', 'resolved', 'dismissed'],
  reporterName: String,
  adminNotes: String,
  timestamps: true
}
```

## 🔄 Trade System

### Trade Types

#### 1. Full Cash Purchase
- Direct monetary transaction
- Standard e-commerce flow
- No barter involved

#### 2. Barter Only
- Pure item exchange
- No cash involved
- Value matching required

#### 3. Hybrid (Barter + Cash)
- Partial cash payment
- Remaining value through barter
- Flexible arrangements

### Fairness Algorithm

```javascript
// Fairness Score Calculation
const valueDiff = offeredValue - requestedPrice;
const diffPercentage = Math.abs(valueDiff / requestedPrice) * 100;
const fairnessScore = Math.max(0, 100 - diffPercentage);

// Flagging Logic
const needsReview = diffPercentage > 30;
const isFair = fairnessScore >= 70;
```

### Admin Review Process
1. System flags trades with >30% price difference
2. Admin reviews flagged trades (red background)
3. Manual approval/rejection required
4. Reason logging for rejected trades

## 🚨 Reports System

### Report Types
- **Overpriced**: Item price too high
- **Underpriced**: Suspiciously low price
- **Misleading**: Description doesn't match price
- **Other**: Custom pricing concerns

### Report Flow
1. User submits report via product page
2. Report appears in admin dashboard
3. Admin reviews and takes action
4. Report status updated (resolved/dismissed)
5. Optional admin notes and reasoning

### Report Statistics
- Total reports count
- Pending vs resolved ratios
- Reason breakdown (pie chart)
- Resolution time tracking

## 📈 Analytics System

### Dashboard Metrics
- **Total Items**: All active products
- **Active Trades**: Pending transactions
- **Platform Value**: Total worth of all items
- **Report Stats**: User feedback analytics

### Visual Charts
- **Category Distribution**: Product categories with percentages
- **Trade Type Analysis**: Cash vs barter vs hybrid ratios
- **Condition Breakdown**: New vs used item statistics
- **Price Range Distribution**: Items across price brackets

### Business Insights
- Popular categories identification
- Trade success rates
- Pricing trends analysis
- User behavior patterns

## 🚀 Deployment

### Production Setup

#### 1. Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
# ... other production configs
```

#### 2. Build Process
```bash
# Backend
cd Backend
npm run build  # If using build process

# Frontend
# Deploy static files to web server
```

#### 3. Process Management
```bash
# Using PM2
npm install -g pm2
cd Backend
pm2 start src/app.js --name "digital-soko-backend"
pm2 startup
pm2 save

# Frontend (nginx example)
sudo apt install nginx
# Configure nginx for static files
```

### Security Considerations
- HTTPS enforcement
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## 🧪 Testing

### Backend Tests
```bash
cd Backend
npm test

# Test specific components
npm run test:auth
npm run test:trades
```

### Frontend Testing
```bash
# Manual testing checklist
- User registration/login
- Product creation
- Trade requests
- Admin dashboard functionality
- Reports system
- Responsive design
```

## 📝 API Examples

### Create Product
```javascript
const response = await productsAPI.create({
  name: "iPhone 13",
  description: "Excellent condition iPhone 13",
  price: 45000,
  category: "Electronics",
  condition: "Used",
  tradeType: "Barter Plus Money",
  images: [...]
});
```

### Create Trade Request
```javascript
const response = await tradesAPI.create({
  requestedItem: "product_id_here",
  requestingValue: 45000,
  tradeType: "BarterOnly",
  offeredItem: "my_product_id_here",
  offeringValue: 45000
});
```

### Submit Report
```javascript
const response = await reportsAPI.create({
  productId: "product_id_here",
  productName: "iPhone 13",
  productPrice: 45000,
  reason: "overpriced",
  comment: "This price seems too high for a used phone"
});
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Errors
```bash
# Check admin user exists
cd Backend && node debug-auth.js

# Verify credentials
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

#### 2. Database Connection
```bash
# Test MongoDB connection
cd Backend && node test-db.js

# Check environment variables
cd Backend && cat .env | grep MONGODB
```

#### 3. API Endpoints
```bash
# Test API health
curl http://localhost:5000/health

# Test specific endpoints
curl http://localhost:5000/api/v1/products
```

### Debug Commands
```bash
# Backend logs
cd Backend && tail -f logs/app.log

# Test database
cd Backend && node test-connection.js

# Clear all data (CAUTION)
cd Backend && node reset-db.js
```

## 📚 File Structure

```
digital-soko/
├── Backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # Database, email configs
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, validation middleware
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   └── utils/            # Helper functions
│   ├── tests/               # Backend tests
│   └── logs/               # Application logs
├── js/                     # Frontend JavaScript
│   └── api.js             # API client
├── *.html                 # Frontend pages
├── *.js                   # Page-specific scripts
├── *.css                  # Stylesheets
└── README.md             # This documentation
```

## 🎯 Future Enhancements

### Planned Features
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] Multi-language support
- [ ] Payment integration (M-Pesa)
- [ ] Social features (reviews, ratings)
- [ ] Machine learning price suggestions
- [ ] Inventory management for sellers

### Performance Optimizations
- [ ] Redis caching
- [ ] Image optimization
- [ ] Database indexing
- [ ] CDN integration
- [ ] Compression middleware

---

## 📞 Support

For technical support or questions:
- **Email**: support@digitalsoko.com
- **Documentation**: See inline code comments
- **Issues**: Check troubleshooting section above

---

**Digital Soko** - Connecting communities through smart trading! 🌟
