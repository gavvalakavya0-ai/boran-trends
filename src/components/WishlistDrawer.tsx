import React from 'react';
import { X, Heart, ShoppingBag, Trash2, Zap, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                MY WISHLIST <span className="text-rose-400">({wishlistProducts.length})</span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-medium">Saved favourite styles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500/50">
                <Heart className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <p className="text-base font-bold text-zinc-300">Your wishlist is empty</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                  Save items you love by tapping the heart icon on any product card.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase px-6 py-3 rounded-full shadow-lg shadow-blue-600/20"
              >
                EXPLORE COLLECTION
              </button>
            </div>
          ) : (
            wishlistProducts.map((product) => {
              const mainImage =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800';

              return (
                <div
                  key={product.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 space-y-3 relative group hover:border-zinc-700 transition-all"
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="relative w-20 h-24 rounded-xl overflow-hidden bg-zinc-950 shrink-0 cursor-pointer"
                    >
                      <img
                        src={mainImage}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discount > 0 && (
                        <span className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                          -{product.discount}%
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                              {product.category}
                            </span>
                            <h4
                              onClick={() => {
                                onSelectProduct(product);
                                onClose();
                              }}
                              className="text-xs font-bold text-white line-clamp-2 cursor-pointer hover:text-blue-400 transition-colors"
                            >
                              {product.name}
                            </h4>
                          </div>

                          <button
                            onClick={() => onRemoveFromWishlist(product)}
                            className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                            title="Remove from Wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-sm font-black text-white">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-zinc-500 line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => {
                        onAddToCart(product);
                      }}
                      className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-xl transition-all border border-zinc-700/50"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                      <span>ADD TO BAG</span>
                    </button>

                    <button
                      onClick={() => {
                        onBuyNow(product);
                        onClose();
                      }}
                      className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-md shadow-blue-600/20"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>BUY NOW</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        {wishlistProducts.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 text-center">
            <p className="text-[11px] text-zinc-400">
              💡 Tip: Items in wishlist are saved locally on your device.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
