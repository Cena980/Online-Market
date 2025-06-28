import { Product, Category } from '../lib/api';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    image_url: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Fashion',
    image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Home & Garden',
    image_url: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Sports',
    image_url: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Mock products for fallback when API is not available
export const products: any[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    category: 'Electronics',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    features: ['Noise Cancellation', '30h Battery', 'Wireless Charging', 'Premium Sound']
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 199.99,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    category: 'Electronics',
    description: 'Advanced fitness tracking with heart rate monitor, GPS, and smartphone integration.',
    rating: 4.7,
    reviews: 89,
    inStock: true,
    features: ['Heart Rate Monitor', 'GPS Tracking', 'Water Resistant', 'Sleep Tracking']
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    category: 'Fashion',
    description: 'Comfortable and sustainable organic cotton t-shirt in various colors.',
    rating: 4.3,
    reviews: 156,
    inStock: true,
    features: ['Organic Cotton', 'Sustainable', 'Comfortable Fit', 'Multiple Colors']
  },
  {
    id: '4',
    name: 'Professional Camera Lens',
    price: 599.99,
    image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    category: 'Electronics',
    description: 'High-quality 50mm f/1.8 lens perfect for portrait and street photography.',
    rating: 4.8,
    reviews: 67,
    inStock: true,
    features: ['50mm f/1.8', 'Portrait Lens', 'Professional Quality', 'Sharp Images']
  },
  {
    id: '5',
    name: 'Minimalist Desk Lamp',
    price: 89.99,
    image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    category: 'Home & Garden',
    description: 'Modern LED desk lamp with adjustable brightness and USB charging port.',
    rating: 4.4,
    reviews: 92,
    inStock: true,
    features: ['LED Light', 'Adjustable Brightness', 'USB Charging', 'Modern Design']
  },
  {
    id: '6',
    name: 'Running Shoes',
    price: 129.99,
    originalPrice: 159.99,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    category: 'Sports',
    description: 'Lightweight running shoes with advanced cushioning and breathable mesh.',
    rating: 4.6,
    reviews: 203,
    inStock: true,
    features: ['Lightweight', 'Advanced Cushioning', 'Breathable', 'Durable']
  },
  {
    id: '7',
    name: 'Wireless Charging Pad',
    price: 39.99,
    image: 'https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    category: 'Electronics',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
    rating: 4.2,
    reviews: 145,
    inStock: true,
    features: ['Fast Charging', 'Qi Compatible', 'LED Indicator', 'Compact Design']
  },
  {
    id: '8',
    name: 'Ceramic Coffee Mug',
    price: 19.99,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    category: 'Home & Garden',
    description: 'Handcrafted ceramic coffee mug with unique glaze finish.',
    rating: 4.1,
    reviews: 78,
    inStock: true,
    features: ['Handcrafted', 'Ceramic', 'Unique Design', 'Dishwasher Safe']
  }
];

export const featuredProducts = products.slice(0, 4);
export const saleProducts = products.filter(product => product.originalPrice);