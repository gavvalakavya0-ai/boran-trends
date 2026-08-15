import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS } from './src/data/initialProducts';
import { Product, Order, OrderStatus } from './src/types';

// Load environment variables from .env
dotenv.config();

// If some environment variables are not in process.env or updated in .env.example, load them
try {
  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(envExamplePath)) {
    const parsedEnv = dotenv.parse(fs.readFileSync(envExamplePath));
    for (const [k, v] of Object.entries(parsedEnv)) {
      if (v && !v.includes('username:password') && !v.startsWith('MY_')) {
        process.env[k] = v;
      }
    }
  }
} catch (e) {
  // ignore
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'boran_trends_jwt_secret_key_2026';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'boran-trends';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'sanjay';

// Configure Cloudinary if credentials are provided in environment
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary image storage configured successfully!');
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
  console.log('Cloudinary URL configured successfully!');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage setup for Admin Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'product-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Mongoose MongoDB Schemas & Models
interface IProductDoc {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  originalPrice?: number;
  discount: number;
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
  colours: string[];
  stock: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IOrderDoc {
  id: string;
  customerId?: string;
  customerName: string;
  mobile: string;
  email?: string;
  shippingAddress: {
    fullName?: string;
    mobile?: string;
    email?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    image?: string;
    price: number;
    quantity: number;
    size?: string;
    colour?: string;
    color?: string;
    total?: number;
  }>;
  subtotal?: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string;
  upiNumber?: string;
  utrNumber?: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

const MongoProductSchema = new mongoose.Schema<IProductDoc>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  category: { type: String, required: true },
  description: { type: String, required: true },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  colours: [{ type: String }],
  stock: { type: Number, default: 20 },
  images: [{ type: String }],
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 1 },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

const MongoOrderSchema = new mongoose.Schema<IOrderDoc>({
  id: { type: String, required: true, unique: true },
  customerId: { type: String },
  customerName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  shippingAddress: {
    fullName: String,
    mobile: String,
    email: String,
    streetAddress: String,
    city: String,
    state: String,
    pinCode: String,
  },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      image: { type: String },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      size: { type: String },
      colour: { type: String },
      color: { type: String },
      total: { type: Number },
    },
  ],
  subtotal: { type: Number },
  deliveryCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'UPI' },
  upiNumber: { type: String },
  utrNumber: { type: String },
  paymentStatus: { type: String, default: 'Completed' },
  orderStatus: { type: String, default: 'Confirmed' },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const MongoProduct = (mongoose.models.Product as mongoose.Model<IProductDoc>) || mongoose.model<IProductDoc>('Product', MongoProductSchema);
const MongoOrder = (mongoose.models.Order as mongoose.Model<IOrderDoc>) || mongoose.model<IOrderDoc>('Order', MongoOrderSchema);

let isMongoConnected = false;
let mongoConnectionStatus: 'connected' | 'connecting' | 'error' | 'not_configured' = 'connecting';
let mongoConnectionError: string | null = null;

function normalizeMongoUri(rawUri?: string): string | undefined {
  if (!rawUri) return undefined;
  let uri = rawUri.trim();
  if (uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://')) {
    const queryIndex = uri.indexOf('?');
    const basePart = queryIndex !== -1 ? uri.substring(0, queryIndex) : uri;
    const queryPart = queryIndex !== -1 ? uri.substring(queryIndex) : '';
    
    const urlWithoutProtocol = basePart.replace(/^mongodb(?:\+srv)?:\/\//, '');
    const slashIndex = urlWithoutProtocol.indexOf('/');
    
    if (slashIndex === -1 || slashIndex === urlWithoutProtocol.length - 1) {
      const cleanBase = basePart.endsWith('/') ? basePart + 'borantrends' : basePart + '/borantrends';
      const cleanQuery = queryPart ? queryPart : '?retryWrites=true&w=majority';
      return cleanBase + cleanQuery;
    }
  }
  return uri;
}

const rawMongoUri = process.env.MONGODB_URI;
const mongoUri = normalizeMongoUri(rawMongoUri);
const isPlaceholderMongoUri =
  !mongoUri ||
  mongoUri.includes('username:password') ||
  mongoUri.includes('your_') ||
  mongoUri.includes('cluster.mongodb.net/boran_trends');

async function connectToMongoDB() {
  if (mongoUri && !isPlaceholderMongoUri && (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'))) {
    mongoConnectionStatus = 'connecting';
    try {
      if (mongoose.connection.readyState === 1) {
        isMongoConnected = true;
        mongoConnectionStatus = 'connected';
        mongoConnectionError = null;
        return true;
      }
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      isMongoConnected = true;
      mongoConnectionStatus = 'connected';
      mongoConnectionError = null;
      console.log('MongoDB Atlas connected successfully!');
      return true;
    } catch (err: any) {
      isMongoConnected = false;
      mongoConnectionStatus = 'error';
      mongoConnectionError = err?.message || String(err);
      console.log(
        'MongoDB Atlas connection notice (Tip: In MongoDB Atlas Security -> Network Access, ensure IP 0.0.0.0/0 is added to allow access from cloud containers):',
        mongoConnectionError
      );
      return false;
    }
  } else {
    isMongoConnected = false;
    mongoConnectionStatus = 'not_configured';
    mongoConnectionError = 'MongoDB URI is not configured or contains placeholder credentials.';
    console.log('MongoDB URI is not configured or is a placeholder. Using Firebase Firestore & local database storage.');
    return false;
  }
}

connectToMongoDB();

// JSON Local Database File Persistence
const dbFilePath = path.join(process.cwd(), 'data_db.json');

interface DBData {
  products: Product[];
  orders: Order[];
  customers: Array<{ id: string; name: string; email: string; mobile: string; passwordHash: string; createdAt: string }>;
}

function loadDB(): DBData {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading DB file, seeding initial data...', err);
  }

  // Seed default data
  const defaultDB: DBData = {
    products: INITIAL_PRODUCTS,
    orders: [
      {
        id: 'BT-1001',
        customerName: 'Rahul Sharma',
        mobile: '9876543210',
        email: 'rahul.sharma@example.com',
        shippingAddress: {
          fullName: 'Rahul Sharma',
          mobile: '9876543210',
          email: 'rahul.sharma@example.com',
          streetAddress: 'Plot 42, Green Glen Layout, Bellandur',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560103',
        },
        items: [
          {
            productId: 'bt-prod-1',
            name: 'Oversized Streetwear Acid Wash Hoodie',
            image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
            price: 1499,
            quantity: 1,
            size: 'L',
            colour: 'Charcoal Black',
          },
        ],
        subtotal: 1499,
        deliveryCharge: 0,
        totalAmount: 1499,
        paymentMethod: 'UPI',
        upiNumber: '7013932279',
        paymentStatus: 'Completed',
        orderStatus: 'Shipped',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    customers: [
      {
        id: 'cust-1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        mobile: '9876543210',
        passwordHash: bcrypt.hashSync('Customer@123', 10),
        createdAt: new Date().toISOString(),
      },
    ],
  };
  saveDB(defaultDB);
  return defaultDB;
}

function saveDB(data: DBData) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

let db = loadDB();

// Initialize Firebase Firestore for persistent cloud database storage
let firestoreDb: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const firebaseApp = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log('Firebase Firestore persistent database initialized successfully!');
  }
} catch (err) {
  console.error('Failed to initialize Firebase Firestore:', err);
}

// Sync helper to load products and orders from MongoDB / Firestore or seed if empty
async function syncFromCloudDB() {
  if (isMongoConnected) {
    try {
      const mongoProds = await MongoProduct.find({ active: { $ne: false } }).sort({ createdAt: -1 });
      if (mongoProds.length > 0) {
        db.products = mongoProds.map((doc) => doc.toObject() as unknown as Product);
      } else {
        for (const p of db.products) {
          await MongoProduct.create({ ...p, active: true, updatedAt: new Date().toISOString() });
        }
      }

      const mongoOrders = await MongoOrder.find().sort({ createdAt: -1 });
      if (mongoOrders.length > 0) {
        db.orders = mongoOrders.map((doc) => doc.toObject() as unknown as Order);
      } else {
        for (const o of db.orders) {
          await MongoOrder.create(o);
        }
      }
      return;
    } catch (err) {
      console.error('Error syncing from MongoDB Atlas:', err);
    }
  }

  if (firestoreDb) {
    try {
      const productsSnap = await getDocs(collection(firestoreDb, 'products'));
      if (!productsSnap.empty) {
        const fetchedProducts: Product[] = [];
        productsSnap.forEach((d) => {
          fetchedProducts.push(d.data() as Product);
        });
        fetchedProducts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        db.products = fetchedProducts;
        console.log(`Synced ${fetchedProducts.length} products from Firebase Firestore.`);
      } else {
        for (const prod of db.products) {
          await setDoc(doc(firestoreDb, 'products', prod.id), prod);
        }
      }

      const ordersSnap = await getDocs(collection(firestoreDb, 'orders'));
      if (!ordersSnap.empty) {
        const fetchedOrders: Order[] = [];
        ordersSnap.forEach((d) => {
          fetchedOrders.push(d.data() as Order);
        });
        fetchedOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        db.orders = fetchedOrders;
        console.log(`Synced ${fetchedOrders.length} orders from Firebase Firestore.`);
      } else {
        for (const ord of db.orders) {
          await setDoc(doc(firestoreDb, 'orders', ord.id), ord);
        }
      }
    } catch (err) {
      console.error('Error syncing with Firestore:', err);
    }
  }
}

async function saveProductToDB(prod: Product) {
  saveDB(db);
  if (isMongoConnected) {
    try {
      await MongoProduct.findOneAndUpdate({ id: prod.id }, { ...prod, active: true, updatedAt: new Date().toISOString() }, { upsert: true, new: true });
    } catch (err) {
      console.error(`Error saving product ${prod.id} to MongoDB:`, err);
    }
  }
  if (firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'products', prod.id), prod);
    } catch (err) {
      console.error(`Error saving product ${prod.id} to Firestore:`, err);
    }
  }
}

