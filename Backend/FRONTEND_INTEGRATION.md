# Frontend Integration Guide

This guide shows how to connect your frontend application to this eCommerce backend API.

## Table of Contents
- [Quick Setup](#quick-setup)
- [React Integration](#react-integration)
- [Vue.js Integration](#vuejs-integration)
- [Next.js Integration](#nextjs-integration)
- [API Client Setup](#api-client-setup)
- [Authentication Flow](#authentication-flow)
- [Example Components](#example-components)

## Quick Setup

### 1. Configure Backend CORS

The backend is already configured to accept requests from your frontend. Update the `FRONTEND_URL` in your `.env` file:

```env
FRONTEND_URL=http://localhost:3000
```

For production:
```env
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Start Backend Server

```bash
npm run dev
```

Backend will run on: `http://localhost:5000`

### 3. API Base URL

Use this base URL in your frontend:
```
Development: http://localhost:5000/api/v1
Production: https://your-backend-domain.com/api/v1
```

## React Integration

### Setup

Create a new React app (if you don't have one):

```bash
npx create-react-app ecommerce-frontend
cd ecommerce-frontend
npm install axios
```

### API Client (`src/api/client.js`)

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Auth Service (`src/api/authService.js`)

```javascript
import apiClient from './client';

export const authService = {
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};
```

### Product Service (`src/api/productService.js`)

```javascript
import apiClient from './client';

export const productService = {
  async getProducts(params = {}) {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  async getProduct(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(productData) {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  async searchProducts(query) {
    const response = await apiClient.get('/products', {
      params: { search: query },
    });
    return response.data;
  },
};
```

### Cart Service (`src/api/cartService.js`)

```javascript
import apiClient from './client';

export const cartService = {
  async getCart() {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  async addToCart(productId, quantity) {
    const response = await apiClient.post('/cart/items', {
      productId,
      quantity,
    });
    return response.data;
  },

  async updateCartItem(productId, quantity) {
    const response = await apiClient.put(`/cart/items/${productId}`, {
      quantity,
    });
    return response.data;
  },

  async removeFromCart(productId) {
    const response = await apiClient.delete(`/cart/items/${productId}`);
    return response.data;
  },

  async clearCart() {
    const response = await apiClient.delete('/cart');
    return response.data;
  },
};
```

### Order Service (`src/api/orderService.js`)

```javascript
import apiClient from './client';

export const orderService = {
  async createOrder(orderData) {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  async getOrders(params = {}) {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  async getOrder(id) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  async cancelOrder(id) {
    const response = await apiClient.put(`/orders/${id}/cancel`);
    return response.data;
  },
};
```

### Example Login Component (`src/components/Login.jsx`)

```javascript
import React, { useState } from 'react';
import { authService } from '../api/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      window.location.href = '/'; // Redirect to home
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

### Example Product List Component (`src/components/ProductList.jsx`)

```javascript
import React, { useState, useEffect } from 'react';
import { productService } from '../api/productService';
import { cartService } from '../api/cartService';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts({ page: 1, limit: 12 });
      setProducts(data.data.products);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await cartService.addToCart(productId, 1);
      alert('Product added to cart!');
    } catch (err) {
      alert('Failed to add to cart');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-list">
      <h2>Products</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.images[0]?.url} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button onClick={() => handleAddToCart(product._id)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
```

### Environment Variables (`.env`)

Create `.env` in your React app root:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

For production:
```env
REACT_APP_API_URL=https://your-backend-domain.com/api/v1
```

## Vue.js Integration

### Setup

```bash
npm create vue@latest ecommerce-frontend
cd ecommerce-frontend
npm install axios
```

### API Client (`src/api/client.js`)

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
```

### Composable (`src/composables/useAuth.js`)

```javascript
import { ref } from 'vue';
import apiClient from '../api/client';

export function useAuth() {
  const user = ref(null);
  const isAuthenticated = ref(false);

  const login = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    const { token, user: userData } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    user.value = userData;
    isAuthenticated.value = true;
    
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    user.value = null;
    isAuthenticated.value = false;
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}
```

### Environment Variables (`.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Next.js Integration

### API Client (`lib/api.js`)

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Server-side API calls
export async function fetchProducts(params = {}) {
  const response = await apiClient.get('/products', { params });
  return response.data;
}

export async function fetchProduct(id) {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
}
```

### Server Component Example (`app/products/page.js`)

```javascript
import { fetchProducts } from '@/lib/api';

export default async function ProductsPage() {
  const data = await fetchProducts({ page: 1, limit: 12 });
  const products = data.data.products;

  return (
    <div>
      <h1>Products</h1>
      <div className="grid">
        {products.map((product) => (
          <div key={product._id}>
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Authentication Flow

### 1. Register/Login Flow

```javascript
// Register
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
};

const response = await authService.register(userData);
// Token is automatically stored in localStorage
```

### 2. Protected Routes

```javascript
// React Router example
import { Navigate } from 'react-router-dom';
import { authService } from './api/authService';

function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
}
```

### 3. Token Refresh (Optional)

```javascript
// Add to API client interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Implement token refresh logic here
      // Or redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Common Integration Patterns

### 1. Shopping Cart State Management

```javascript
// Using React Context
import { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../api/cartService';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await cartService.getCart();
      setCart(data.data.cart);
    } catch (err) {
      console.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    const data = await cartService.addToCart(productId, quantity);
    setCart(data.data.cart);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
```

### 2. Image Upload

```javascript
async function uploadProductImages(productId, files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await apiClient.post(`/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
```

### 3. Search with Debounce

```javascript
import { useState, useEffect } from 'react';
import { productService } from '../api/productService';

function useProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const data = await productService.searchProducts(query);
          setResults(data.data.products);
        } catch (err) {
          console.error('Search failed');
        } finally {
          setLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return { query, setQuery, results, loading };
}
```

## Testing the Connection

### Quick Test Script

Create `test-api.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>API Test</title>
</head>
<body>
  <h1>API Connection Test</h1>
  <button onclick="testConnection()">Test Connection</button>
  <div id="result"></div>

  <script>
    async function testConnection() {
      try {
        const response = await fetch('http://localhost:5000/health');
        const data = await response.json();
        document.getElementById('result').innerHTML = 
          '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (error) {
        document.getElementById('result').innerHTML = 
          '<p style="color: red;">Connection failed: ' + error.message + '</p>';
      }
    }
  </script>
</body>
</html>
```

## Troubleshooting

### CORS Issues

If you get CORS errors, ensure:
1. Backend `.env` has correct `FRONTEND_URL`
2. Backend is running
3. Frontend is using correct API URL

### Authentication Issues

1. Check token is being stored: `localStorage.getItem('token')`
2. Check token is being sent in headers
3. Verify token hasn't expired

### Network Errors

1. Verify backend is running: `http://localhost:5000/health`
2. Check firewall settings
3. Ensure correct ports are used

## Complete Example Repository

For a complete working example, check out:
- React: [Create React App + API Integration]
- Next.js: [Next.js 14 + Server Components]
- Vue: [Vue 3 + Composition API]

---

**Need Help?** Check the main [README.md](README.md) or open an issue on GitHub.
