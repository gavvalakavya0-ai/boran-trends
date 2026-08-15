import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, Zap } from 'lucide-react';

interface HeroSliderProps {
  onShopNow: () => void;
}

const BANNERS = [
  {
    id: 1,
    title: "BORAN TRENDS MEN'S WEAR",
    subtitle: "URBAN STREETWEAR & EXECUTIVE FORMALS",
    description: "Explore premium acid-wash hoodies, baggy jeans, utility cargo pants, and crisp formal shirts crafted for modern trendsetters.",
    cta: "SHOP COLLECTION",
    badge: "FLAT 40% OFF — LIMITED TIME",
    image: "/src/assets/images/boran_hero_banner_1786529199944.jpg"
  },
  {
    id: 2,
    title: "VINTAGE BAGGY DENIM",
    subtitle: "RELAXED 90S SLOUCHY FIT",
    description: "Durable rigid cotton denim engineered with 5-pocket styling and slouchy leg line for unmatched street authority.",
    cta: "EXPLORE JEANS",
    badge: "NEW ARRIVALS 2026",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: 3,
    title: "BOARDROOM ELEGANCE",
    subtitle: "SATIN COTTON FORMAL SHIRTS",
    description: "Wrinkle-resistant Giza cotton satin formal shirts paired with precision tapered trousers.",
    cta: "SHOP FORMALS",
    badge: "EXECUTIVE WEAR",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=1600"
  }
];

export const HeroSlider: React.FC<HeroSliderProps> = ({ onShopNow }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = BANNERS[currentIndex];

  return (
    <div className="relative bg-zinc-950 text-white overflow-hidden">
      {/* Background Image Container */}
      <div className="relative h-[480px] sm:h-[540px] md:h-[600px] w-full">
        <img
          src={current.image}
          alt={current.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.45] transition-all duration-700 scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        {/* Content Box */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center">
          <div className="max-w-2xl space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>{current.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-none font-sans">
              {current.title}
            </h1>

            <p className="text-blue-400 font-bold tracking-wider text-sm sm:text-base uppercase">
              {current.subtitle}
            </p>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              {current.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onShopNow}
                className="group relative inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-extrabold text-sm tracking-wide uppercase shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{current.cta}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Manual Slide Controls */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900/60 hover:bg-zinc-900 text-white flex items-center justify-center backdrop-blur-md border border-zinc-700/50 transition-colors"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % BANNERS.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900/60 hover:bg-zinc-900 text-white flex items-center justify-center backdrop-blur-md border border-zinc-700/50 transition-colors"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {BANNERS.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx ? 'w-8 bg-blue-500' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trust Badges Ribbon (7-Day Returns Removed as Requested) */}
      <div className="bg-zinc-900/90 border-y border-zinc-800 py-4 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Truck className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">FREE EXPRESS SHIPPING</div>
              <div className="text-[11px] text-zinc-400">On all orders above ₹999</div>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">100% GENUINE QUALITY</div>
              <div className="text-[11px] text-zinc-400">Direct from Boran Trends</div>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Zap className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">INSTANT UPI PAYMENTS</div>
              <div className="text-[11px] text-zinc-400">GPay, PhonePe, Paytm, Any UPI (7989163216)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