async function deleteProductFromDB(id: string) {
  saveDB(db);
  if (isMongoConnected) {
    try {
      await MongoProduct.deleteOne({ id });
    } catch (err) {
      console.error(`Error deleting product ${id} from MongoDB:`, err);
    }
  }
  if (firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'products', id));
    } catch (err) {
      console.error(`Error deleting product ${id} from Firestore:`, err);
    }
  }
}

async function saveOrderToDB(ord: Order) {
  saveDB(db);
  if (isMongoConnected) {
    try {
      await MongoOrder.findOneAndUpdate({ id: ord.id }, ord, { upsert: true, new: true });
    } catch (err) {
      console.error(`Error saving order ${ord.id} to MongoDB:`, err);
    }
  }
  if (firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'orders', ord.id), ord);
    } catch (err) {
      console.error(`Error saving order ${ord.id} to Firestore:`, err);
    }
  }
}

// Upload file/base64 to Cloudinary or fallback to permanent disk URL
async function uploadImageToStorage(fileOrBase64: string | Express.Multer.File): Promise<string> {
  if (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL) {
    try {
      if (typeof fileOrBase64 === 'string') {
        const result = await cloudinary.uploader.upload(fileOrBase64, { folder: 'boran_trends' });
        return result.secure_url;
      } else if (fileOrBase64.path) {
        const result = await cloudinary.uploader.upload(fileOrBase64.path, { folder: 'boran_trends' });
        return result.secure_url;
      }
    } catch (err) {
      console.error('Cloudinary upload error, using fallback:', err);
    }
  }

  if (typeof fileOrBase64 === 'string') {
    return fileOrBase64;
  }
  return `/uploads/${fileOrBase64.filename}`;
}

