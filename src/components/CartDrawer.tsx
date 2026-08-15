import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 70;
  const totalAmount = subtotal + deliveryCharge;
  const totalSavings = items.reduce(
    (sum, item) => sum + (item.product.originalPrice - item.product.price) * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              YOUR SHOPPING BAG <span className="text-blue-400">({items.length})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-zinc-900 px-6 py-3 border-b border-zinc-800">
          {subtotal >= 999 ? (
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>CONGRATS! YOU GET FREE SHIPPING ON THIS ORDER 🎉</span>
            </div>
          ) : (
            <div>
              <div className="text-xs font-medium text-zinc-300 mb-1.5">
                Add <span className="font-bold text-blue-400">₹{999 - subtotal}</span> more for FREE Delivery!
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-4">
              <ShoppingBag className="w-16 h-16 text-zinc-700 stroke-[1.5]" />
              <div>
                <p className="text-base font-bold text-zinc-300">Your bag is empty</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                  Discover our latest streetwear, baggy jeans, and formal collection.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase px-6 py-3 rounded-full shadow-lg"
              >
                START SHOPPING NOW
              </button>
            </div>
          ) : (
            items.map((item) => {
              const image =
                item.product.images && item.product.images.length > 0
                  ? item.product.images[0]
                  : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800';

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl relative"
                >
                  <img
                    src={image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 object-cover object-center rounded-xl bg-zinc-950 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white line-clamp-2">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 font-medium">
                        <span>Size: <strong className="text-blue-400">{item.selectedSize}</strong></span>
                        <span>•</span>
                        <span>Col: <strong className="text-zinc-200">{item.selectedColour}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-zinc-800 bg-zinc-950 rounded-lg overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-white">
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-900/80 space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-200">₹{subtotal}</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Bag Savings</span>
                  <span>-₹{totalSavings}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400">
                <span>Delivery Charge</span>
                <span className="font-semibold text-zinc-200">
                  {deliveryCharge === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
                <span>Total Amount</span>
                <span className="text-blue-400">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/20 transition-all active:scale-95"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
