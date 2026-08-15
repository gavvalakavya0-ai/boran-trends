import React from 'react';
import { Heart, ShoppingBag, Star, Zap } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isInWishlist: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInWishlist,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
}) => {
  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="group relative bg-zinc-900 rounded-xl sm:rounded-2xl border border-zinc-800/80 overflow-hidden shadow-lg hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Container */}
      <div
        className="relative aspect-[3/4] w-full bg-zinc-950 overflow-hidden cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={mainImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-rose-600 text-white text-[9px] sm:text-[11px] font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-md">
            {product.discount}% OFF
          </div>
        )}

        {/* New Arrival Badge */}
        {product.isNewArrival && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-blue-600 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider shadow-md">
            NEW
          </div>
        )}

        {/* Wishlist Floating Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
            isInWishlist
              ? 'bg-rose-500 text-white shadow-lg'
              : 'bg-zinc-900/80 hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700/50 backdrop-blur-md'
          }`}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-blue-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px] truncate max-w-[65%]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 bg-zinc-800/80 px-1.5 sm:px-2 py-0.5 rounded text-blue-400 font-semibold text-[10px] sm:text-[11px] shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-blue-400 text-blue-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer leading-tight sm:leading-snug min-h-[2rem] sm:min-h-[2.5rem]"
          >
            {product.name}
          </h3>

          {/* Sizes Badges */}
          <div className="flex items-center gap-1 flex-wrap mt-1.5 sm:mt-2">
            <span className="text-[9px] sm:text-[10px] text-zinc-400 mr-0.5 font-medium">SIZES:</span>
            {product.sizes.slice(0, 3).map((size) => (
              <span
                key={size}
                className="text-[9px] sm:text-[10px] font-bold bg-zinc-800 text-zinc-300 px-1 sm:px-1.5 py-0.5 rounded border border-zinc-700/50"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 3 && (
              <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold">+{product.sizes.length - 3}</span>
            )}
          </div>
        </div>

        {/* Pricing & Buttons */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-2 sm:space-y-3">
          {/* Prices */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-black text-white">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-zinc-500 line-through">₹{product.originalPrice}</span>
            )}
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 ml-auto hidden xs:inline">
              Save ₹{product.originalPrice - product.price}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all border border-zinc-700/60 active:scale-95"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Cart</span>
            </button>

            <button
              onClick={() => onBuyNow(product)}
              className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              <span>BUY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
