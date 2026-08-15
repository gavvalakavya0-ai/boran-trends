import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'bt-prod-1',
    name: 'Oversized Streetwear Acid Wash Hoodie',
    category: 'hoodies',
    price: 1499,
    originalPrice: 2499,
    discount: 40,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colours: ['Charcoal Black', 'Vintage Olive', 'Washed Grey'],
    rating: 4.8,
    reviewsCount: 124,
    description: 'Premium heavyweight cotton fleece hoodie featuring a boxy oversized street fit, drop shoulders, and reinforced ribbed trims for ultimate comfort and winter style.',
    specifications: {
      'Fabric': '100% Heavyweight Terry Cotton (380 GSM)',
      'Fit': 'Oversized Boxy Fit',
      'Wash Care': 'Machine wash cold inside out',
      'Country of Origin': 'India'
    },
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: true,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bt-prod-2',
    name: 'Vintage Blue Loose Wide-Leg Baggy Jeans',
    category: 'baggy Jeans',
    price: 1699,
    originalPrice: 2799,
    discount: 39,
    sizes: ['30', '32', '34', '36'],
    colours: ['Vintage Blue', 'Retro Indigo', 'Midnight Black'],
    rating: 4.9,
    reviewsCount: 188,
    description: 'Classic 90s aesthetic relaxed baggy jeans with durable rigid denim, high rise waist, clean distressing, and extra slouchy leg line.',
    specifications: {
      'Fabric': '100% Non-Stretch Cotton Denim',
      'Fit': 'Loose Slouchy Baggy',
      'Pockets': '5 Pocket Styling',
      'Closure': 'Heavy Duty Zipper Fly'
    },
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: true,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bt-prod-3',
    name: 'Tactical Multi-Pocket Combat Cargo Pants',
    category: 'cargo pants',
    price: 1599,
    originalPrice: 2299,
    discount: 30,
    sizes: ['30', '32', '34', '36'],
    colours: ['Desert Khaki', 'Army Green', 'Tactical Black'],
    rating: 4.7,
    reviewsCount: 96,
    description: 'Rugged cotton twill cargo trousers designed with 6 high-capacity flap pockets, adjustable ankle cinch drawstrings, and relaxed mobility knee darts.',
    specifications: {
      'Fabric': '98% Cotton Twill, 2% Elastane',
      'Fit': 'Relaxed Utility Fit',
      'Pockets': '6 Functional Utility Pockets',
      'Features': 'Ankle Drawstrings'
    },
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: false,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bt-prod-4',
    name: 'Boran Executive Cotton Satin Formal Shirt',
    category: 'formal shirts',
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)'],
    colours: ['Pure White', 'Sky Blue', 'Crisp Black'],
    rating: 4.8,
    reviewsCount: 210,
    description: 'Wrinkle-resistant premium Giza cotton satin formal shirt featuring a sleek spread collar, French placket, and tailored fit for boardroom authority.',
    specifications: {
      'Fabric': '100% Superfine Satin Cotton',
      'Fit': 'Slim Formal Fit',
      'Sleeve': 'Full Sleeve with Convertible Cuffs',
      'Collar': 'German Interlined Cutaway Collar'
    },
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: false,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bt-prod-5',
    name: 'Sharp Tapered Fit Stretch Formal Trousers',
    category: 'Formal pants',
    price: 1399,
    originalPrice: 2199,
    discount: 36,
    sizes: ['30', '32', '34', '36'],
    colours: ['Dark Charcoal', 'Navy Blue', 'Beige Khaki'],
    rating: 4.6,
    reviewsCount: 82,
    description: 'Precision tailored formal trousers crafted with flexible poly-viscose stretch weave, flat front styling, and grip waistband to keep shirts tucked in place.',
    specifications: {
      'Fabric': '70% Poly, 28% Viscose, 2% Lycra',
      'Fit': 'Slim Tapered Fit',
      'Rise': 'Mid Rise',
      'Care': 'Machine wash / Dry clean recommended'
    },
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: true,
    isBestSeller: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bt-prod-6',
    name: 'Heavyweight Graphic Oversized Drop-Shoulder T-Shirt',
    category: 'T-Shirts',
    price: 799,
    originalPrice: 1299,
    discount: 38,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['Acid Wash Black', 'Off-White', 'Rust Orange'],
    rating: 4.9,
    reviewsCount: 310,
    description: 'Super-soft 240 GSM combed cotton crew neck t-shirt featuring vibrant HD street graphic print on the back, drop shoulders, and non-bushing collar.',
    specifications: {
      'Fabric': '100% Bio-Washed Combed Cotton',
      'Fit': 'Oversized Drop Shoulder',
      'Print': 'Screen Printed High Density Graphic',
      'GSM': '240 GSM'
    },
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: true,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bt-prod-7',
    name: 'Casual Textured Resort Cubba Collar Shirt',
    category: 'Shirts',
    price: 1199,
    originalPrice: 1799,
    discount: 33,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['Sage Green', 'Sand Beige', 'Ocean Navy'],
    rating: 4.7,
    reviewsCount: 74,
    description: 'Lightweight breathable waffle-textured cotton resort shirt with Cuban camp collar, straight hem, and wooden button closures.',
    specifications: {
      'Fabric': 'Textured Waffle Cotton Blend',
      'Fit': 'Relaxed Casual Fit',
      'Collar': 'Camp / Cuban Collar',
      'Sleeve': 'Half Sleeve'
    },
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: true,
    isBestSeller: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bt-prod-8',
    name: 'Urban Denim Jacket with Fleece Detailing',
    category: 'New Arrivals',
    price: 2199,
    originalPrice: 3499,
    discount: 37,
    sizes: ['M', 'L', 'XL'],
    colours: ['Dark Wash Indigo', 'Black Denim'],
    rating: 4.9,
    reviewsCount: 142,
    description: 'Heavy gauge classic denim jacket with plush fleece collar accent, dual chest pockets, custom Boran brass shank buttons, and double needle topstitching.',
    specifications: {
      'Fabric': '14oz Premium Cotton Denim',
      'Fit': 'Standard Trucker Fit',
      'Pockets': '4 Exterior + 2 Interior Pockets',
      'Wash': 'Vintage Stone Wash'
    },
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: true,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bt-prod-9',
    name: 'Streetwear Combo Pack (Oversized Hoodie + Baggy Jeans)',
    category: 'Combo Offers',
    price: 2699,
    originalPrice: 4299,
    discount: 37,
    sizes: ['M', 'L', 'XL'],
    colours: ['Charcoal Black + Vintage Blue', 'Washed Grey + Retro Indigo'],
    rating: 5.0,
    reviewsCount: 248,
    description: 'Ultimate Streetwear Combo: Pair 1 Heavyweight Acid Wash Oversized Hoodie with 1 Vintage Loose Baggy Jeans for an instant high-fashion street fit at massive combo savings.',
    specifications: {
      'Combo Includes': '1x Heavyweight Hoodie + 1x Loose Baggy Jeans',
      'Fabric': '100% Cotton Fleece & 100% Non-Stretch Cotton Denim',
      'Fit': 'Oversized Boxy & Baggy Slouchy',
      'Savings': 'Save ₹1,600 Flat Combo Offer'
    },
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: true,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bt-prod-10',
    name: 'Executive Formal Combo (Satin Shirt + Tapered Trousers)',
    category: 'Combo Offers',
    price: 2299,
    originalPrice: 3899,
    discount: 41,
    sizes: ['M (38)', 'L (40)', 'XL (42)'],
    colours: ['Pure White Shirt + Dark Charcoal Pants', 'Sky Blue Shirt + Navy Pants'],
    rating: 4.9,
    reviewsCount: 195,
    description: 'Complete Boardroom Look: 1 Boran Executive Cotton Satin Formal Shirt + 1 Precision Tapered Stretch Formal Trousers tailored for executive distinction.',
    specifications: {
      'Combo Includes': '1x Satin Formal Shirt + 1x Tapered Formal Pants',
      'Fabric': 'Superfine Satin Cotton & Poly-Viscose Lycra Stretch',
      'Savings': 'Save ₹1,600 Instant Combo Discount',
      'Care': 'Machine Washable'
    },
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: true,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  }
];
