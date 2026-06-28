/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, Store, User, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MerchantLoginMockProps {
  onSuccess: () => void;
}

export function MerchantLoginMock({ onSuccess }: MerchantLoginMockProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى ملء كافة الحقول المطلوبة.');
      return;
    }
    setError('');
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-right dir-rtl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Store className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 font-sans">تسجيل دخول التاجر</h2>
        <p className="text-xs text-stone-500 mt-1">الوصول إلى لوحة تحكم المتجر وإدارة طلبات العملاء</p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center my-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 animate-bounce" />
          <h3 className="text-sm font-bold text-emerald-800">تم تسجيل الدخول بنجاح!</h3>
          <p className="text-xs text-emerald-600 mt-1">جاري الانتقال للوحة التحكم الحية...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">البريد الإلكتروني للتاجر</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@store.sa"
                className="w-full pl-3 pr-10 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-left"
              />
              <Mail className="absolute top-3 right-3 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-left"
              />
              <Lock className="absolute top-3 right-3 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center gap-1.5 text-stone-500 select-none cursor-pointer">
              <input type="checkbox" className="rounded border-stone-300 text-teal-600 focus:ring-teal-500" />
              <span>تذكرني على هذا الجهاز</span>
            </label>
            <span className="text-teal-600 hover:underline cursor-pointer">نسيت كلمة المرور؟</span>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm mt-2"
          >
            تسجيل الدخول
          </button>
        </form>
      )}
    </div>
  );
}

interface ActivateAccountMockProps {
  onSuccess: () => void;
}

export function ActivateAccountMock({ onSuccess }: ActivateAccountMockProps) {
  const [username, setUsername] = useState('');
  const [storeName, setStoreName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !storeName || !password || !confirmPassword) {
      setError('يرجى ملء جميع الحقول المطلوبة لتنشيط الحساب.');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setError('');
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-right dir-rtl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 font-sans">تنشيط الحساب وتعيين كلمة المرور</h2>
        <p className="text-xs text-stone-500 mt-1">تفعيل حساب التاجر وتعيين كلمة المرور السرية لمتجرك الجديد</p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center my-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 animate-bounce" />
          <h3 className="text-sm font-bold text-emerald-800">تم تفعيل وتنشيط الحساب بنجاح!</h3>
          <p className="text-xs text-emerald-600 mt-1">تم إعداد المتجر والآن يمكنك تسجيل الدخول والبدء مباشرة.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">اسم المستخدم (المالك / الموظف)</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="عبدالرحمن آل سعود"
                className="w-full pl-3 pr-10 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <User className="absolute top-3 right-3 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">اسم المتجر</label>
            <div className="relative">
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="نجد للقهوة المختصة"
                className="w-full pl-3 pr-10 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <Store className="absolute top-3 right-3 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-left"
              />
              <Lock className="absolute top-3 right-3 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">تأكيد كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-left"
              />
              <Lock className="absolute top-3 right-3 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm mt-2"
          >
            تنشيط الحساب وإعداد المتجر
          </button>
        </form>
      )}
    </div>
  );
}
