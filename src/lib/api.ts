const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to make authenticated requests
const makeRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Types
export interface User {
  id: string;
  email: string;
  user_type: 'customer' | 'business_owner';
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  additional_images?: string[];
  features?: string[];
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string;
  business_name?: string;
  is_verified?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  business_name?: string;
  created_at: string;
  updated_at: string;
}

// Auth API
export const authAPI = {
  async register(email: string, password: string, fullName: string, userType: 'customer' | 'business_owner' = 'customer') {
    const response = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, userType }),
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  async login(email: string, password: string) {
    const response = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  async getCurrentUser() {
    return makeRequest('/auth/me');
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  verifyToken(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { userId: payload.userId, error: null };
    } catch (error) {
      return { userId: null, error: 'Invalid token' };
    }
  }
};

// Product API
export const productAPI = {
  async getProducts(filters?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    return makeRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  async getProduct(id: string) {
    return makeRequest(`/products/${id}`);
  }
};

// Category API
export const categoryAPI = {
  async getCategories() {
    return makeRequest('/categories');
  }
};

// Cart API
export const cartAPI = {
  async getCartItems() {
    return makeRequest('/cart');
  },

  async addToCart(productId: string, quantity: number = 1) {
    return makeRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async updateCartItem(cartItemId: string, quantity: number) {
    return makeRequest(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  async removeFromCart(cartItemId: string) {
    return makeRequest(`/cart/${cartItemId}`, {
      method: 'DELETE',
    });
  }
};