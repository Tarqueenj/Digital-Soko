# Vanilla JavaScript Frontend Example

Complete vanilla JavaScript frontend using Fetch API - no frameworks required!

## Structure

```
vanilla-js-example/
├── js/
│   ├── api.js          # API client with Fetch
│   ├── auth.js         # Authentication service
│   ├── products.js     # Product service
│   └── cart.js         # Cart service
├── login.html          # Login page
├── register.html       # Registration page
├── index.html          # Products listing
└── README.md
```

## Quick Start

1. **Make sure backend is running:**
   ```bash
   cd ../
   npm run dev
   ```

2. **Open in browser:**
   - Simply open `index.html` in your browser
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 3000
     
     # Node.js (install http-server globally)
     npx http-server -p 3000
     ```

3. **Access the app:**
   ```
   http://localhost:3000
   ```

## Features

✅ Login/Register with JWT  
✅ Product listing with search  
✅ Add to cart functionality  
✅ No frameworks - pure JavaScript  
✅ Uses Fetch API  
✅ LocalStorage for auth  

## API Services

### api.js
- APIClient class with Fetch API
- Automatic token handling
- Error handling

### auth.js
- Login/Register
- Token management
- User session

### products.js
- Get products
- Search products
- Product details

### cart.js
- Add/remove items
- Update quantities
- Cart count

## Usage Examples

See VANILLA_JS_INTEGRATION.md for complete code examples and documentation.
