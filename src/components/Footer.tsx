import React from 'react';
import { Phone, MapPin, Instagram } from 'lucide-react';
import { ProductCategory } from '../types';

interface FooterProps {
  categories?: ProductCategory[];
  onSelectCategory?: (cat: string) => void;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-between">
          
          {/* Brand Info (Description Removed as Requested) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20">
                BT
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight uppercase block">
                  BORAN TRENDS
                </span>
                <span className="text-blue-400 text-xs tracking-widest font-bold uppercase block">
                  PREMIUM MEN'S WEAR
                </span>
              </div>
            </div>
          </div>

          {/* Store Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              STORE CONTACT
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+917989163216" className="font-bold text-white hover:text-blue-400 transition-colors">+91 7989163216</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="text-zinc-400 font-normal">Instagram:</span>
                <a
                  id="footer-instagram-link"
                  href="https://www.instagram.com/boran-trends/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white hover:text-pink-400 transition-colors flex items-center gap-1 group underline decoration-pink-500/50 hover:decoration-pink-400"
                >
                  <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent font-semibold">
                    boran-trends
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Mothkur, Bhongir, Jangaon, Telangana, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & payment methods bar */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-zinc-500">
            © {new Date().getFullYear()} BORAN TRENDS MEN'S WEAR. All rights reserved.
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-zinc-500 text-[11px] font-semibold">ACCEPTED PAYMENTS:</span>
            <span className="bg-zinc-900 px-2.5 py-1 rounded text-[10px] font-extrabold text-blue-400 border border-zinc-800">
              UPI (7989163216)
            </span>
            <span className="bg-zinc-900 px-2.5 py-1 rounded text-[10px] font-extrabold text-blue-400 border border-zinc-800">
              GPay
            </span>
            <span className="bg-zinc-900 px-2.5 py-1 rounded text-[10px] font-extrabold text-indigo-400 border border-zinc-800">
              PhonePe
            </span>
            <span className="bg-zinc-900 px-2.5 py-1 rounded text-[10px] font-extrabold text-sky-400 border border-zinc-800">
              Paytm
            </span>
            <span className="bg-zinc-900 px-2.5 py-1 rounded text-[10px] font-extrabold text-emerald-400 border border-zinc-800">
              Any UPI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
