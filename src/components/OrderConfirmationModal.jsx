import React, { useState } from 'react';
import { CheckCircle2, Share2, Copy, Check, ShoppingBag, MapPin, CreditCard, Phone, User } from 'lucide-react';
import { formatPHP } from '../config/products';
import { GCASH_NUMBER } from '../config/qrConfig';

export default function OrderConfirmationModal({ order, onReset }) {
  const [copied, setCopied] = useState(false);
  const [copiedGcash, setCopiedGcash] = useState(false);

  if (!order) return null;

  const orderSummaryText = `🥜 *Mani Wandering ORDER CONFIRMATION* 🥜
Order #: ${order.orderId}
Date: ${order.orderDate} ${order.orderTime}
Customer: ${order.customerName}
Mobile: ${order.mobileNumber}
Delivery Address: ${order.deliveryAddress}
Payment Method: ${order.paymentMethod}

*Items Ordered:*
${(order.items || [])
  .filter((it) => (it.quantity || 0) > 0)
  .map((it) => `• ${it.name} × ${it.quantity} tub(s) (₱${it.price * it.quantity})`)
  .join('\n')}

*Total Tubs:* ${order.totalPacks}
*Total Amount:* ${formatPHP(order.subtotal)}
Status: ${order.status || 'New'}

Salamat sa pag-order sa Mani Wandering! 🥜✨`;

  const handleCopy = () => {
    navigator.clipboard.writeText(orderSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(orderSummaryText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopyGcash = () => {
    navigator.clipboard.writeText(GCASH_NUMBER);
    setCopiedGcash(true);
    setTimeout(() => setCopiedGcash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-mani-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200 animate-fade-in space-y-6">
        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-green-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="inline-block text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Order Confirmed
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-mani-900 tracking-tight">
            🎉 Order Received!
          </h2>
          <p className="text-sm text-mani-600 font-medium">
            Thank you, <span className="font-bold text-mani-900">{order.customerName}</span>! Your Mani Wandering order has been placed.
          </p>
        </div>

        {/* Order Card Ticket */}
        <div className="bg-cream rounded-2xl p-5 border border-dashed border-amber-300 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-mani-500 block">
                Order Tracking Number
              </span>
              <span className="text-base sm:text-lg font-black text-amber-900 font-mono tracking-wide">
                {order.orderId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-mani-500 block">
                Status
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                🟡 {order.status || 'Pending'}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="space-y-2 text-xs border-b border-amber-200/80 pb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-mani-500 font-medium">Customer:</span>{' '}
                <span className="font-bold text-mani-900">{order.customerName}</span>
              </div>
              <div>
                <span className="text-mani-500 font-medium">Mobile:</span>{' '}
                <span className="font-bold text-mani-900">{order.mobileNumber}</span>
              </div>
            </div>
            <div>
              <span className="text-mani-500 font-medium">Delivery Address:</span>{' '}
              <span className="font-bold text-mani-900">{order.deliveryAddress}</span>
            </div>
            <div>
              <span className="text-mani-500 font-medium">Payment Mode:</span>{' '}
              <span className="font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                {order.paymentMethod}
              </span>
            </div>
          </div>

          {/* Items Summary Breakdown */}
          <div className="space-y-2 text-xs sm:text-sm">
            <h4 className="font-extrabold text-mani-700 text-xs uppercase tracking-wider">
              Your Order Breakdown:
            </h4>
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-mani-100">
              {(order.items || [])
                .filter((it) => (it.quantity || 0) > 0)
                .map((it) => (
                  <div key={it.id} className="flex justify-between items-center text-mani-800">
                    <span className="font-medium">
                      {it.name} <span className="text-amber-800 font-bold">× {it.quantity}</span>
                    </span>
                    <span className="font-bold text-mani-900">{formatPHP(it.price * it.quantity)}</span>
                  </div>
                ))}

              <div className="pt-2 mt-2 border-t border-mani-200 flex justify-between font-extrabold text-sm text-mani-900">
                <span>Total ({order.totalPacks} tubs):</span>
                <span className="text-amber-700 font-black">{formatPHP(order.subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Notice */}
          {order.paymentMethod === 'Cash on Delivery' && (
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold flex items-center gap-2">
              <span>💵</span> Payment of {formatPHP(order.subtotal)} will be collected upon delivery.
            </div>
          )}

          {order.paymentMethod === 'GCash' && (
            <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs space-y-1.5">
              <div className="font-bold flex items-center justify-between">
                <span>📱 GCash Payment Instructions:</span>
                <button
                  type="button"
                  onClick={handleCopyGcash}
                  className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white"
                >
                  {copiedGcash ? 'Copied!' : 'Copy 09055182263'}
                </button>
              </div>
              <p>Please send {formatPHP(order.subtotal)} to GCash: <strong>09055182263</strong> (JO******N R.).</p>
            </div>
          )}

          {order.paymentMethod === 'Maribank' && (
            <div className="p-3 rounded-xl bg-orange-50 text-orange-900 text-xs space-y-1">
              <span className="font-bold">🏦 Maribank Payment Instructions:</span>
              <p>Please send {formatPHP(order.subtotal)} to JOHN KEVIN RAMIREZ: MariBank(****0559).</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl border border-mani-200 bg-mani-50 hover:bg-mani-100 text-mani-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Receipt!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Receipt</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Place Another Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
