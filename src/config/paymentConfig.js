/**
 * Payment Methods Configuration & Metadata
 * Mani Wandering Online Ordering App
 */

export const DEFAULT_PAYMENT_METHODS = {
  cod: true,
  maribank: true,
  gcash: true
};

export const PAYMENT_METHOD_METADATA = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: '💵',
    description: 'Pay when delivered',
    pillBg: 'bg-amber-500',
    selectedBorder: 'border-amber-600',
    ringColor: 'ring-amber-300'
  },
  {
    id: 'maribank',
    name: 'Maribank',
    icon: '🏦',
    description: 'Scan to pay via QR',
    pillBg: 'bg-orange-600',
    selectedBorder: 'border-orange-700',
    ringColor: 'ring-orange-300'
  },
  {
    id: 'gcash',
    name: 'GCash',
    icon: '📱',
    description: 'QR Code & GCash Number',
    pillBg: 'bg-blue-600',
    selectedBorder: 'border-blue-700',
    ringColor: 'ring-blue-300'
  }
];

export const getPaymentMethodIdByName = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('gcash')) return 'gcash';
  if (n.includes('maribank')) return 'maribank';
  if (n.includes('cash') || n === 'cod') return 'cod';
  return 'cod';
};

export const isPaymentMethodEnabled = (methodNameOrId, paymentMethods = DEFAULT_PAYMENT_METHODS) => {
  if (!paymentMethods) return true;
  const id = getPaymentMethodIdByName(methodNameOrId);
  return paymentMethods[id] !== false;
};