// Admin Authentication Middleware
interface AuthRequest extends Request {
  adminUser?: string;
  user?: any;
}

function authenticateAdminToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
    }
    req.adminUser = decoded.username;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired admin session token.' });
  }
}

function authenticateCustomerToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired. Please login again.' });
  }
}

// ---------------- API ROUTES ----------------

// Healthcheck & Detailed Database Status
app.get('/api/health', async (req, res) => {
  // Obfuscate password in MongoDB URI if present for security
  let sanitizedMongoUri: string | null = null;
  if (mongoUri && !isPlaceholderMongoUri) {
    sanitizedMongoUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  }

  res.json({
    status: 'ok',
    store: "BORAN TRENDS MEN'S WEAR REST API",
    timestamp: new Date().toISOString(),
    databases: {
      mongoDB: {
        connected: isMongoConnected,
        status: isMongoConnected ? 'connected' : mongoConnectionStatus,
        error: mongoConnectionError,
        configuredUri: sanitizedMongoUri,
      },
      firebaseFirestore: {
        connected: Boolean(firestoreDb),
        status: firestoreDb ? 'connected' : 'uninitialized',
      },
      persistentStore: {
        status: 'active',
        productsCount: db.products.length,
        ordersCount: db.orders.length,
        customersCount: db.customers.length,
      },
    },
    cloudinary: {
      configured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    },
    admin: {
      username: ADMIN_USER,
    },
  });
});

