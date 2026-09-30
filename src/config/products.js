// Centralized Product & Flavor Configuration for Mani Orders
// Pricing and availability can easily be modified here or dynamically updated via the Admin panel.

export const DEFAULT_PRODUCTS = [
  {
    id: 'salted',
    name: 'Salted',
    halloweenSubLabel: "Vampire's Bane",
    tagline: 'Classic & Crunchy',
    description: 'Crispy deep-fried peanuts generously seasoned with fine rock salt.',
    price: 50,
    icon: '🧂',
    image: './images/products/salted.jpg',
    badge: 'Popular',
    available: true,
    sortOrder: 1,
    accentColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'unsalted',
    name: 'Unsalted',
    halloweenSubLabel: 'Ghostly Pure',
    tagline: 'Pure & Natural',
    description: 'Roasted to perfection with zero added salt — wholesome and hearty.',
    price: 50,
    icon: '🥜',
    image: './images/products/unsalted.jpg',
    badge: 'Healthy',
    available: true,
    sortOrder: 2,
    accentColor: 'bg-stone-100 text-stone-900 border-stone-300'
  },
  {
    id: 'spicy',
    name: 'Spicy',
    halloweenSubLabel: 'Hellfire Crunch',
    tagline: 'Fiery Kick',
    description: 'Classic crunchy mani tossed with hot chili flakes and spicy seasonings.',
    price: 50,
    icon: '🌶️',
    image: './images/products/spicy.jpg',
    badge: 'Best Seller',
    available: true,
    sortOrder: 3,
    accentColor: 'bg-red-100 text-red-900 border-red-300'
  },
  {
    id: 'bbq',
    name: 'BBQ',
    halloweenSubLabel: 'Midnight BBQ',
    tagline: 'Smoky & Savory',
    description: 'Rich barbecue seasoning packed with sweet, smoky, and savory notes.',
    price: 50,
    icon: '🔥',
    image: './images/products/bbq.jpg',
    badge: 'Favorites',
    available: true,
    sortOrder: 4,
    accentColor: 'bg-orange-100 text-orange-900 border-orange-300'
  },
  {
    id: 'sour-cream',
    name: 'Sour Cream',
    halloweenSubLabel: 'Phantom Cream',
    tagline: 'Tangy & Creamy',
    description: 'A mouthwatering blend of zesty sour cream and aromatic spring onions.',
    price: 50,
    icon: '🥛',
    image: './images/products/sour-cream.jpg',
    badge: 'Trending',
    available: true,
    sortOrder: 5,
    accentColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  {
    id: 'cheese',
    name: 'Cheese',
    halloweenSubLabel: 'Full Moon Cheddar',
    tagline: 'Rich & Cheesy',
    description: 'Crisp, golden roasted peanuts generously tossed in savory, mouthwatering cheese powder.',
    price: 50,
    icon: '🧀',
    image: './images/products/cheese.jpg',
    badge: 'New',
    available: true,
    sortOrder: 6,
    accentColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'bawang-only',
    name: 'Bawang Only',
    halloweenSubLabel: 'Monster Bawang',
    tagline: 'Garlic Lovers Only',
    description: 'Pure crispy golden deep-fried garlic chips and whole garlic cloves!',
    price: 60,
    icon: '🧄',
    image: './images/products/bawang-only.jpg',
    badge: 'Must Try',
    available: true,
    sortOrder: 7,
    accentColor: 'bg-yellow-100 text-yellow-900 border-yellow-300'
  }
];

export const FLAVOR_PERSONALITIES = {
  salted: {
    displayIcon: '🧂',
    halloweenIcon: '🧛',
    halloweenSubLabel: "Vampire's Bane",
    sticker: 'CLASSIC CRUNCH',
    vibe: 'Rock Salt + Crispy Bawang',
    tagline: 'Classic & Crunchy',
    cardBg: 'from-amber-50/95 via-white to-orange-50/50',
    frameBg: 'bg-amber-100/70 border-[#FF6B00]/70',
    badgeClass: 'bg-[#FF6B00] text-white border-amber-300',
    vibeClass: 'bg-amber-100/90 text-amber-950 border-amber-300/80',
    priceBg: 'bg-[#1F1025] text-amber-300',
    tiltClass: 'hover:-rotate-[0.8deg]'
  },
  unsalted: {
    displayIcon: '🌱',
    halloweenIcon: '👻',
    halloweenSubLabel: 'Ghostly Pure',
    sticker: 'PURE & NATURAL',
    vibe: 'Zero Salt • Pure Roast',
    tagline: 'Pure & Natural',
    cardBg: 'from-amber-50/90 via-white to-orange-50/40',
    frameBg: 'bg-emerald-100/50 border-[#FF6B00]/60',
    badgeClass: 'bg-emerald-700 text-white border-amber-300/60',
    vibeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300/80',
    priceBg: 'bg-[#1F1025] text-amber-300',
    tiltClass: 'hover:rotate-[0.8deg]'
  },
  spicy: {
    displayIcon: '🌶️',
    halloweenIcon: '🎃',
    halloweenSubLabel: 'Hellfire Crunch',
    sticker: '🔥 BEST SELLER',
    vibe: 'Saktong Anghang + Garlic',
    tagline: 'Fiery Kick',
    cardBg: 'from-orange-50/95 via-white to-amber-50/50',
    frameBg: 'bg-rose-100/60 border-[#FF6B00]',
    badgeClass: 'bg-rose-600 text-white border-amber-300',
    vibeClass: 'bg-rose-100/90 text-rose-950 border-rose-300/80',
    priceBg: 'bg-[#FF6B00] text-white',
    tiltClass: 'hover:-rotate-[0.8deg]'
  },
  bbq: {
    displayIcon: '🍖',
    halloweenIcon: '🦇',
    halloweenSubLabel: 'Midnight BBQ',
    sticker: 'BARKADA FAVE',
    vibe: 'Sweet & Smoky Pinoy BBQ',
    tagline: 'Smoky & Savory',
    cardBg: 'from-orange-50/95 via-white to-amber-50/50',
    frameBg: 'bg-orange-100/60 border-[#FF6B00]/80',
    badgeClass: 'bg-[#FF6B00] text-white border-amber-300',
    vibeClass: 'bg-orange-100/90 text-orange-950 border-orange-300/80',
    priceBg: 'bg-[#1F1025] text-amber-300',
    tiltClass: 'hover:rotate-[0.8deg]'
  },
  'sour-cream': {
    displayIcon: '🥛',
    halloweenIcon: '🕸️',
    halloweenSubLabel: 'Phantom Cream',
    sticker: 'TANGY & ZESTY',
    vibe: 'Creamy Herb & Onion Zing',
    tagline: 'Tangy & Creamy',
    cardBg: 'from-amber-50/90 via-white to-orange-50/40',
    frameBg: 'bg-teal-100/50 border-[#FF6B00]/65',
    badgeClass: 'bg-teal-700 text-white border-amber-300/60',
    vibeClass: 'bg-teal-50 text-teal-950 border-teal-300/80',
    priceBg: 'bg-[#1F1025] text-amber-300',
    tiltClass: 'hover:-rotate-[0.8deg]'
  },
  cheese: {
    displayIcon: '🧀',
    halloweenIcon: '🌕',
    halloweenSubLabel: 'Full Moon Cheddar',
    sticker: 'CHEESY SARAP!',
    vibe: 'Savory Golden Cheddar',
    tagline: 'Rich & Cheesy',
    cardBg: 'from-yellow-50/95 via-white to-orange-50/50',
    frameBg: 'bg-yellow-100/70 border-[#FF6B00]/75',
    badgeClass: 'bg-amber-400 text-[#1F1025] border-[#FF6B00]',
    vibeClass: 'bg-yellow-100 text-yellow-950 border-yellow-400/80',
    priceBg: 'bg-[#1F1025] text-amber-300',
    tiltClass: 'hover:rotate-[0.8deg]'
  },
  'bawang-only': {
    displayIcon: '🧄',
    halloweenIcon: '🧟',
    halloweenSubLabel: 'Monster Bawang',
    sticker: 'GARLIC OVERLOAD',
    vibe: '100% Crispy Golden Garlic',
    tagline: 'Garlic Lovers Only',
    cardBg: 'from-amber-100/90 via-white to-orange-50/60',
    frameBg: 'bg-amber-200/60 border-[#FF6B00]',
    badgeClass: 'bg-[#1F1025] text-amber-300 border-[#FF6B00]',
    vibeClass: 'bg-amber-100 text-mani-950 border-amber-300',
    priceBg: 'bg-[#FF6B00] text-white',
    tiltClass: 'hover:-rotate-[0.8deg]'
  }
};

export const getFlavorPersonality = (product) => {
  const preset = FLAVOR_PERSONALITIES[product?.id] || {};
  return {
    displayIcon: preset.displayIcon || product?.icon || '🥜',
    halloweenIcon: preset.halloweenIcon || '🎃',
    halloweenSubLabel: product?.halloweenSubLabel || preset.halloweenSubLabel || 'Spooky Crunch',
    sticker: preset.sticker || product?.badge || 'FRESH ROAST',
    vibe: preset.vibe || product?.tagline || 'Crispy & Crunchy',
    tagline: product?.tagline || preset.tagline || 'Artisanal Mani',
    cardBg: preset.cardBg || 'from-amber-50/90 via-white to-orange-50/40',
    frameBg: preset.frameBg || 'bg-amber-100/50 border-[#FF6B00]/70',
    badgeClass: preset.badgeClass || 'bg-[#FF6B00] text-white border-amber-300',
    vibeClass: preset.vibeClass || 'bg-amber-100 text-amber-950 border-amber-300',
    priceBg: preset.priceBg || 'bg-[#1F1025] text-amber-300',
    tiltClass: preset.tiltClass || 'hover:-rotate-1'
  };
};

export const formatPHP = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
