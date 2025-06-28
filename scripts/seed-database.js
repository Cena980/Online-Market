import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database connection
const db = new Database(join(__dirname, '..', 'database.sqlite'));
db.pragma('foreign_keys = ON');

console.log('Seeding database with sample data...');

// First, create a system user for sample data
const systemUserId = uuidv4();
const hashedPassword = await bcrypt.hash('password123', 10);

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password_hash, user_type, full_name) 
  VALUES (?, ?, ?, ?, ?)
`);

insertUser.run(
  systemUserId,
  'system@shophub.com',
  hashedPassword,
  'business_owner',
  'ShopHub System'
);

// Insert sample business profiles
const insertBusiness = db.prepare(`
  INSERT OR IGNORE INTO business_profiles (id, user_id, business_name, business_description, is_verified) 
  VALUES (?, ?, ?, ?, ?)
`);

const businessId = uuidv4();
insertBusiness.run(
  businessId,
  systemUserId, // Use the actual user ID
  'TechStore Inc.',
  'Premium electronics and gadgets retailer',
  1
);

// Insert sample products
const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (
    id, business_id, category_id, name, description, price, original_price,
    image_url, features, stock_quantity
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const sampleProducts = [
  {
    id: uuidv4(),
    category_id: 'cat-1', // Electronics
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
    price: 79.99,
    original_price: 99.99,
    image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    features: JSON.stringify(['Noise Cancellation', '30h Battery', 'Wireless Charging', 'Premium Sound']),
    stock_quantity: 50
  },
  {
    id: uuidv4(),
    category_id: 'cat-1', // Electronics
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitor, GPS, and smartphone integration.',
    price: 199.99,
    original_price: null,
    image_url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    features: JSON.stringify(['Heart Rate Monitor', 'GPS Tracking', 'Water Resistant', 'Sleep Tracking']),
    stock_quantity: 30
  },
  {
    id: uuidv4(),
    category_id: 'cat-2', // Fashion
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt in various colors.',
    price: 29.99,
    original_price: 39.99,
    image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    features: JSON.stringify(['Organic Cotton', 'Sustainable', 'Comfortable Fit', 'Multiple Colors']),
    stock_quantity: 100
  },
  {
    id: uuidv4(),
    category_id: 'cat-1', // Electronics
    name: 'Professional Camera Lens',
    description: 'High-quality 50mm f/1.8 lens perfect for portrait and street photography.',
    price: 599.99,
    original_price: null,
    image_url: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    features: JSON.stringify(['50mm f/1.8', 'Portrait Lens', 'Professional Quality', 'Sharp Images']),
    stock_quantity: 15
  },
  {
    id: uuidv4(),
    category_id: 'cat-3', // Home & Garden
    name: 'Minimalist Desk Lamp',
    description: 'Modern LED desk lamp with adjustable brightness and USB charging port.',
    price: 89.99,
    original_price: null,
    image_url: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    features: JSON.stringify(['LED Light', 'Adjustable Brightness', 'USB Charging', 'Modern Design']),
    stock_quantity: 25
  },
  {
    id: uuidv4(),
    category_id: 'cat-4', // Sports
    name: 'Running Shoes',
    description: 'Lightweight running shoes with advanced cushioning and breathable mesh.',
    price: 129.99,
    original_price: 159.99,
    image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    features: JSON.stringify(['Lightweight', 'Advanced Cushioning', 'Breathable', 'Durable']),
    stock_quantity: 40
  },
  {
    id: uuidv4(),
    category_id: 'cat-1', // Electronics
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
    price: 39.99,
    original_price: null,
    image_url: 'https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    features: JSON.stringify(['Fast Charging', 'Qi Compatible', 'LED Indicator', 'Compact Design']),
    stock_quantity: 60
  },
  {
    id: uuidv4(),
    category_id: 'cat-3', // Home & Garden
    name: 'Ceramic Coffee Mug',
    description: 'Handcrafted ceramic coffee mug with unique glaze finish.',
    price: 19.99,
    original_price: null,
    image_url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
    features: JSON.stringify(['Handcrafted', 'Ceramic', 'Unique Design', 'Dishwasher Safe']),
    stock_quantity: 80
  }
];

sampleProducts.forEach(product => {
  insertProduct.run(
    product.id,
    businessId,
    product.category_id,
    product.name,
    product.description,
    product.price,
    product.original_price,
    product.image_url,
    product.features,
    product.stock_quantity
  );
});

// Create a demo customer user
const demoCustomerId = uuidv4();
const demoCustomerPassword = await bcrypt.hash('password123', 10);

insertUser.run(
  demoCustomerId,
  'customer@demo.com',
  demoCustomerPassword,
  'customer',
  'Demo Customer'
);

// Create a demo business owner user
const demoBusinessId = uuidv4();
const demoBusinessPassword = await bcrypt.hash('password123', 10);

insertUser.run(
  demoBusinessId,
  'business@demo.com',
  demoBusinessPassword,
  'business_owner',
  'Demo Business Owner'
);

console.log('Database seeded successfully!');
console.log(`Inserted ${sampleProducts.length} sample products`);
console.log('Demo accounts created:');
console.log('- Customer: customer@demo.com / password123');
console.log('- Business: business@demo.com / password123');

db.close();