// Endpoint to trigger connection test to MongoDB on demand
app.get('/api/health/test-mongodb', async (req, res) => {
  const success = await connectToMongoDB();
  res.json({
    success,
    status: isMongoConnected ? 'connected' : 'disconnected',
    mongoConnectionStatus,
    error: mongoConnectionError,
  });
});

// Admin Login Route
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter both username and password.' });
  }

  const isUserValid = username === ADMIN_USER;
  const isPassValid = password === ADMIN_PASS;

  if (!isUserValid || !isPassValid) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = jwt.sign({ username: ADMIN_USER, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });

  return res.json({
    message: 'Admin authentication successful',
    token,
    admin: {
      username: ADMIN_USER,
      role: 'admin',
    },
  });
});

// Admin Verify Token / Profile
app.get('/api/admin/me', authenticateAdminToken, (req: AuthRequest, res) => {
  res.json({ username: req.adminUser, role: 'admin' });
});

// Admin Dashboard Stats
app.get('/api/admin/stats', authenticateAdminToken, (req, res) => {
  const totalProducts = db.products.length;
  const totalOrders = db.orders.length;
  const pendingOrders = db.orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
  const completedOrders = db.orders.filter((o) => o.orderStatus === 'Delivered').length;
  const totalCustomers = db.customers.length;
  const totalSales = db.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  res.json({
    totalProducts,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalCustomers,
    totalSales,
  });
});

