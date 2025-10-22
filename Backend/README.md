# eCommerce Backend API

A production-ready, scalable eCommerce backend built with **Express.js**, **Node.js**, and **MongoDB**. This API provides comprehensive features for building a modern eCommerce platform with security, performance, and scalability in mind.

## 🚀 Features

### Core Features
- ✅ **Authentication & Authorization** - JWT-based auth with bcrypt password hashing
- ✅ **Role-Based Access Control** - Admin, Seller, and Customer roles
- ✅ **Product Management** - Full CRUD operations with image uploads
- ✅ **Shopping Cart** - Session-based cart management
- ✅ **Order Management** - Complete order lifecycle tracking
- ✅ **Payment Integration** - Stripe payment gateway (sandbox ready)
- ✅ **Inventory Management** - Automatic stock updates
- ✅ **Product Reviews** - Rating and review system with verified purchases
- ✅ **Wishlist** - Save products for later
- ✅ **Email Notifications** - Order confirmations, password resets, etc.

### Advanced Features
- 🔍 **Advanced Search & Filtering** - Text search, category filters, price ranges
- 📄 **Pagination & Sorting** - Efficient data retrieval
- 🖼️ **Image Upload** - Cloudinary integration with Multer
- 📧 **Email Service** - Nodemailer integration
- 🔒 **Security** - Helmet, rate limiting, input sanitization, XSS protection
- 📝 **Logging** - Winston logger with file rotation
- ✅ **Input Validation** - Express-validator for request validation
- 📊 **API Documentation** - Auto-generated Swagger/OpenAPI docs
- 🧪 **Testing** - Jest test suite with examples

## 📁 Project Structure

```
ecommerce-backend/
├── src/
│   ├── config/           # Configuration files (database, cloudinary, stripe, email)
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware (auth, validation, upload, rate limiting)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions and helpers
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── tests/               # Test files
├── logs/                # Application logs
├── uploads/             # Local file uploads (temporary)
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── jest.config.js
└── README.md
```

## 🛠️ Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **File Upload**: Multer + Cloudinary
- **Payment**: Stripe
- **Email**: Nodemailer
- **Validation**: Express-validator
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize, xss-clean
- **Logging**: Winston + Morgan
- **Documentation**: Swagger (swagger-jsdoc + swagger-ui-express)
- **Testing**: Jest + Supertest

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
```

4. **Create required directories**
```bash
mkdir logs uploads
```

5. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

Watch mode:
```bash
npm run test:watch
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/me` - Update profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password/:token` - Reset password
- `POST /api/v1/auth/logout` - Logout user

### Products
- `GET /api/v1/products` - Get all products (with filters, search, pagination)
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create product (Seller/Admin)
- `PUT /api/v1/products/:id` - Update product (Seller/Admin)
- `DELETE /api/v1/products/:id` - Delete product (Seller/Admin)
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/products/seller/:sellerId` - Get products by seller

### Cart
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/:productId` - Update cart item
- `DELETE /api/v1/cart/items/:productId` - Remove item from cart
- `DELETE /api/v1/cart` - Clear cart

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get all orders (user's orders or all for admin)
- `GET /api/v1/orders/:id` - Get single order
- `PUT /api/v1/orders/:id/status` - Update order status (Admin)
- `PUT /api/v1/orders/:id/cancel` - Cancel order
- `GET /api/v1/orders/stats` - Get order statistics (Admin)

### Reviews
- `GET /api/v1/products/:productId/reviews` - Get product reviews
- `POST /api/v1/products/:productId/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review
- `PUT /api/v1/reviews/:id/helpful` - Mark review as helpful
- `GET /api/v1/reviews/me` - Get user's reviews

### Wishlist
- `GET /api/v1/wishlist` - Get user's wishlist
- `POST /api/v1/wishlist/:productId` - Add to wishlist
- `DELETE /api/v1/wishlist/:productId` - Remove from wishlist
- `DELETE /api/v1/wishlist` - Clear wishlist

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🎯 Example Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Product
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 10
  }'
```

### Get Products with Filters
```bash
curl "http://localhost:5000/api/v1/products?category=Electronics&minPrice=500&maxPrice=2000&page=1&limit=10&sort=-price"
```

## 🚀 Deployment

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set environment variables in Render dashboard
4. Deploy!

Build Command: `npm install`
Start Command: `npm start`

### Deploy to Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add MongoDB: `railway add`
5. Deploy: `railway up`

### Deploy to Vercel (Serverless)

1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```
3. Deploy: `vercel --prod`

### Environment Variables for Production

Ensure these are set in your deployment platform:
- `NODE_ENV=production`
- `MONGODB_URI` (use MongoDB Atlas)
- `JWT_SECRET` (strong random string)
- `STRIPE_SECRET_KEY`
- `CLOUDINARY_*` credentials
- `EMAIL_*` credentials
- `FRONTEND_URL`

## 🔧 Configuration

### Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Password reset: 3 requests per hour

### File Upload
- Max file size: 5MB
- Allowed formats: jpeg, jpg, png, gif, webp
- Max images per product: 5

### Pagination
- Default page size: 10
- Max page size: 100

## 🛡️ Security Features

- **Helmet** - Sets security HTTP headers
- **Rate Limiting** - Prevents brute force attacks
- **Input Sanitization** - Prevents NoSQL injection
- **XSS Protection** - Cleans user input
- **CORS** - Configured for specific origins
- **JWT** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds

## 📝 Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@ecommerce.com

## 🔮 Future Enhancements

- [ ] GraphQL API support
- [ ] Microservices architecture
- [ ] Redis caching
- [ ] WebSocket for real-time updates
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Multi-language support
- [ ] Social authentication (OAuth)
- [ ] Product recommendations (AI/ML)
- [ ] Elasticsearch integration

## 👨‍💻 Author

Your Name - [GitHub](https://github.com/yourusername)

---

**Built with ❤️ using Node.js and Express.js**
