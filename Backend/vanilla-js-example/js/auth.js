// Authentication Service
const AuthService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData, { auth: false });
    if (response.data.token) {
      api.setToken(response.data.token);
      this.saveUser(response.data.user);
    }
    return response;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password }, { auth: false });
    if (response.data.token) {
      api.setToken(response.data.token);
      this.saveUser(response.data.user);
    }
    return response;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    this.saveUser(response.data.user);
    return response.data.user;
  },

  logout() {
    api.removeToken();
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!api.getToken();
  },
};
