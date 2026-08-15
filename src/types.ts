export type ProductCategory =
  | 'Combo Offers'
  | 'Shirts'
  | 'T-Shirts'
  | 'baggy Jeans'
  | 'formal shirts'
  | 'Formal pants'
  | 'cargo pants'
  | 'hoodies'
  | 'New Arrivals';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  discount: number;
  sizes: string[];
  colours: string[];
  rating: number;
  reviewsCount?: number;
  description: string;
  specifications?: Record<string, string>;
  stock: number;
  images: string[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string; // unique cart item id (product.id + size + colour)
  productId: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColour: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  token?: string;
  createdAt?: string;
}

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  colour: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  mobile: string;
  email: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'PhonePe' | 'GPay' | 'Paytm' | 'Any UPI' | 'Cash on Delivery';
  upiNumber?: string;
  utrNumber?: string;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  orderStatus: OrderStatus;
  createdAt: string;
}

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalSales: number;
}
