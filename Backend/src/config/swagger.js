const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'eCommerce API Documentation',
      version: '1.0.0',
      description: 'Production-ready eCommerce backend API with Express.js and MongoDB',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api/${process.env.API_VERSION || 'v1'}`,
        description: 'Development server',
      },
      {
        url: 'https://your-production-url.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['customer', 'seller', 'admin'] },
            phone: { type: 'string' },
            isEmailVerified: { type: 'boolean' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            compareAtPrice: { type: 'number' },
            category: { type: 'string' },
            brand: { type: 'string' },
            stock: { type: 'number' },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  public_id: { type: 'string' },
                  url: { type: 'string' },
                },
              },
            },
            ratings: {
              type: 'object',
              properties: {
                average: { type: 'number' },
                count: { type: 'number' },
              },
            },
            seller: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string' },
            user: { type: 'string' },
            items: { type: 'array' },
            shippingAddress: { type: 'object' },
            paymentMethod: { type: 'string' },
            itemsPrice: { type: 'number' },
            taxPrice: { type: 'number' },
            shippingPrice: { type: 'number' },
            totalPrice: { type: 'number' },
            orderStatus: { type: 'string' },
            isPaid: { type: 'boolean' },
            isDelivered: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Products', description: 'Product management endpoints' },
      { name: 'Cart', description: 'Shopping cart endpoints' },
      { name: 'Orders', description: 'Order management endpoints' },
      { name: 'Reviews', description: 'Product review endpoints' },
      { name: 'Wishlist', description: 'Wishlist management endpoints' },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
