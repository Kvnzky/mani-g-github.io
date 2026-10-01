import React, { useState, useEffect } from 'react';
import { CheckCircle2, Share2, Copy, Check, ShoppingBag } from 'lucide-react';
import { formatPHP } from '../config/products';
import { GCASH_NUMBER } from '../config/qrConfig';

export default function OrderConfirmationModal({ order, onReset, customQrs }) {
  const [copied, setCopied] = useState(false);
  const [copiedGcash, setCopiedGcash] = useState(false);

  useEffect(() => {
    if (!order) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onReset) {
        onReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [order, onReset]);

  if (!order) return null;

  const gcashNumber = customQrs?.gcashNumber || GCASH_NUMBER;

  const orderSummaryText = `🥜 *Mani Wandering ORDER CONFIRMATION* 🥜
Order #: ${order.orderId}
Date: ${order.orderDate} ${order.orderTime}
Customer: ${order.customerName}
${order.mobileNumber ? `Mobile: ${order.mobileNumber}\n` : ''}Delivery Address: ${order.deliveryAddress}
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
    navigator.clipboard.writeText(gcashNumber);
    setCopiedGcash(true);
    setTimeout(() => setCopiedGcash(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-confirmed-heading"
      className="fixed inset-0 z-50 overflow-y-auto bg-mani-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-mani-900 animate-fade-in space-y-6">
        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-emerald-400 text-mani-950 border-2 border-mani-900 flex items-center justify-center mx-auto shadow-snack-sm">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <span className="inline-block text-xs font-black uppercase tracking-widest text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
            Order Confirmed • Salamat Suki!
          </span>
          <h2 id="order-confirmed-heading" className="font-display text-2xl sm:text-3xl font-bold text-mani-950 tracking-tight">
            🎉 Order Received!
          </h2>
          <p className="text-sm text-mani-600 font-medium">
            Maraming salamat, <span className="font-bold text-mani-950">{order.customerName}</span>! Your Mani Wandering tubs are queued up!
          </p>
        </div>

        {/* Order Card Ticket */}
        <div className="bg-cream-warm/80 rounded-2xl p-5 border-2 border-dashed border-mani-400 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-mani-200 pb-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-mani-600 block">
                Order Tracking Number
              </span>
              <span className="text-base sm:text-lg font-black text-mani-950 font-mono tracking-wide">
                {order.orderId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-mani-600 block">
                Status
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-200 text-mani-950 px-2.5 py-0.5 rounded-full border border-mani-900/25">
                🟡 {order.status || 'Pending'}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="space-y-2 text-xs border-b border-mani-200 pb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-mani-600 font-medium">Customer:</span>{' '}
                <span className="font-bold text-mani-950">{order.customerName}</span>
              </div>
              <div>
                <span className="text-mani-600 font-medium">Mobile:</span>{' '}
                <span className="font-bold text-mani-950">{order.mobileNumber || 'Not provided'}</span>
              </div>
            </div>
            <div>
              <span className="text-mani-600 font-medium">Delivery Address:</span>{' '}
              <span className="font-bold text-mani-950">{order.deliveryAddress}</span>
            </div>
            <div>
              <span className="text-mani-600 font-medium">Payment Mode:</span>{' '}
              <span className="font-extrabold bg-amber-200/80 text-mani-950 px-2 py-0.5 rounded border border-mani-900/15">
                {order.paymentMethod}
              </span>
            </div>
          </div>

          {/* Items Summary Breakdown */}
          <div className="space-y-2 text-xs sm:text-sm">
            <h4 className="font-extrabold text-mani-800 text-xs uppercase tracking-wider">
              Your Tubs Breakdown:
            </h4>
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-mani-200">
              {(order.items || [])
                .filter((it) => (it.quantity || 0) > 0)
                .map((it) => (
                  <div key={it.id} className="flex justify-between items-center text-mani-800">
                    <span className="font-bold">
                      {it.name} <span className="text-amber-800 font-extrabold">× {it.quantity}</span>
                    </span>
                    <span className="font-display font-bold text-mani-950">{formatPHP(it.price * it.quantity)}</span>
                  </div>
                ))}

              <div className="pt-2 mt-2 border-t border-dashed border-mani-200 flex justify-between font-extrabold text-sm text-mani-950">
                <span>Total ({order.totalPacks} tubs):</span>
                <span className="font-display text-lg text-mani-950 font-bold">{formatPHP(order.subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Notice */}
          {order.paymentMethod === 'Cash on Delivery' && (
            <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-mani-950 text-xs font-bold flex items-center gap-2">
              <span>💵</span> Payment of {formatPHP(order.subtotal)} will be collected upon delivery.
            </div>
          )}

          {order.paymentMethod === 'GCash' && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs space-y-1.5">
              <div className="font-bold flex items-center justify-between">
                <span>📱 GCash Payment Instructions:</span>
                <button
                  type="button"
                  onClick={handleCopyGcash}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-600 text-white cursor-pointer"
                >
                  {copiedGcash ? 'Copied!' : `Copy ${gcashNumber}`}
                </button>
              </div>
              <p>Please send {formatPHP(order.subtotal)} to GCash: <strong>{gcashNumber}</strong> (JO******N R.).</p>
            </div>
          )}

          {order.paymentMethod === 'Maribank' && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs space-y-1">
              <span className="font-bold">🏦 Maribank Payment Instructions:</span>
              <p>Please send {formatPHP(order.subtotal)} to JOHN KEVIN RAMIREZ: MariBank(****0559).</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl border-2 border-mani-900/20 bg-cream-warm hover:bg-amber-100 text-mani-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Receipt!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="py-2.5 px-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Receipt</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-mani-950 font-display font-bold text-sm sm:text-base border-2 border-mani-900 shadow-snack active:translate-y-0.5 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span>Order More Tubs 🥜</span>
          </button>
        </div>
      </div>
    </div>
  );
}
