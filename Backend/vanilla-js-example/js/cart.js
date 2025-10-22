// Cart Service
const CartService = {
  async getCart() {
    const response = await api.get('/cart');
    return response.data.cart;
  },

  async addToCart(productId, quantity = 1) {
    const response = await api.post('/cart/items', { productId, quantity });
    return response.data.cart;
  },

  async updateCartItem(productId, quantity) {
    const response = await api.put(`/cart/items/${productId}`, { quantity });
    return response.data.cart;
  },

  async removeFromCart(productId) {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data.cart;
  },

  getCartCount(cart) {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },
};
