const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const connectDB = require('../src/config/database');
const mongoose = require('mongoose');

describe('Product Tests', () => {
  let sellerToken;
  let sellerId;
  let productId;

  beforeAll(async () => {
    await connectDB();

    // Create a seller user
    const seller = await User.create({
      firstName: 'Seller',
      lastName: 'User',
      email: 'seller@test.com',
      password: 'password123',
      role: 'seller',
    });

    sellerId = seller._id;
    sellerToken = seller.generateAuthToken();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        category: 'Electronics',
        stock: 10,
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe(productData.name);
      productId = response.body.data.product._id;
    });

    it('should not create product without authentication', async () => {
      const productData = {
        name: 'Test Product 2',
        description: 'This is another test product',
        price: 49.99,
        category: 'Books',
        stock: 5,
      };

      const response = await request(app)
        .post('/api/v1/products')
        .send(productData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/v1/products?category=Electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should paginate products', async () => {
      const response = await request(app)
        .get('/api/v1/products?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should get a single product', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${productId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product._id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update product', async () => {
      const updateData = {
        price: 89.99,
        stock: 15,
      };

      const response = await request(app)
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.price).toBe(updateData.price);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete product', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
