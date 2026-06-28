/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, Store, User, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MerchantLoginMockProps {
  onSuccess: () => void;
  lang: 'ar' | 'en';
}

export function MerchantLoginMock({ onSuccess, lang }: MerchantLoginMockProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(lang === 'ar' ? 'يرجى ملء كافة الحقول المطلوبة.' : 'Please fill in all required fields.');
      return;
    }
    setError('');
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <div 
      className="max-w-md w-full mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-8"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Store className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 font-sans">
          {lang === 'ar' ? 'تسجيل دخول التاجر' : 'Merchant Login'}
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          {lang === 'ar' ? 'الوصول إلى لوحة تحكم المتجر وإدارة طلبات العملاء' : 'Access store dashboard and manage customer requests'}
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center my-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 animate-bounce" />
          <h3 className="text-sm font-bold text-emerald-800">
            {lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!'}
          </h3>
          <p className="text-xs text-emerald-600 mt-1">
            {lang === 'ar' ? 'جاري الانتقال للوحة التحكم الحية...' : 'Transitioning to the live dashboard...'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center gap-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              {lang === 'ar' ? 'البريد الإلكتروني للتاجر' : 'Merchant Email'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@store.sa"
                className={`w-full py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white ${
                  lang === 'ar' ? 'pl-3 pr-10 text-right' : 'pr-3 pl-10 text-left'
                }`}
              />
              <Mail className={`absolute top-3 w-4 h-4 text-stone-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            </div>
          </div>

          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              {lang === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white ${
                  lang === 'ar' ? 'pl-3 pr-10 text-right' : 'pr-3 pl-10 text-left'
                }`}
              />
              <Lock className={`absolute top-3 w-4 h-4 text-stone-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center gap-1.5 text-stone-500 select-none cursor-pointer">
              <input type="checkbox" className="rounded border-stone-300 text-teal-600 focus:ring-teal-500 bg-white" />
              <span>{lang === 'ar' ? 'تذكرني على هذا الجهاز' : 'Remember me on this device'}</span>
            </label>
            <span className="text-teal-600 hover:underline cursor-pointer">
              {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm mt-2 cursor-pointer"
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </form>
      )}
    </div>
  );
}

interface ActivateAccountMockProps {
  onSuccess: () => void;
  lang: 'ar' | 'en';
}

export function ActivateAccountMock({ onSuccess, lang }: ActivateAccountMockProps) {
  const [username, setUsername] = useState('');
  const [storeName, setStoreName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !storeName || !password || !confirmPassword) {
      setError(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة لتنشيط الحساب.' : 'Please fill in all fields to activate your account.');
      return;
    }
    if (password !== confirmPassword) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }
    setError('');
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  return (
    <div 
      className="max-w-md w-full mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-8"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 font-sans">
          {lang === 'ar' ? 'تنشيط الحساب وتعيين كلمة المرور' : 'Activate Account & Set Password'}
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          {lang === 'ar' ? 'تفعيل حساب التاجر وتعيين كلمة المرور السرية لمتجرك الجديد' : 'Activate the merchant account and set a secret password for your new store'}
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center my-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 animate-bounce" />
          <h3 className="text-sm font-bold text-emerald-800">
            {lang === 'ar' ? 'تم تفعيل وتنشيط الحساب بنجاح!' : 'Account activated successfully!'}
          </h3>
          <p className="text-xs text-emerald-600 mt-1">
            {lang === 'ar' ? 'تم إعداد المتجر والآن يمكنك تسجيل الدخول والبدء مباشرة.' : 'The store is set up and you can log in right away.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center gap-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              {lang === 'ar' ? 'اسم المستخدم (المالك / الموظف)' : 'Username (Owner / Staff)'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={lang === 'ar' ? 'عبدالرحمن آل سعود' : 'Abdulrahman Al Saud'}
                className={`w-full py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white ${
                  lang === 'ar' ? 'pl-3 pr-10 text-right' : 'pr-3 pl-10 text-left'
                }`}
              />
              <User className={`absolute top-3 w-4 h-4 text-stone-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            </div>
          </div>

          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              {lang === 'ar' ? 'اسم المتجر' : 'Store Name'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={lang === 'ar' ? 'نجد للقهوة المختصة' : 'Najd Specialty Coffee'}
                className={`w-full py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white ${
                  lang === 'ar' ? 'pl-3 pr-10 text-right' : 'pr-3 pl-10 text-left'
                }`}
              />
              <Store className={`absolute top-3 w-4 h-4 text-stone-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            </div>
          </div>

          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white ${
                  lang === 'ar' ? 'pl-3 pr-10 text-right' : 'pr-3 pl-10 text-left'
                }`}
              />
              <Lock className={`absolute top-3 w-4 h-4 text-stone-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            </div>
          </div>

          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white ${
                  lang === 'ar' ? 'pl-3 pr-10 text-right' : 'pr-3 pl-10 text-left'
                }`}
              />
              <Lock className={`absolute top-3 w-4 h-4 text-stone-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm mt-2 cursor-pointer"
          >
            {lang === 'ar' ? 'تنشيط الحساب وإعداد المتجر' : 'Activate Account & Set Up'}
          </button>
        </form>
      )}
    </div>
  );
}