// GET /api/products - Public Products Listing (REST API)
app.get('/api/products', async (req, res) => {
  try {
    // If MongoDB is connected, dynamically query MongoDB to ensure fresh cross-instance syncing
    if (isMongoConnected) {
      try {
        const mongoProds = await MongoProduct.find({ active: { $ne: false } }).sort({ createdAt: -1 });
        if (mongoProds && mongoProds.length > 0) {
          db.products = mongoProds.map((doc) => doc.toObject() as unknown as Product);
        }
      } catch (mErr) {
        console.warn('Notice querying MongoDB for products:', mErr);
      }
    }

    let result = Array.isArray(db?.products) && db.products.length > 0 ? [...db.products] : [...INITIAL_PRODUCTS];
    const { category, search, sort } = req.query;

    if (category && typeof category === 'string' && category !== 'All' && category !== 'All Categories') {
      if (category.toLowerCase() === 'new arrivals') {
        result = result.filter((p) => p.isNewArrival);
      } else {
        result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.json(result);
  } catch (err: any) {
    console.error('Error serving /api/products:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.json(INITIAL_PRODUCTS);
  }
});

// GET /api/admin/products - Admin View All Products Route
app.get('/api/admin/products', authenticateAdminToken, async (req, res) => {
  if (isMongoConnected) {
    try {
      const mongoProds = await MongoProduct.find().sort({ createdAt: -1 });
      if (mongoProds && mongoProds.length > 0) {
        db.products = mongoProds.map((doc) => doc.toObject() as unknown as Product);
      }
    } catch (mErr) {
      console.warn('Notice querying MongoDB for admin products:', mErr);
    }
  }
  res.json(db.products);
});

// GET /api/products/:id - Public Product Details
app.get('/api/products/:id', (req, res) => {
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Admin Image Upload Endpoint
app.post('/api/admin/upload', authenticateAdminToken, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const imageUrl = await uploadImageToStorage(req.file);
  res.json({ imageUrl, filename: req.file.filename });
});

// POST /api/products & POST /api/admin/products - Create Product Handler
const handleCreateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      category,
      price,
      discount,
      discountPrice,
      originalPrice,
      sizes,
      colors,
      colours,
      stock,
      description,
      specifications,
      isNewArrival,
      isBestSeller,
      imageBase64List,
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Product name, category, and price are required.' });
    }

    let images: string[] = [];

    // Process base64 list or image file uploads
    if (imageBase64List) {
      try {
        const parsed = typeof imageBase64List === 'string' ? JSON.parse(imageBase64List) : imageBase64List;
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const img of parsed) {
            const uploadedUrl = await uploadImageToStorage(img);
            images.push(uploadedUrl);
          }
        }
      } catch (e) {
        if (typeof imageBase64List === 'string' && imageBase64List.trim()) {
          const uploadedUrl = await uploadImageToStorage(imageBase64List);
          images.push(uploadedUrl);
        }
      }
    }

    if (images.length === 0 && req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files as Express.Multer.File[]) {
        const uploadedUrl = await uploadImageToStorage(file);
        images.push(uploadedUrl);
      }
    }

    if (images.length === 0) {
      images = ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'];
    }

    const parsedPrice = parseFloat(price);
    const parsedDiscount = discount ? parseFloat(discount) : 0;
    const calcDiscountPrice = discountPrice ? parseFloat(discountPrice) : Math.round(parsedPrice * (1 - parsedDiscount / 100));
    const calcOriginalPrice = originalPrice ? parseFloat(originalPrice) : Math.round(parsedPrice * (1 + (parsedDiscount || 20) / 100));

    let parsedSizes: string[] = ['S', 'M', 'L', 'XL'];
    const rawSizes = sizes;
    if (rawSizes) {
      if (Array.isArray(rawSizes)) parsedSizes = rawSizes;
      else if (typeof rawSizes === 'string') parsedSizes = rawSizes.split(',').map((s) => s.trim()).filter(Boolean);
    }

    let parsedColours: string[] = ['Black', 'Navy', 'White'];
    const rawColours = colours || colors;
    if (rawColours) {
      if (Array.isArray(rawColours)) parsedColours = rawColours;
      else if (typeof rawColours === 'string') parsedColours = rawColours.split(',').map((c) => c.trim()).filter(Boolean);
    }

    let parsedSpecs: Record<string, string> = {
      Fabric: '100% Premium Cotton',
      Fit: 'Regular Fit',
      Care: 'Machine wash cold',
    };
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        // default
      }
    }

    const newProduct: Product = {
      id: 'bt-prod-' + Date.now(),
      name,
      category,
      price: parsedPrice,
      originalPrice: calcOriginalPrice,
      discount: parsedDiscount,
      sizes: parsedSizes,
      colours: parsedColours,
      rating: 5.0,
      reviewsCount: 1,
      description: description || 'High quality premium men wear from Boran Trends.',
      specifications: parsedSpecs,
      stock: stock ? parseInt(stock, 10) : 20,
      images,
      isNewArrival: isNewArrival === 'true' || isNewArrival === true,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    await saveProductToDB(newProduct);

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create product: ' + err.message });
  }
};

