import React, { useState, useEffect } from 'react';
import { X, Package, User, LogOut, Phone, Mail } from 'lucide-react';
import { CustomerUser, Order } from '../types';
import { getApiUrl } from '../config/api';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser | null;
  onLogout: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  onLogout,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isOpen || !customer) return;

    // Fetch customer's orders
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const params = new URLSearchParams();
        if (customer.mobile) params.append('mobile', customer.mobile);
        if (customer.email) params.append('email', customer.email);

        const res = await fetch(getApiUrl(`/api/orders?${params.toString()}`));
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const userOrders: Order[] = await res.json();
          if (Array.isArray(userOrders)) {
            setOrders(userOrders);
            if (userOrders.length > 0) setSelectedOrder(userOrders[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Shipped': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'Packed': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Confirmed': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'Cancelled': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Left Column: Profile Info & Logout */}
        <div className="w-full md:w-1/3 p-6 bg-zinc-900/60 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-lg">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{customer.name}</h3>
                  <span className="text-[10px] text-blue-400 font-bold uppercase">Customer Account</span>
                </div>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{customer.mobile}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                MY ORDERS ({orders.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedOrder?.id === ord.id
                        ? 'bg-blue-600/15 border-blue-500 text-white'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">#{ord.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(ord.orderStatus)}`}>
                        {ord.orderStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      ₹{ord.totalAmount} • {new Date(ord.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>LOGOUT ACCOUNT</span>
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Order Track View */}
        <div className="w-full md:w-2/3 p-6 overflow-y-auto space-y-6 flex-1">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white uppercase">
                {selectedOrder ? `ORDER TRACKING #${selectedOrder.id}` : 'YOUR ORDER HISTORY'}
              </h3>
              <p className="text-xs text-zinc-400">Live order processing and delivery status updates</p>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {selectedOrder ? (
            <div className="space-y-6">
              {/* Status Timeline Bar */}
              <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase">CURRENT STATUS:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase ${getStatusColor(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>

                {/* Progress Pipeline */}
                <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold pt-2">
                  {['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((st, idx) => {
                    const statusOrder = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
                    const currentIdx = statusOrder.indexOf(selectedOrder.orderStatus);
                    const isPassed = currentIdx >= idx;

                    return (
                      <div key={st} className="space-y-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isPassed ? 'bg-blue-600' : 'bg-zinc-800'
                          }`}
                        />
                        <span className={isPassed ? 'text-blue-400' : 'text-zinc-600'}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                  ITEMS IN THIS ORDER
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl"
                    >
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-14 object-cover rounded-lg bg-zinc-950"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-xs text-white line-clamp-1">{item.name}</div>
                        <div className="text-[11px] text-zinc-400">
                          Size: <strong className="text-blue-400">{item.size}</strong> • Colour: {item.colour} • Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="font-black text-xs text-white">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-xs space-y-1">
                <h4 className="font-bold text-blue-400 uppercase mb-1">SHIPPING ADDRESS</h4>
                <p className="font-bold text-white">{selectedOrder.shippingAddress.fullName}</p>
                <p className="text-zinc-300">{selectedOrder.shippingAddress.streetAddress}</p>
                <p className="text-zinc-300">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pinCode}
                </p>
                <p className="text-zinc-400">Phone: {selectedOrder.shippingAddress.mobile}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <Package className="w-12 h-12 mx-auto stroke-[1.5] text-zinc-700 mb-2" />
              <p className="text-sm font-bold text-zinc-400">No orders placed yet</p>
              <p className="text-xs text-zinc-500">Start shopping to place your first order!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
