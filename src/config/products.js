// Centralized Product & Flavor Configuration for Mani Orders
// Pricing and availability can easily be modified here or dynamically updated via the Admin panel.

export const DEFAULT_PRODUCTS = [
  {
    id: 'salted',
    name: 'Salted',
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

export const SPECIAL_ORDER_DEFAULT_PRICE = 55;

export const formatPHP = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
