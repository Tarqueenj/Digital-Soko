# API Usage Examples

Complete examples for using the eCommerce API endpoints.

## Table of Contents
- [Authentication](#authentication)
- [Products](#products)
- [Cart](#cart)
- [Orders](#orders)
- [Reviews](#reviews)
- [Wishlist](#wishlist)

## Base URL

```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

### Register User

**Request:**
```bash
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

**Request:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User

**Request:**
```bash
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer",
      "phone": "+1234567890",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Change Password

**Request:**
```bash
PUT /auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Forgot Password

**Request:**
```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

## Products

### Get All Products

**Request:**
```bash
GET /products?page=1&limit=10&category=Electronics&minPrice=100&maxPrice=1000&sort=-price
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "name": "Wireless Headphones",
        "description": "High-quality wireless headphones with noise cancellation",
        "price": 299.99,
        "compareAtPrice": 399.99,
        "category": "Electronics",
        "brand": "AudioTech",
        "stock": 50,
        "images": [
          {
            "public_id": "products/headphones_1",
            "url": "https://res.cloudinary.com/demo/image/upload/headphones.jpg"
          }
        ],
        "ratings": {
          "average": 4.5,
          "count": 128
        },
        "seller": {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
          "firstName": "Tech",
          "lastName": "Store"
        },
        "isActive": true,
        "isFeatured": true,
        "createdAt": "2024-01-10T08:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Search Products

**Request:**
```bash
GET /products?search=laptop wireless
```

### Get Single Product

**Request:**
```bash
GET /products/65a1b2c3d4e5f6g7h8i9j0k2
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones...",
      "price": 299.99,
      "stock": 50,
      "images": [...],
      "ratings": {
        "average": 4.5,
        "count": 128
      },
      "reviews": [...]
    }
  }
}
```

### Create Product (Seller/Admin)

**Request:**
```bash
POST /products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

name: Laptop Pro 15
description: Professional laptop with high performance
price: 1299.99
compareAtPrice: 1499.99
category: Electronics
brand: TechBrand
stock: 25
images: [file1.jpg, file2.jpg]
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
      "name": "Laptop Pro 15",
      "price": 1299.99,
      "stock": 25,
      "images": [...]
    }
  }
}
```

### Update Product

**Request:**
```bash
PUT /products/65a1b2c3d4e5f6g7h8i9j0k4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "price": 1199.99,
  "stock": 30
}
```

### Delete Product

**Request:**
```bash
DELETE /products/65a1b2c3d4e5f6g7h8i9j0k4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## Cart

### Get Cart

**Request:**
```bash
GET /cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "user": "65a1b2c3d4e5f6g7h8i9j0k1",
      "items": [
        {
          "product": {
            "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
            "name": "Wireless Headphones",
            "price": 299.99,
            "images": [...]
          },
          "quantity": 2,
          "price": 299.99
        }
      ],
      "totalAmount": 599.98
    }
  }
}
```

### Add to Cart

**Request:**
```bash
POST /cart/items
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "productId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cart": {...}
  }
}
```

### Update Cart Item

**Request:**
```bash
PUT /cart/items/65a1b2c3d4e5f6g7h8i9j0k2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart

**Request:**
```bash
DELETE /cart/items/65a1b2c3d4e5f6g7h8i9j0k2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Clear Cart

**Request:**
```bash
DELETE /cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Orders

### Create Order

**Request:**
```bash
POST /orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "items": [
    {
      "product": "65a1b2c3d4e5f6g7h8i9j0k2",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001",
    "phone": "+1234567890"
  },
  "paymentMethod": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
      "orderNumber": "ORD-ABC123-XYZ",
      "user": "65a1b2c3d4e5f6g7h8i9j0k1",
      "items": [...],
      "shippingAddress": {...},
      "itemsPrice": 599.98,
      "taxPrice": 60.00,
      "shippingPrice": 10.00,
      "totalPrice": 669.98,
      "orderStatus": "pending",
      "isPaid": false
    },
    "clientSecret": "pi_xxx_secret_xxx"
  }
}
```

### Get All Orders

**Request:**
```bash
GET /orders?page=1&limit=10&status=pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Single Order

**Request:**
```bash
GET /orders/65a1b2c3d4e5f6g7h8i9j0k6
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Update Order Status (Admin)

**Request:**
```bash
PUT /orders/65a1b2c3d4e5f6g7h8i9j0k6/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "orderStatus": "shipped",
  "trackingNumber": "TRACK123456"
}
```

### Cancel Order

**Request:**
```bash
PUT /orders/65a1b2c3d4e5f6g7h8i9j0k6/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Reviews

### Get Product Reviews

**Request:**
```bash
GET /products/65a1b2c3d4e5f6g7h8i9j0k2/reviews?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k7",
        "product": "65a1b2c3d4e5f6g7h8i9j0k2",
        "user": {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
          "firstName": "John",
          "lastName": "Doe"
        },
        "rating": 5,
        "title": "Excellent product!",
        "comment": "Best headphones I've ever used...",
        "isVerifiedPurchase": true,
        "helpfulCount": 15,
        "createdAt": "2024-01-12T14:30:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

### Create Review

**Request:**
```bash
POST /products/65a1b2c3d4e5f6g7h8i9j0k2/reviews
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Best headphones I've ever used. Great sound quality and battery life."
}
```

### Update Review

**Request:**
```bash
PUT /reviews/65a1b2c3d4e5f6g7h8i9j0k7
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review after 3 months of use..."
}
```

### Mark Review as Helpful

**Request:**
```bash
PUT /reviews/65a1b2c3d4e5f6g7h8i9j0k7/helpful
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Wishlist

### Get Wishlist

**Request:**
```bash
GET /wishlist
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wishlist": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "user": "65a1b2c3d4e5f6g7h8i9j0k1",
      "products": [
        {
          "product": {
            "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
            "name": "Wireless Headphones",
            "price": 299.99,
            "images": [...],
            "ratings": {...}
          },
          "addedAt": "2024-01-14T10:00:00.000Z"
        }
      ]
    }
  }
}
```

### Add to Wishlist

**Request:**
```bash
POST /wishlist/65a1b2c3d4e5f6g7h8i9j0k2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Remove from Wishlist

**Request:**
```bash
DELETE /wishlist/65a1b2c3d4e5f6g7h8i9j0k2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error: Email is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "User role 'customer' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Product not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Server Error"
}
```

---

**For more examples, check the Swagger documentation at `/api-docs`**
