import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Zap, Star, ShieldCheck, Truck, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  isInWishlist: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCartWithSizeAndColour: (p: Product, size: string, colour: string, qty: number) => void;
  onBuyNowWithSizeAndColour: (p: Product, size: string, colour: string, qty: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isInWishlist,
  onToggleWishlist,
  onAddToCartWithSizeAndColour,
  onBuyNowWithSizeAndColour,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColour, setSelectedColour] = useState<string>('Default');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images && product.images.length > 0 ? product.images[0] : '');
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M');
      setSelectedColour(product.colours && product.colours.length > 0 ? product.colours[0] : 'Default');
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'];

  const currentImage = selectedImage || images[0];

  return (
    <div
      id="product-detail-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[92vh] sm:h-auto sm:max-h-[90vh]">
        
        {/* Mobile Pull Bar Indicator */}
        <div className="w-full flex justify-center py-2 sm:hidden bg-zinc-950 shrink-0">
          <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full" />
        </div>

        {/* Close Button */}
        <button
          id="close-product-detail-modal"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 backdrop-blur-md transition-colors shadow-lg active:scale-95"
          title="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Main Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col md:flex-row">
          
          {/* Left: Images Gallery */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 bg-zinc-900/40 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800/80 shrink-0">
            {/* Main Image */}
            <div className="relative aspect-[4/3] sm:aspect-square md:aspect-[3/4] max-h-72 sm:max-h-80 md:max-h-none w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-inner mb-3">
              <img
                src={currentImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              {product.discount > 0 && (
                <span className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-[10px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-md">
                  {product.discount}% OFF
                </span>
              )}
              {product.isNewArrival && (
                <span className="absolute top-3 right-12 sm:right-4 bg-blue-600 text-white font-extrabold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded uppercase tracking-wider shadow-md">
                  NEW
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      currentImage === imgUrl ? 'border-blue-500 scale-105 shadow-md' : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
            <div className="space-y-4">
              {/* Category & Stock Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest">
                  {product.category}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  In Stock ({product.stock} available)
                </span>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                {product.name}
              </h2>

              {/* Ratings */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-blue-600/10 border border-blue-500/30 px-2 py-0.5 rounded text-blue-400 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-blue-400" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-zinc-400">({product.reviewsCount || 85} customer reviews)</span>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex items-center gap-3">
                <div className="text-2xl sm:text-3xl font-black text-white">₹{product.price}</div>
                {product.originalPrice > product.price && (
                  <div className="text-xs sm:text-sm text-zinc-500 line-through">₹{product.originalPrice}</div>
                )}
                {product.discount > 0 && (
                  <div className="text-[11px] sm:text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20 ml-auto">
                    Save ₹{product.originalPrice - product.price}
                  </div>
                )}
              </div>

              {/* Select Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Select Size: <span className="text-blue-400 font-extrabold">{selectedSize}</span>
                  </span>
                  <span className="text-[11px] text-zinc-400 underline cursor-pointer">Size Guide</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[40px] sm:min-w-[44px] h-10 sm:h-11 px-3 rounded-xl text-xs font-bold border transition-all ${
                        selectedSize === sz
                          ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/20 scale-105'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Colour */}
              {product.colours && product.colours.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-2">
                    Select Colour: <span className="text-blue-400 font-extrabold">{selectedColour}</span>
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colours.map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedColour(col)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          selectedColour === col
                            ? 'bg-blue-600/20 text-blue-300 border-blue-500 scale-105'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Quantity:
                </span>
                <div className="flex items-center border border-zinc-800 bg-zinc-900 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                    className="px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  id="detail-modal-add-to-cart"
                  onClick={() => onAddToCartWithSizeAndColour(product, selectedSize, selectedColour, quantity)}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 py-3.5 rounded-xl font-bold text-sm border border-zinc-700 hover:border-zinc-500 transition-all active:scale-95 shadow-md"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                  <span>Add to Cart</span>
                </button>

                <button
                  id="detail-modal-buy-now"
                  onClick={() => onBuyNowWithSizeAndColour(product, selectedSize, selectedColour, quantity)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-black text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>BUY NOW</span>
                </button>

                <button
                  id="detail-modal-wishlist-toggle"
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3.5 rounded-xl border transition-all active:scale-95 ${
                    isInWishlist
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                  title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-zinc-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1.5">
                  Description & Style Notes
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="pt-4 border-t border-zinc-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
                    Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[10px] uppercase font-semibold">{key}</span>
                        <span className="text-zinc-200 font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Guarantee Notes */}
              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-zinc-800/60 pb-2">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[10px] sm:text-[11px] text-zinc-400">
                  <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Express Delivery</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[10px] sm:text-[11px] text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Genuine Quality</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[10px] sm:text-[11px] text-zinc-400">
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>UPI Accepted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
