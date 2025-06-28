import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new Database(join(__dirname, '..', 'database.sqlite'));
db.pragma('foreign_keys = ON');

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, userType = 'customer' } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, user_type, full_name)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, email, hashedPassword, userType, fullName);
    
    const userStmt = db.prepare('SELECT id, email, user_type, full_name, phone, avatar_url, created_at, updated_at FROM users WHERE id = ?');
    const user = userStmt.get(userId);
    
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
    
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, email, user_type, full_name, phone, avatar_url, created_at, updated_at FROM users WHERE id = ?');
    const user = stmt.get(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Product routes
app.get('/api/products', (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name, bp.business_name, bp.is_verified
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN business_profiles bp ON p.business_id = bp.id
      WHERE p.is_active = 1 AND p.stock_quantity > 0
    `;
    
    const params = [];
    
    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const stmt = db.prepare(query);
    const products = stmt.all(...params);
    
    // Parse JSON fields
    const processedProducts = products.map(product => ({
      ...product,
      additional_images: product.additional_images ? JSON.parse(product.additional_images) : null,
      features: product.features ? JSON.parse(product.features) : null,
    }));
    
    res.json({ products: processedProducts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare(`
      SELECT p.*, c.name as category_name, bp.business_name, bp.is_verified
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN business_profiles bp ON p.business_id = bp.id
      WHERE p.id = ?
    `);
    
    const product = stmt.get(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Parse JSON fields
    if (product.additional_images) {
      product.additional_images = JSON.parse(product.additional_images);
    }
    if (product.features) {
      product.features = JSON.parse(product.features);
    }
    
    res.json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add product route for business owners
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, originalPrice, categoryId, imageUrl, stockQuantity, features, isActive } = req.body;
    const userId = req.user.userId;
    
    // Check if user is a business owner
    const userStmt = db.prepare('SELECT user_type FROM users WHERE id = ?');
    const user = userStmt.get(userId);
    
    if (!user || user.user_type !== 'business_owner') {
      return res.status(403).json({ error: 'Only business owners can add products' });
    }
    
    // Get or create business profile
    let businessStmt = db.prepare('SELECT id FROM business_profiles WHERE user_id = ?');
    let business = businessStmt.get(userId);
    
    if (!business) {
      // Create a basic business profile
      const businessId = uuidv4();
      const createBusinessStmt = db.prepare(`
        INSERT INTO business_profiles (id, user_id, business_name, is_verified)
        VALUES (?, ?, ?, ?)
      `);
      createBusinessStmt.run(businessId, userId, 'My Business', 0);
      business = { id: businessId };
    }
    
    const productId = uuidv4();
    const insertStmt = db.prepare(`
      INSERT INTO products (
        id, business_id, category_id, name, description, price, original_price,
        image_url, features, stock_quantity, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const featuresJson = features ? JSON.stringify(features.split(',').map(f => f.trim())) : null;
    
    insertStmt.run(
      productId,
      business.id,
      categoryId,
      name,
      description,
      parseFloat(price),
      originalPrice ? parseFloat(originalPrice) : null,
      imageUrl,
      featuresJson,
      parseInt(stockQuantity),
      isActive ? 1 : 0
    );
    
    res.json({ message: 'Product created successfully', productId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Category routes
app.get('/api/categories', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY name');
    const categories = stmt.all();
    
    res.json({ categories });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cart routes
app.get('/api/cart', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT sc.*, p.name, p.price, p.image_url, p.stock_quantity, bp.business_name
      FROM shopping_cart sc
      JOIN products p ON sc.product_id = p.id
      LEFT JOIN business_profiles bp ON p.business_id = bp.id
      WHERE sc.user_id = ? AND p.is_active = 1
      ORDER BY sc.created_at DESC
    `);
    
    const items = stmt.all(req.user.userId);
    
    res.json({ items });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/cart', authenticateToken, (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;
    
    // Check if item already exists
    const existingStmt = db.prepare('SELECT * FROM shopping_cart WHERE user_id = ? AND product_id = ?');
    const existingItem = existingStmt.get(userId, productId);
    
    if (existingItem) {
      // Update quantity
      const updateStmt = db.prepare('UPDATE shopping_cart SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      updateStmt.run(quantity, existingItem.id);
      res.json({ message: 'Cart updated' });
    } else {
      // Insert new item
      const id = uuidv4();
      const insertStmt = db.prepare(`
        INSERT INTO shopping_cart (id, user_id, product_id, quantity)
        VALUES (?, ?, ?, ?)
      `);
      insertStmt.run(id, userId, productId, quantity);
      res.json({ message: 'Item added to cart' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/cart/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      const stmt = db.prepare('DELETE FROM shopping_cart WHERE id = ? AND user_id = ?');
      stmt.run(id, req.user.userId);
    } else {
      const stmt = db.prepare('UPDATE shopping_cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
      stmt.run(quantity, id, req.user.userId);
    }
    
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/cart/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM shopping_cart WHERE id = ? AND user_id = ?');
    stmt.run(id, req.user.userId);
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});