app.post('/api/products', authenticateAdminToken, upload.any(), handleCreateProduct);
app.post('/api/admin/products', authenticateAdminToken, upload.any(), handleCreateProduct);

// PUT /api/admin/products/:id - Edit Product Route
app.put('/api/admin/products/:id', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  const index = db.products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db.products[index];
  const updatedProduct: Product = {
    ...existing,
    ...req.body,
    price: req.body.price ? parseFloat(req.body.price) : existing.price,
    stock: req.body.stock !== undefined ? parseInt(req.body.stock, 10) : existing.stock,
  };

  db.products[index] = updatedProduct;
  await saveProductToDB(updatedProduct);

  res.json({ message: 'Product updated successfully', product: updatedProduct });
});

// DELETE /api/products/:id & DELETE /api/admin/products/:id - Delete Product Route
const handleDeleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const initialCount = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);

  if (db.products.length === initialCount) {
    return res.status(404).json({ error: 'Product not found' });
  }

  await deleteProductFromDB(id);
  res.json({ message: 'Product deleted successfully', productId: id });
};

app.delete('/api/products/:id', authenticateAdminToken, handleDeleteProduct);
app.delete('/api/admin/products/:id', authenticateAdminToken, handleDeleteProduct);

// GET /api/orders & GET /api/admin/orders - View Orders
app.get('/api/orders', (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { mobile, email } = req.query;

    // If query params for customer provided
    if (mobile || email) {
      const filtered = db.orders.filter(
        (o) => (mobile && o.mobile === mobile) || (email && o.email?.toLowerCase() === String(email).toLowerCase())
      );
      return res.json(filtered);
    }

    // If admin token provided
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.role === 'admin') {
          return res.json(db.orders);
        } else if (decoded.id || decoded.email) {
          const userOrders = db.orders.filter(
            (o) => (decoded.id && o.customerId === decoded.id) || (decoded.email && o.email?.toLowerCase() === decoded.email.toLowerCase())
          );
          return res.json(userOrders);
        }
      } catch (e) {
        // Token invalid
      }
    }

    return res.status(401).json({ error: 'Access denied. Please login or provide mobile/email query.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error fetching orders: ' + err.message });
  }
});

app.get('/api/admin/orders', authenticateAdminToken, (req, res) => {
  res.json(db.orders);
});

// PATCH /api/admin/orders/:id/status & PUT /api/orders/:id/status - Update Order Status
const handleUpdateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { orderStatus, status } = req.body;
  const targetStatus = orderStatus || status;

  const validStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
  if (!targetStatus || !validStatuses.includes(targetStatus)) {
    return res.status(400).json({ error: 'Invalid order status. Must be one of: ' + validStatuses.join(', ') });
  }

  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.orderStatus = targetStatus;
  await saveOrderToDB(order);

  res.json({ message: 'Order status updated successfully', order });
};

app.patch('/api/admin/orders/:id/status', authenticateAdminToken, handleUpdateOrderStatus);
app.put('/api/orders/:id/status', authenticateAdminToken, handleUpdateOrderStatus);

// POST /api/orders - Public Place Customer Order Endpoint (Saves embedded product snapshot)
app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, customerName, mobile, email, shippingAddress, items, paymentMethod, upiNumber, utrNumber } = req.body;

    if (!customerName || !mobile || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Please provide customer name, mobile number, shipping address, and order items.' });
    }

    // Map items and ensure a full snapshot (name, image, price, size, colour) is preserved permanently
    const snapshotItems = items.map((item: any) => ({
      productId: item.productId || item.id || 'bt-prod-custom',
      name: item.name || item.product?.name || 'Boran Trends Apparel',
      image: item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      price: item.price || item.product?.price || 999,
      quantity: item.quantity || 1,
      size: item.size || item.selectedSize || 'M',
      colour: item.colour || item.color || item.selectedColour || 'Default',
      total: (item.price || item.product?.price || 999) * (item.quantity || 1),
    }));

    const subtotal = snapshotItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const deliveryCharge = subtotal >= 999 ? 0 : 70;
    const totalAmount = subtotal + deliveryCharge;

    const orderId = 'BT-' + Math.floor(10000 + Math.random() * 90000);

    const newOrder: Order = {
      id: orderId,
      customerId: customerId || '',
      customerName,
      mobile,
      email: email || '',
      shippingAddress: {
        fullName: shippingAddress.fullName || customerName,
        mobile: shippingAddress.mobile || mobile,
        email: shippingAddress.email || email || '',
        streetAddress: shippingAddress.streetAddress || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        pinCode: shippingAddress.pinCode || '',
      },
      items: snapshotItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: paymentMethod || 'UPI',
      upiNumber: upiNumber || '7013932279',
      utrNumber: utrNumber || '',
      paymentStatus: 'Completed',
      orderStatus: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    await saveOrderToDB(newOrder);

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: newOrder.id,
      order: newOrder,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to place order: ' + err.message });
  }
});

