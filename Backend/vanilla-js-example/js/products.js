// Product Service
const ProductService = {
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? '?' + queryString : ''}`;
    const response = await api.get(endpoint, { auth: false });
    return response.data;
  },

  async getProduct(id) {
    const response = await api.get(`/products/${id}`, { auth: false });
    return response.data.product;
  },

  async searchProducts(query) {
    return await this.getProducts({ search: query });
  },
};
