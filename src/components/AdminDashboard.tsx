import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  DollarSign,
  PlusCircle,
  Edit,
  Trash2,
  Upload,
  Search,
  LogOut,
  X,
  RefreshCw,
  Eye,
  Check,
  ArrowUpRight,
  ChevronDown,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Database,
  Activity,
  Server,
  AlertCircle,
} from 'lucide-react';
import { Product, Order, OrderStatus, AdminStats, ProductCategory } from '../types';
import { compressImageFile } from '../utils/imageOptimizer';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getApiUrl } from '../config/api';

interface AdminDashboardProps {
  token: string;
  adminUsername: string;
  onLogout: () => void;
  onRefreshProducts: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Combo Offers',
  'Shirts',
  'T-Shirts',
  'baggy Jeans',
  'formal shirts',
  'Formal pants',
  'cargo pants',
  'hoodies',
  'New Arrivals',
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  adminUsername,
  onLogout,
  onRefreshProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'STATS' | 'ADD_PRODUCT' | 'MANAGE_PRODUCTS' | 'ORDERS' | 'CUSTOMERS'>('STATS');

  // Dashboard Stats
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    totalSales: 0,
  });

  // Products List
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Orders List
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Add Product Form State
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState<ProductCategory>('Shirts');
  const [addPrice, setAddPrice] = useState('');
  const [addDiscount, setAddDiscount] = useState('30');
  const [addStock, setAddStock] = useState('25');
  const [addDescription, setAddDescription] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [addColours, setAddColours] = useState('Black, Navy, Olive');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // API & Database Health State
  const [healthData, setHealthData] = useState<{
    status: string;
    store: string;
    timestamp: string;
    databases?: {
      mongoDB?: {
        connected: boolean;
        status: string;
        error?: string | null;
        configuredUri?: string | null;
      };
      firebaseFirestore?: {
        connected: boolean;
        status: string;
      };
      persistentStore?: {
        status: string;
        productsCount: number;
        ordersCount: number;
        customersCount: number;
      };
    };
    cloudinary?: {
      configured: boolean;
      cloudName?: string | null;
    };
    admin?: {
      username: string;
    };
  } | null>(null);
  const [isTestingMongo, setIsTestingMongo] = useState(false);
  const [testMongoResult, setTestMongoResult] = useState<string | null>(null);

  // Fetch API Health & Database Status
  const fetchHealth = async () => {
    try {
      const res = await fetch(getApiUrl('/api/health'));
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (err) {
      console.warn('Error fetching API health:', err);
    }
  };

  const testMongoConnection = async () => {
    try {
      setIsTestingMongo(true);
      setTestMongoResult(null);
      const res = await fetch(getApiUrl('/api/health/test-mongodb'));
      const data = await res.json();
      if (data.success || data.status === 'connected') {
        setTestMongoResult('MongoDB connected successfully!');
      } else {
        setTestMongoResult(`MongoDB connection status: ${data.mongoConnectionStatus || 'failed'}. ${data.error || ''}`);
      }
      await fetchHealth();
    } catch (err: any) {
      setTestMongoResult(`Connection check failed: ${err.message || String(err)}`);
    } finally {
      setIsTestingMongo(false);
    }
  };

  // Load Dashboard Data
  const fetchStats = async () => {
    try {
      let res: Response | null = null;
      try {
        res = await fetch(getApiUrl('/api/admin/stats'), {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (networkErr) {
        // If external URL fails, fallback to relative endpoint
        if (getApiUrl('/api/admin/stats') !== '/api/admin/stats') {
          res = await fetch('/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      if (res && res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setStats(data);
        }
      }
    } catch (err) {
      console.warn('Could not fetch admin stats from remote:', err);
    }
  };

  const fetchAdminProducts = async () => {
    try {
      setLoadingProducts(true);
      let res: Response | null = null;
      try {
        res = await fetch(getApiUrl('/api/admin/products'), {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (networkErr) {
        if (getApiUrl('/api/admin/products') !== '/api/admin/products') {
          res = await fetch('/api/admin/products', {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      if (res && res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
            return;
          }
        }
      }
      
      let fallbackRes: Response | null = null;
      try {
        fallbackRes = await fetch(getApiUrl('/api/products'));
      } catch (e) {
        fallbackRes = await fetch('/api/products');
      }

      if (fallbackRes && fallbackRes.ok) {
        const fallbackType = fallbackRes.headers.get('content-type');
        if (fallbackType && fallbackType.includes('application/json')) {
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData)) {
            setProducts(fallbackData);
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch admin products from remote:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      let res: Response | null = null;
      try {
        res = await fetch(getApiUrl('/api/admin/orders'), {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (networkErr) {
        if (getApiUrl('/api/admin/orders') !== '/api/admin/orders') {
          res = await fetch('/api/admin/orders', {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      if (res && res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setOrders(data);
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch admin orders from remote:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAdminProducts();
    fetchOrders();
    fetchHealth();
  }, [token, activeTab]);

  // Handle File Selection for Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArr]);

      const previews = filesArr.map((file) => URL.createObjectURL(file as Blob));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeImagePreview = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle Size Selection
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // Submit Add Product Form
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccessMessage('');
    setFormErrorMessage('');

    if (!addName.trim() || !addPrice.trim() || !addDescription.trim()) {
      setFormErrorMessage('Please fill in product name, price, and description.');
      return;
    }

    setIsSubmittingProduct(true);

    try {
      const formData = new FormData();
      formData.append('name', addName);
      formData.append('category', addCategory);
      formData.append('price', addPrice);
      formData.append('discount', addDiscount);
      formData.append('stock', addStock);
      formData.append('description', addDescription);
      formData.append('sizes', JSON.stringify(selectedSizes));

      const coloursArr = addColours.split(',').map((c) => c.trim()).filter(Boolean);
      formData.append('colours', JSON.stringify(coloursArr));

      if (imageFiles.length === 0) {
        setFormErrorMessage('Please upload at least one product photo from your device.');
        setIsSubmittingProduct(false);
        return;
      }

      // Compress image files to high-definition Web JPEG (<120KB each) to ensure instant cloud database syncing
      const compressedImages = await Promise.all(
        imageFiles.map((file) => compressImageFile(file, 1200, 1200, 0.82))
      );
      formData.append('imageBase64List', JSON.stringify(compressedImages));

      // Append raw files as fallback
      imageFiles.forEach((file) => {
        formData.append('images', file);
        formData.append('imageFiles', file);
      });

      const res = await fetch(getApiUrl('/api/admin/products'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload product.');
      }

      // Also directly write to Cloud Firestore database for instant real-time broadcast across all devices
      if (data.product) {
        try {
          await setDoc(doc(db, 'products', data.product.id), data.product);
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, `products/${data.product.id}`);
        }
      }

      setFormSuccessMessage(`Product "${data.product.name}" uploaded successfully! It is now stored in backend database and live on all devices.`);
      
      // Reset Form
      setAddName('');
      setAddPrice('');
      setAddDescription('');
      setImageFiles([]);
      setImagePreviews([]);

      // Refresh Data
      fetchAdminProducts();
      fetchStats();
      onRefreshProducts();
    } catch (err: any) {
      setFormErrorMessage(err.message || 'Error uploading product');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the store?`)) return;

    try {
      // Delete from cloud Firestore
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.DELETE, `products/${id}`);
      }

      const res = await fetch(getApiUrl(`/api/admin/products/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchAdminProducts();
        fetchStats();
        onRefreshProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Save Product Edits
  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      // Update in cloud Firestore
      try {
        await setDoc(doc(db, 'products', editingProduct.id), editingProduct, { merge: true });
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.UPDATE, `products/${editingProduct.id}`);
      }

      const res = await fetch(getApiUrl(`/api/admin/products/${editingProduct.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        setEditingProduct(null);
        fetchAdminProducts();
        onRefreshProducts();
      }
    } catch (err) {
      console.error('Error editing product:', err);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.mobile.includes(orderSearch) ||
      (o.utrNumber && o.utrNumber.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.items && o.items.some((item) => item.name.toLowerCase().includes(orderSearch.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-lg shadow-blue-600/20">
            BT
          </div>
          <div>
            <h1 className="text-lg font-black text-white uppercase tracking-tight">
              BORAN TRENDS ADMIN DASHBOARD
            </h1>
            <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Administrator ({adminUsername})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchStats();
              fetchAdminProducts();
              fetchOrders();
              fetchHealth();
            }}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl transition-colors border border-zinc-700/50"
            title="Refresh Data & Health"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </header>

      {/* Main Panel Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('STATS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'STATS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>OVERVIEW STATS</span>
          </button>

          <button
            onClick={() => setActiveTab('ADD_PRODUCT')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ADD_PRODUCT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>ADD NEW PRODUCT</span>
          </button>

          <button
            onClick={() => setActiveTab('MANAGE_PRODUCTS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MANAGE_PRODUCTS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>MANAGE PRODUCTS ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ORDERS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ORDERS ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW STATS */}
        {activeTab === 'STATS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">TOTAL SALES</span>
                <div className="text-2xl font-black text-blue-400">₹{stats.totalSales}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Live Revenue</div>
              </div>

              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">TOTAL ORDERS</span>
                <div className="text-2xl font-black text-white">{stats.totalOrders}</div>
                <div className="text-[10px] text-zinc-400 font-semibold">Placed Orders</div>
              </div>

              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">PENDING ORDERS</span>
                <div className="text-2xl font-black text-blue-400">{stats.pendingOrders}</div>
                <div className="text-[10px] text-blue-400 font-semibold">Action Required</div>
              </div>

              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">DELIVERED</span>
                <div className="text-2xl font-black text-emerald-400">{stats.completedOrders}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Completed</div>
              </div>

              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">PRODUCTS</span>
                <div className="text-2xl font-black text-white">{stats.totalProducts}</div>
                <div className="text-[10px] text-zinc-400 font-semibold">Catalog Items</div>
              </div>

              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">CUSTOMERS</span>
                <div className="text-2xl font-black text-sky-400">{stats.totalCustomers}</div>
                <div className="text-[10px] text-sky-400 font-semibold">Registered</div>
              </div>
            </div>

            {/* Database & API Health Diagnostics Panel */}
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      DATABASE & API HEALTH STATUS
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Live connection status for MongoDB Atlas, Cloud Firestore, and API endpoints
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchHealth}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-all border border-zinc-700/50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check Health</span>
                  </button>
                  <button
                    onClick={testMongoConnection}
                    disabled={isTestingMongo}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isTestingMongo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                    <span>{isTestingMongo ? 'Testing...' : 'Test MongoDB Connection'}</span>
                  </button>
                </div>
              </div>

              {testMongoResult && (
                <div className={`p-3 rounded-2xl text-xs font-medium border flex items-start gap-2 ${
                  testMongoResult.includes('successfully')
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{testMongoResult}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* MongoDB Status */}
                <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-400" />
                      MongoDB Atlas
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      healthData?.databases?.mongoDB?.connected
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : healthData?.databases?.mongoDB?.status === 'connecting'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {healthData?.databases?.mongoDB?.connected
                        ? 'Connected'
                        : healthData?.databases?.mongoDB?.status === 'connecting'
                        ? 'Connecting...'
                        : healthData?.databases?.mongoDB?.status || 'Disconnected'}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300">
                    {healthData?.databases?.mongoDB?.connected
                      ? 'Products & Orders synced directly with your MongoDB database.'
                      : 'Connecting to MongoDB Atlas cluster. If connection fails, check MongoDB Atlas Network Access has 0.0.0.0/0 allowed.'}
                  </p>

                  {healthData?.databases?.mongoDB?.configuredUri && (
                    <div className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded truncate border border-zinc-800">
                      URI: {healthData.databases.mongoDB.configuredUri}
                    </div>
                  )}

                  {healthData?.databases?.mongoDB?.error && (
                    <div className="text-[10px] text-amber-400 bg-amber-950/30 p-2 rounded border border-amber-900/50">
                      {healthData.databases.mongoDB.error}
                    </div>
                  )}
                </div>

                {/* Firebase Firestore Status */}
                <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-blue-400" />
                      Cloud Firestore
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {healthData?.databases?.firebaseFirestore?.connected ? 'Connected & Active' : 'Ready'}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300">
                    Real-time cloud database snapshot listener active for real-time customer updates across all devices.
                  </p>
                  <div className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    Real-time broadcast: Enabled
                  </div>
                </div>

                {/* Cloudinary Image CDN Status */}
                <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-purple-400" />
                      Cloudinary Media CDN
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      healthData?.cloudinary?.configured
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-700/20 text-zinc-400 border-zinc-700/40'
                    }`}>
                      {healthData?.cloudinary?.configured ? 'Configured' : 'Local Storage'}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300">
                    {healthData?.cloudinary?.configured
                      ? `Cloudinary storage active (Cloud: ${healthData.cloudinary.cloudName || 'Configured'}).`
                      : 'Product images saved to persistent server uploads directory.'}
                  </p>
                  <div className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    Image Storage: {healthData?.cloudinary?.configured ? 'Cloud CDN' : 'Server Storage'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Recent Orders Table */}
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  RECENT ORDERS & PAYMENT STATUS
                </h3>
                <button
                  onClick={() => setActiveTab('ORDERS')}
                  className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1"
                >
                  <span>View All Orders ({orders.length})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">UTR / Ref No.</th>
                      <th className="p-3">Payment App</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-bold text-blue-400">#{ord.id}</td>
                        <td className="p-3 font-semibold text-white">{ord.customerName} ({ord.mobile})</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{ord.utrNumber || 'N/A'}</td>
                        <td className="p-3 font-semibold text-zinc-300">{ord.paymentMethod}</td>
                        <td className="p-3 font-black text-white">₹{ord.totalAmount}</td>
                        <td className="p-3 font-bold text-zinc-200">{ord.orderStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADD NEW PRODUCT FORM */}
        {activeTab === 'ADD_PRODUCT' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-3xl mx-auto space-y-6">
            <div className="pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-black text-white uppercase">ADD NEW PRODUCT TO STORE</h3>
              <p className="text-xs text-zinc-400">Upload images and set sizes, colours, and price.</p>
            </div>

            {formSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                ✅ {formSuccessMessage}
              </div>
            )}

            {formErrorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                ⚠️ {formErrorMessage}
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Oversized Streetwear Hoodie"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Category *</label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value as ProductCategory)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1299"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Discount (%)</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={addDiscount}
                    onChange={(e) => setAddDiscount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Stock Count</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={addStock}
                    onChange={(e) => setAddStock(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36'].map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        selectedSizes.includes(sz)
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Available Colours</label>
                <input
                  type="text"
                  placeholder="e.g. Black, Navy Blue, Olive Green"
                  value={addColours}
                  onChange={(e) => setAddColours(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Product Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed product descriptions, fabric composition, fit instructions..."
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Photo Upload Section */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">
                  Upload Product Photos <span className="text-rose-400">*</span>
                </label>
                <div className="border-2 border-dashed border-zinc-800 hover:border-blue-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-zinc-950 relative group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-sm font-black text-white uppercase tracking-wider">Select & Upload Photos From Device</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Tap to select photo files (PNG, JPG, WEBP formats supported)</p>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-zinc-400 mb-2">
                      Selected Photos ({imagePreviews.length}):
                    </p>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative w-20 h-24 rounded-xl overflow-hidden border border-zinc-700 shrink-0 bg-zinc-900 group">
                          <img src={preview} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImagePreview(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full hover:bg-rose-600 transition-colors z-20"
                            title="Remove Photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingProduct}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>{isSubmittingProduct ? 'UPLOADING TO STORE...' : 'PUBLISH PRODUCT TO STORE'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MANAGE PRODUCTS LIST */}
        {activeTab === 'MANAGE_PRODUCTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>

              <button
                onClick={() => setActiveTab('ADD_PRODUCT')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-full text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-500 uppercase text-[10px] font-bold border-b border-zinc-800">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-400">
                        <p className="text-sm font-bold">No products found.</p>
                        <p className="text-xs text-zinc-500 mt-1">Try adding a new product or clearing your search filter.</p>
                        <button
                          onClick={() => setActiveTab('ADD_PRODUCT')}
                          className="mt-3 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Add New Product</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-800/40">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-12 object-cover rounded-lg bg-zinc-950"
                          />
                          <div>
                            <span className="font-bold text-white block line-clamp-1">{p.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">ID: {p.id}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-blue-400">{p.category}</td>
                        <td className="p-4 font-black text-white">₹{p.price}</td>
                        <td className="p-4 text-rose-400 font-bold">{p.discount}% OFF</td>
                        <td className="p-4 font-bold text-emerald-400">{p.stock} units</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-2 bg-zinc-800 text-blue-400 hover:text-white rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-2 bg-zinc-800 text-rose-400 hover:text-white rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS & STATUS UPDATES */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Search orders by Order ID, Customer Name, Phone, Product Name, UTR..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
              <div className="text-xs text-zinc-400 font-medium">
                Total Orders: <span className="text-white font-bold">{filteredOrders.length}</span>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 text-center text-zinc-400">
                <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">No orders found</p>
                <p className="text-xs text-zinc-500 mt-1">Try searching with a different Order ID, customer name, or phone number.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="bg-zinc-900 rounded-3xl border border-zinc-800 p-5 space-y-4 shadow-xl">
                    {/* Order Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold font-mono">
                          #{ord.id}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {new Date(ord.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-zinc-400">Status:</span>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className={`border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer transition-colors ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                              : ord.orderStatus === 'Shipped'
                              ? 'bg-purple-950 text-purple-400 border-purple-800 hover:bg-purple-900'
                              : ord.orderStatus === 'Packed'
                              ? 'bg-blue-950 text-blue-400 border-blue-800 hover:bg-blue-900'
                              : ord.orderStatus === 'Confirmed'
                              ? 'bg-cyan-950 text-cyan-400 border-cyan-800 hover:bg-cyan-900'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-rose-950 text-rose-400 border-rose-800 hover:bg-rose-900'
                              : 'bg-amber-950 text-amber-400 border-amber-800 hover:bg-amber-900'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Ordered Products Section */}
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-blue-400" />
                        <span>Ordered Items ({ord.items ? ord.items.length : 0})</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(ord.items || []).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3 items-center hover:border-zinc-700 transition-colors"
                          >
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-16 h-20 object-cover rounded-xl bg-zinc-900 border border-zinc-800/60 shrink-0"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="font-bold text-white text-xs truncate">{item.name}</p>
                              <div className="flex flex-wrap gap-1.5 items-center text-[10px]">
                                {item.size && (
                                  <span className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded font-medium border border-zinc-700/50">
                                    Size: <strong className="text-white">{item.size}</strong>
                                  </span>
                                )}
                                {item.colour && (
                                  <span className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded font-medium border border-zinc-700/50">
                                    Color: <strong className="text-white">{item.colour}</strong>
                                  </span>
                                )}
                              </div>
                              <div className="flex justify-between items-center text-xs pt-0.5">
                                <span className="text-zinc-400 font-mono">
                                  ₹{item.price} × {item.quantity}
                                </span>
                                <span className="font-bold text-emerald-400">₹{item.price * item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Info & Shipping & Payment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80 text-xs">
                      {/* Customer Info */}
                      <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/60 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Customer Contact</span>
                        <p className="font-bold text-white">{ord.customerName}</p>
                        <p className="text-zinc-300 flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <a href={`tel:${ord.mobile}`} className="hover:underline">{ord.mobile}</a>
                        </p>
                        {ord.email && (
                          <p className="text-zinc-400 flex items-center gap-1.5 truncate text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate">{ord.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/60 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>Shipping Address</span>
                        </span>
                        {ord.shippingAddress ? (
                          <div className="text-zinc-300 text-[11px] leading-snug space-y-0.5">
                            <p className="font-bold text-white">{ord.shippingAddress.fullName || ord.customerName}</p>
                            <p className="text-zinc-300">{ord.shippingAddress.streetAddress}</p>
                            <p className="text-zinc-400">{ord.shippingAddress.city}, {ord.shippingAddress.state} - <span className="font-mono font-bold text-blue-400">{ord.shippingAddress.pinCode}</span></p>
                          </div>
                        ) : (
                          <p className="text-zinc-500 italic text-[11px]">No address recorded</p>
                        )}
                      </div>

                      {/* Payment & Order Total */}
                      <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/60 flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Payment Verification</span>
                          <p className="text-zinc-300 flex items-center gap-1.5 font-medium mt-1">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{ord.paymentMethod || 'UPI Payment'}</span>
                          </p>
                          {ord.utrNumber && (
                            <p className="text-emerald-400 font-mono font-bold text-[11px] mt-0.5 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md inline-block">
                              UTR: {ord.utrNumber}
                            </p>
                          )}
                        </div>
                        <div className="pt-2 border-t border-zinc-800/60 flex justify-between items-center">
                          <span className="text-zinc-400 font-semibold">Total Paid:</span>
                          <span className="text-base font-black text-white">₹{ord.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">EDIT PRODUCT: {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-bold block mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider"
              >
                SAVE CHANGES
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
