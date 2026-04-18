import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
  });

  // Initialize SQLite Database
  const dbPath = path.join(__dirname, 'database_v5.db');
  console.log('Initializing database at:', dbPath);
  const db = new Database(dbPath);

  // SSE setup
  let clients: express.Response[] = [];

  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    clients.push(res);
    
    req.on('close', () => {
      clients = clients.filter(client => client !== res);
    });
  });

  const broadcastEvent = (type: string, payload: any) => {
    clients.forEach(client => {
      client.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
    });
  };

  // Promo Image Endpoints
  app.get('/api/promo', (req, res) => {
    try {
      const row = db.prepare("SELECT value FROM site_stats WHERE key = 'promo_image'").get() as any;
      res.json({ imageUrl: row ? row.value : null });
    } catch {
      res.status(500).json({ success: false });
    }
  });

  app.post('/api/admin/promo', (req, res) => {
    try {
      const { imageUrl } = req.body;
      db.prepare("INSERT OR REPLACE INTO site_stats (key, value) VALUES ('promo_image', ?)").run(imageUrl || null);
      
      broadcastEvent('admin_update', { message: 'New promo image added!' });
      res.json({ success: true });
    } catch {
      res.status(500).json({ success: false });
    }
  });

  // Notice Board Endpoints
  app.get('/api/notices', (req, res) => {
    try {
      const notices = db.prepare("SELECT * FROM notices WHERE is_active = 1 AND (duration_ends_at IS NULL OR duration_ends_at > datetime('now')) ORDER BY created_at DESC").all();
      res.json(notices);
    } catch {
      res.status(500).json([]);
    }
  });

  app.get('/api/admin/notices', (req, res) => {
    try {
      const notices = db.prepare("SELECT * FROM notices ORDER BY created_at DESC").all();
      res.json(notices);
    } catch {
      res.status(500).json([]);
    }
  });

  app.post('/api/admin/notices', (req, res) => {
    try {
      const { title, content, type, duration_ends_at } = req.body;
      const stmt = db.prepare("INSERT INTO notices (title, content, type, duration_ends_at) VALUES (?, ?, ?, ?)");
      stmt.run(title, content, type || 'popup', duration_ends_at || null);
      
      broadcastEvent('admin_update', { message: 'New notice published!' });
      res.json({ success: true });
    } catch (error) {
      console.error('Add Notice Error:', error);
      res.status(500).json({ success: false });
    }
  });

  app.delete('/api/admin/notices/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM notices WHERE id = ?").run(id);
      broadcastEvent('admin_update', { message: 'Notice deleted!' });
      res.json({ success: true });
    } catch {
      res.status(500).json({ success: false });
    }
  });

  app.post('/api/products', (req, res) => {
    const { id, name, price, regularPrice, description, image, images, category, offerEndsAt } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO products (id, name, price, regularPrice, description, image, images, category, offerEndsAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, name, price, regularPrice, description, image, JSON.stringify(images), category, offerEndsAt || null);
      
      broadcastEvent('admin_update', { message: 'Product added!' });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Product Add Error:', error);
      res.status(500).json({ success: false, message: 'পণ্য যোগ করতে সমস্যা হয়েছে।' });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, regularPrice, description, image, images, category, offerEndsAt } = req.body;
    try {
      const stmt = db.prepare(`
        UPDATE products 
        SET name = ?, price = ?, regularPrice = ?, description = ?, image = ?, images = ?, category = ?, offerEndsAt = ?
        WHERE id = ?
      `);
      stmt.run(name, price, regularPrice, description, image, JSON.stringify(images), category, offerEndsAt || null, id);
      
      broadcastEvent('admin_update', { message: 'Product updated!' });

      res.json({ success: true });
    } catch (error) {
      console.error('Product Update Error:', error);
      res.status(500).json({ success: false, message: 'পণ্য আপডেট করতে সমস্যা হয়েছে।' });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM products WHERE id = ?').run(id);
      
      broadcastEvent('admin_update', { message: 'Product deleted!' });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'পণ্য মুছতে সমস্যা হয়েছে।' });
    }
  });
  console.log('Creating tables if not exists...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone_number TEXT UNIQUE,
      password_hash TEXT,
      google_id TEXT,
      role TEXT CHECK(role IN ('admin', 'customer')) DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      regularPrice REAL,
      description TEXT,
      image TEXT,
      images TEXT, -- JSON string
      category TEXT,
      offerEndsAt TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Try to add offerEndsAt column if it doesn't exist (for existing DBs)
    BEGIN TRANSACTION;
    SELECT count(*) FROM pragma_table_info('products') WHERE name='offerEndsAt';
    -- Since we can't do conditional logic easily in pure sqlite script without procedural code,
    -- we'll do it using db.pragma in JS.
    COMMIT;

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      items TEXT NOT NULL, -- JSON string
      totalAmount REAL NOT NULL,
      deliveryCharge REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      paymentMethod TEXT,
      paymentStatus TEXT DEFAULT 'pending',
      address TEXT,
      phone TEXT,
      customer_name TEXT,
      customer_email TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS site_stats (
      key TEXT PRIMARY KEY,
      value INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT, -- 'order', 'login', 'register'
      message TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      type TEXT DEFAULT 'popup', -- 'popup' or 'banner'
      is_active INTEGER DEFAULT 1,
      duration_ends_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    INSERT OR IGNORE INTO site_stats (key, value) VALUES ('visitor_count', 0);
    INSERT OR IGNORE INTO site_stats (key, value) VALUES ('login_count', 0);
  `);

  try {
    const tableInfo = db.prepare("PRAGMA table_info(products)").all() as any[];
    const hasOfferEndsAt = tableInfo.some(col => col.name === 'offerEndsAt');
    if (!hasOfferEndsAt) {
      console.log("Adding offerEndsAt column to products table...");
      db.exec("ALTER TABLE products ADD COLUMN offerEndsAt TEXT");
    }
  } catch(e) {
    console.error("Error patching DB:", e);
  }

  // Seed initial products if table is empty
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (productCount.count === 0) {
    const INITIAL_PRODUCTS = [
      {
        id: '1',
        name: 'স্মার্ট ওয়াচ',
        price: 1200,
        regularPrice: 1500,
        description: 'উন্নত মানের স্মার্ট ওয়াচ, হার্ট রেট মনিটর এবং ব্লুটুথ কলিং সুবিধা সহ।',
        image: 'https://picsum.photos/seed/watch/400/400',
        images: JSON.stringify(['https://picsum.photos/seed/watch1/400/400', 'https://picsum.photos/seed/watch2/400/400']),
        category: 'Electronics'
      },
      {
        id: '2',
        name: 'ওয়্যারলেস ইয়ারবাড',
        price: 850,
        regularPrice: 1000,
        description: 'ক্লিয়ার সাউন্ড এবং দীর্ঘ ব্যাটারি লাইফ।',
        image: 'https://picsum.photos/seed/earbuds/400/400',
        images: JSON.stringify(['https://picsum.photos/seed/earbuds1/400/400', 'https://picsum.photos/seed/earbuds2/400/400']),
        category: 'Electronics'
      },
      {
        id: '3',
        name: 'লেদার ওয়ালেট',
        price: 500,
        regularPrice: null,
        description: 'প্রিমিয়াম কোয়ালিটি লেদার ওয়ালেট।',
        image: 'https://picsum.photos/seed/wallet/400/400',
        images: JSON.stringify(['https://picsum.photos/seed/wallet1/400/400']),
        category: 'Fashion'
      }
    ];

    const insertProduct = db.prepare('INSERT INTO products (id, name, price, regularPrice, description, image, images, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    INITIAL_PRODUCTS.forEach(p => {
      insertProduct.run(p.id, p.name, p.price, p.regularPrice, p.description, p.image, p.images, p.category);
    });
  }

  // Seed admin user if none exists

  // Seed admin user if none exists
  const adminExists = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
  console.log('Admin exists check:', adminExists);
  if (adminExists.count === 0) {
    console.log('Seeding admin user...');
    db.prepare('INSERT INTO users (full_name, email, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
      'নাঈমুর রহমান',
      'admin',
      '01675674183',
      '234000',
      'admin'
    );
    console.log('Admin user seeded.');
  }

  // API Routes
  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all();
    const formattedProducts = products.map((p: any) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }));
    res.json(formattedProducts);
  });

  app.get('/api/orders', (req, res) => {
    try {
      const orders = db.prepare('SELECT * FROM orders ORDER BY date DESC').all();
      console.log(`Server: Fetched ${orders.length} total orders`);
      const formattedOrders = orders.map((o: any) => ({
        ...o,
        userId: o.user_id.toString(),
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        items: JSON.parse(o.items)
      }));
      res.json(formattedOrders);
    } catch (error) {
      console.error('Fetch all orders error:', error);
      res.status(500).json([]);
    }
  });

  app.get('/api/users/:userId/orders', (req, res) => {
    const { userId } = req.params;
    try {
      console.log(`Server: Fetching orders for user_id: ${userId}`);
      const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC').all(Number(userId));
      console.log(`Server: Found ${orders.length} orders for user_id: ${userId}`);
      const formattedOrders = orders.map((o: any) => ({
        ...o,
        userId: o.user_id.toString(),
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        items: JSON.parse(o.items)
      }));
      res.json(formattedOrders);
    } catch (error) {
      console.error('Fetch user orders error:', error);
      res.status(500).json([]);
    }
  });

  app.post('/api/orders', (req, res) => {
    const { id, userId, items, totalAmount, deliveryCharge, status, paymentMethod, paymentStatus, address, phone, customerName, customerEmail } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO orders (id, user_id, items, totalAmount, deliveryCharge, status, paymentMethod, paymentStatus, address, phone, customer_name, customer_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, Number(userId), JSON.stringify(items), totalAmount, deliveryCharge, status, paymentMethod, paymentStatus, address, phone, customerName, customerEmail);
      
      // Add notification for admin
      db.prepare("INSERT INTO notifications (type, message) VALUES (?, ?)").run('order', `নতুন অর্ডার #${id} এসেছে! কাস্টমার: ${customerName}`);

      res.json({ success: true });
    } catch (error) {
      console.error('Order error:', error);
      res.status(500).json({ success: false, message: 'অর্ডার করতে সমস্যা হয়েছে।' });
    }
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।' });
    }
  });

  app.patch('/api/orders/:id/payment', (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    try {
      db.prepare('UPDATE orders SET paymentStatus = ? WHERE id = ?').run(paymentStatus, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'পেমেন্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।' });
    }
  });

  // Stats & Notifications Routes
  app.get('/api/admin/stats', (req, res) => {
    try {
      const visitors = db.prepare("SELECT value FROM site_stats WHERE key = 'visitor_count'").get() as any;
      const logins = db.prepare("SELECT value FROM site_stats WHERE key = 'login_count'").get() as any;
      const users = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get() as any;
      const products = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;
      const orders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
      const revenue = db.prepare("SELECT SUM(totalAmount) as total FROM orders WHERE status = 'delivered'").get() as any;
      
      console.log('Server: Stats requested. Revenue:', revenue?.total || 0, 'Orders:', orders?.count || 0);
      
      res.json({
        visitors: visitors?.value || 0,
        logins: logins?.value || 0,
        users: users?.count || 0,
        products: products?.count || 0,
        orders: orders?.count || 0,
        revenue: revenue?.total || 0
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ success: false });
    }
  });

  app.post('/api/stats/visitor', (req, res) => {
    try {
      db.prepare("UPDATE site_stats SET value = value + 1 WHERE key = 'visitor_count'").run();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  app.get('/api/admin/notifications', (req, res) => {
    try {
      const notifications = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50").all();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  app.post('/api/admin/notifications/read', (req, res) => {
    try {
      db.prepare("UPDATE notifications SET is_read = 1").run();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  app.post('/api/register', (req, res) => {
    const { name, loginId, password } = req.body;
    
    try {
      // Determine if loginId is email or phone
      const isEmail = loginId.includes('@');
      const email = isEmail ? loginId : null;
      const phone_number = isEmail ? null : loginId;

      const stmt = db.prepare('INSERT INTO users (full_name, email, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(name, email, phone_number, password, 'customer');
      
      // Add notification for admin
      db.prepare("INSERT INTO notifications (type, message) VALUES (?, ?)").run('register', `নতুন কাস্টমার '${name}' রেজিস্ট্রেশন করেছেন।`);

      res.json({ 
        success: true, 
        user: { 
          id: info.lastInsertRowid.toString(), 
          name, 
          email, 
          phone_number, 
          role: 'customer' 
        } 
      });
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ success: false, message: 'এই মোবাইল নম্বর বা ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে।' });
      } else {
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি। আবার চেষ্টা করুন।' });
      }
    }
  });

  app.post('/api/login', (req, res) => {
    try {
      const { loginId, password } = req.body;
      console.log('Login attempt for loginId:', loginId);
      
      if (!loginId || !password) {
        return res.status(400).json({ success: false, message: 'মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড প্রয়োজন।' });
      }
      
      // Check email, phone_number, or full_name columns
      const stmt = db.prepare('SELECT * FROM users WHERE (email = ? OR phone_number = ? OR full_name = ?) AND password_hash = ?');
      const user = stmt.get(loginId, loginId, loginId, password);
      
      if (user) {
        console.log('Login success for:', user.email || user.phone_number || user.full_name, 'Role:', user.role);
        
        // Add notification for admin if it's a customer login
        if (user.role === 'customer') {
          db.prepare("INSERT INTO notifications (type, message) VALUES (?, ?)").run('login', `কাস্টমার '${user.full_name}' লগইন করেছেন।`);
          db.prepare("UPDATE site_stats SET value = value + 1 WHERE key = 'login_count'").run();
        }

        return res.json({ 
          success: true, 
          user: { 
            id: user.user_id.toString(), 
            name: user.full_name, 
            email: user.email, 
            phone_number: user.phone_number, 
            role: user.role 
          } 
        });
      } else {
        console.log('Login failed for loginId:', loginId);
        // Debug: check if user exists at all
        const checkUser = db.prepare('SELECT * FROM users WHERE email = ? OR phone_number = ? OR full_name = ?').get(loginId, loginId, loginId);
        if (checkUser) {
          console.log('User found but password mismatch.');
        } else {
          console.log('User not found in database.');
        }
        return res.status(401).json({ success: false, message: 'ভুল মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড।' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: `সার্ভার ত্রুটি: ${error.message || 'আবার চেষ্টা করুন।'}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
