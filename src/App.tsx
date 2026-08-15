import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { Product, ProductCategory, CartItem, CustomerUser, Order } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from './lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { getApiUrl } from './config/api';

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

export default function App() {
  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart & Wishlist State (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('boran_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('boran_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Customer Auth State
  const [customer, setCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('boran_customer');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string>(() => {
    return localStorage.getItem('boran_admin_token') || '';
  });
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Modals & Drawers Visibility
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('boran_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('boran_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Sync Customer to LocalStorage
  useEffect(() => {
    if (customer) {
      localStorage.setItem('boran_customer', JSON.stringify(customer));
    } else {
      localStorage.removeItem('boran_customer');
    }
  }, [customer]);

  // Store all backend products from Cloud Firestore & Backend API
  const [allBackendProducts, setAllBackendProducts] = useState<Product[]>([]);

  // 1. Real-time Cloud Firestore Listener (Broadcasting to all devices instantly)
  useEffect(() => {
    testFirestoreConnection();

    let unsubscribe: (() => void) | null = null;
    try {
      const q = collection(db, 'products');
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const liveProducts: Product[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Product;
              if (data && data.id && data.name) {
                liveProducts.push(data);
              }
            });
            liveProducts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            setAllBackendProducts(liveProducts);
            setLoadingProducts(false);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'products');
        }
      );
    } catch (err) {
      console.warn('Real-time cloud listener notice:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Fetch Products from REST API (Backend sync & initial seeding backup)
  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading && allBackendProducts.length === 0) setLoadingProducts(true);
      const res = await fetch(getApiUrl('/api/products'));
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data: Product[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllBackendProducts((prev) => {
            // Merge or update products
            const existingIds = new Set(data.map((d) => d.id));
            const merged = [...data];
            prev.forEach((p) => {
              if (!existingIds.has(p.id)) {
                merged.push(p);
              }
            });
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn('Backend API fetch notice:', err);
    } finally {
      if (showLoading) setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts(true);

    // Poll every 3 seconds as a safety heartbeat so all users see new products immediately
    const interval = setInterval(() => {
      fetchProducts(false);
    }, 3000);

    const handleFocus = () => fetchProducts(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 3. Compute active visible products based on category and search query
  useEffect(() => {
    let sourceList = allBackendProducts.length > 0 ? allBackendProducts : INITIAL_PRODUCTS;
    let filtered = [...sourceList];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    setProducts(filtered);

    // If currently viewing a product that was removed, close detail modal
    setSelectedProduct((current) => {
      if (current && !sourceList.some((p) => p.id === current.id)) {
        return null;
      }
      return current;
    });
  }, [allBackendProducts, selectedCategory, searchQuery]);

  // Wishlist Toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  // Add to Cart
  const handleAddToCart = (product: Product, size?: string, colour?: string, qty: number = 1) => {
    const selectedSize = size || product.sizes[0] || 'M';
    const selectedColour = colour || product.colours[0] || 'Default';
    const cartItemId = `${product.id}-${selectedSize}-${selectedColour}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          product,
          quantity: qty,
          selectedSize,
          selectedColour,
        },
      ];
    });

    setIsCartOpen(true);
  };

  // Buy Now
  const handleBuyNow = (product: Product, size?: string, colour?: string, qty: number = 1) => {
    handleAddToCart(product, size, colour, qty);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Cart Updates
  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Order Success Handler
  const handleOrderSuccess = (order: Order) => {
    setCart([]); // Clear Cart after order placement
  };

  // Customer Login Handler
  const handleCustomerLoginSuccess = (cust: CustomerUser, token: string) => {
    setCustomer(cust);
  };

  // Admin Login Handler
  const handleAdminLoginSuccess = (token: string, username: string) => {
    setAdminToken(token);
    setAdminUsername(username);
    localStorage.setItem('boran_admin_token', token);
    setShowAdminDashboard(true);
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    localStorage.removeItem('boran_admin_token');
    setShowAdminDashboard(false);
  };

  // If Admin Dashboard View is active
  if (showAdminDashboard && adminToken) {
    return (
      <AdminDashboard
        token={adminToken}
        adminUsername={adminUsername}
        onLogout={handleAdminLogout}
        onRefreshProducts={fetchProducts}
      />
    );
  }

  // Wishlist Products List
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Header */}
      <Header
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery('');
        }}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        customer={customer}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
        onOpenCustomerProfile={() => setIsCustomerProfileOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        isAdminLoggedIn={Boolean(adminToken)}
        onOpenAdminDashboard={() => setShowAdminDashboard(true)}
        onAdminLogout={handleAdminLogout}
      />

      {/* Hero Banner Slider */}
      <HeroSlider onShopNow={() => setSelectedCategory('All')} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Category Pills Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div>
            <span className="text-xs font-extrabold text-blue-400 uppercase tracking-widest block">
              COLLECTION 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {selectedCategory === 'All' ? 'ALL MEN\'S WEAR' : selectedCategory}
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              ALL
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-zinc-900 rounded-2xl h-64 sm:h-80 border border-zinc-800" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-blue-400 text-2xl font-black">
              BT
            </div>
            <h3 className="text-lg font-bold text-white">No products found in "{selectedCategory}"</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Try adjusting your search filter or view all categories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-2 bg-blue-600 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-full"
            >
              VIEW ALL PRODUCTS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isInWishlist={wishlist.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        categories={CATEGORIES}
        onSelectCategory={setSelectedCategory}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isInWishlist={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCartWithSizeAndColour={(p, size, colour, qty) => {
          handleAddToCart(p, size, colour, qty);
          setSelectedProduct(null);
        }}
        onBuyNowWithSizeAndColour={(p, size, colour, qty) => {
          handleBuyNow(p, size, colour, qty);
          setSelectedProduct(null);
        }}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Slide-over Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={(product) => handleToggleWishlist(product)}
        onAddToCart={(product) => handleAddToCart(product)}
        onBuyNow={(product) => handleBuyNow(product)}
        onSelectProduct={(product) => setSelectedProduct(product)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        customerEmail={customer?.email || ''}
        customerMobile={customer?.mobile || ''}
        customerName={customer?.name || ''}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Customer Login/Register Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onLoginSuccess={handleCustomerLoginSuccess}
      />

      {/* Customer Profile & Orders History Modal */}
      <CustomerProfileModal
        isOpen={isCustomerProfileOpen}
        onClose={() => setIsCustomerProfileOpen(false)}
        customer={customer}
        onLogout={() => setCustomer(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onAdminLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
