'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your passwords.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('You must agree to the Terms & Conditions to register.');
      return;
    }

    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      router.push('/blogs');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-4 py-12 font-poppins">
      {/* Scenic Background with Blur */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center filter blur-xs brightness-90"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-[#faf8f5]/40 dark:bg-[#0b0f12]/80 backdrop-blur-sm" />
      </div>

      {/* Centered Modal / Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#121920] rounded-3xl shadow-2xl border border-white/60 dark:border-[#243340] p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Join Blogify and start sharing your stories
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="register-name" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                id="register-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76] focus:bg-white dark:focus:bg-[#18232c] transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="register-email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76] focus:bg-white dark:focus:bg-[#18232c] transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="register-password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 bg-gray-50/70 dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76] focus:bg-white dark:focus:bg-[#18232c] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label htmlFor="register-confirm-password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 bg-gray-50/70 dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76] focus:bg-white dark:focus:bg-[#18232c] transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded text-[#182226] accent-[#182226] dark:accent-[#e2ad76]"
              />
              <span>
                I agree to the <span className="font-semibold text-gray-900 dark:text-white underline">Terms & Conditions</span>
              </span>
            </label>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] text-sm font-semibold transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Sign Up</span>
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-[#1e2a34]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#182226] dark:text-[#e2ad76] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