// GET /api/orders/my-orders & GET /api/customer/orders - Customer Orders History
app.get('/api/orders/my-orders', authenticateCustomerToken, (req: AuthRequest, res) => {
  const user = req.user;
  const userOrders = db.orders.filter(
    (o) => (user.id && o.customerId === user.id) || (user.email && o.email.toLowerCase() === user.email.toLowerCase())
  );
  res.json(userOrders);
});

app.get('/api/customer/orders', authenticateCustomerToken, (req: AuthRequest, res) => {
  const user = req.user;
  const userOrders = db.orders.filter(
    (o) => (user.id && o.customerId === user.id) || (user.email && o.email.toLowerCase() === user.email.toLowerCase())
  );
  res.json(userOrders);
});

// GET /api/orders/:id - Customer Search Single Order Details
app.get('/api/orders/:id', (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Customer Registration
app.post('/api/customer/register', (req, res) => {
  const { name, email, mobile, password } = req.body;

  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ error: 'Name, email, mobile number, and password are required.' });
  }

  const existing = db.customers.find((c) => c.email.toLowerCase() === email.toLowerCase() || c.mobile === mobile);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email or mobile number already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newCustomer = {
    id: 'cust-' + Date.now(),
    name,
    email,
    mobile,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  db.customers.push(newCustomer);
  saveDB(db);

  const token = jwt.sign({ id: newCustomer.id, email: newCustomer.email, name: newCustomer.name }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    message: 'Customer account created successfully',
    customer: { id: newCustomer.id, name: newCustomer.name, email: newCustomer.email, mobile: newCustomer.mobile },
    token,
  });
});

// Customer Login
app.post('/api/customer/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter your email/mobile and password.' });
  }

  const customer = db.customers.find(
    (c) => c.email.toLowerCase() === identifier.toLowerCase() || c.mobile === identifier
  );

  if (!customer || !bcrypt.compareSync(password, customer.passwordHash)) {
    return res.status(401).json({ error: 'Invalid login credentials. Please check your email/mobile and password.' });
  }

  const token = jwt.sign({ id: customer.id, email: customer.email, name: customer.name }, JWT_SECRET, { expiresIn: '7d' });

  const customerOrders = db.orders.filter(
    (o) => o.mobile === customer.mobile || (customer.email && o.email.toLowerCase() === customer.email.toLowerCase())
  );

  res.json({
    message: 'Login successful',
    customer: { id: customer.id, name: customer.name, email: customer.email, mobile: customer.mobile },
    orders: customerOrders,
    token,
  });
});

// Explicit 404 handler for API routes (prevents fallback to HTML)
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.path} not found` });
});

// Express Error Handler for API routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
  next(err);
});

// Vite Middleware for Development / Static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` BORAN TRENDS MEN'S WEAR Server running on port ${PORT}`);
    console.log(` Admin Username: ${ADMIN_USER}`);
    console.log(`====================================================`);

    // Non-blocking cloud database sync after server starts
    syncFromCloudDB().catch((err) => {
      console.error('Cloud DB background sync error:', err);
    });
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
