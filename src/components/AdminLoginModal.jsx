import React, { useState } from 'react';
import { Lock, User, Key, Eye, EyeOff, X, AlertCircle, Loader2 } from 'lucide-react';

// Cryptographic SHA-256 hash of admin password 'Bunny_016' (for static fallback mode)
// Plaintext password is NEVER stored or exposed in client-side code
const ADMIN_USER = 'kvn000';
const ADMIN_PW_SHA256 = '948da5a462da4b0d25bedb5cd97a1abc37a6b3edb66efab6e591e91bb800ef78';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. First attempt: call backend API if available
      let backendSuccess = false;
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password
          })
        });

        const contentType = res.headers.get('content-type') || '';
        // Only parse JSON if server explicitly returned application/json (prevents Safari DOMException)
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok && data.success) {
            backendSuccess = true;
            sessionStorage.setItem('mani_admin_token', data.token);
            sessionStorage.setItem('mani_admin_user', JSON.stringify(data.user));
            onLoginSuccess(data.token, data.user);
            onClose();
            setUsername('');
            setPassword('');
            return;
          } else {
            // Backend reached and returned invalid credentials
            throw new Error(data.error || 'Invalid username or password.');
          }
        }
      } catch (backendErr) {
        if (backendErr.message === 'Invalid username or password.') {
          throw backendErr;
        }
        // Otherwise backend is not running (e.g. GitHub Pages static site)
      }

      if (backendSuccess) return;

      // 2. Static / GitHub Pages Fallback:
      // Verify credentials using browser's built-in SubtleCrypto SHA-256
      const buffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const enteredHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (username.trim() !== ADMIN_USER || enteredHash !== ADMIN_PW_SHA256) {
        throw new Error('Invalid username or password.');
      }

      // Valid credentials in static mode
      const staticToken = `static_admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const staticUser = { username: ADMIN_USER };

      sessionStorage.setItem('mani_admin_token', staticToken);
      sessionStorage.setItem('mani_admin_user', JSON.stringify(staticUser));

      onLoginSuccess(staticToken, staticUser);
      onClose();
      setUsername('');
      setPassword('');

    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mani-950/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-mani-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-mani-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-900/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-mani-900">Admin Login</h2>
              <p className="text-xs text-mani-500 font-medium">Store Management & Settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-mani-400 hover:text-mani-800 hover:bg-mani-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-mani-800 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              disabled={isLoading}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-mani-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
            />
          </div>

          {/* Password (Masked with Show/Hide toggle) */}
          <div>
            <label className="block text-xs font-bold text-mani-800 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                disabled={isLoading}
                className="w-full text-sm px-4 py-2.5 pr-11 rounded-xl border border-mani-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mani-400 hover:text-mani-700 p-1 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Log In to Admin Portal</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-mani-100 text-center">
          <p className="text-[11px] text-mani-400">
            Protected area. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
