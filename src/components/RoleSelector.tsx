/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Store, UserCircle, Smartphone, HelpCircle, Globe, Sparkles } from 'lucide-react';

interface RoleSelectorProps {
  currentArea: 'landing' | 'admin' | 'merchant' | 'customer';
  merchantRole: 'store_owner' | 'customer_support' | 'warehouse_agent';
  onAreaChange: (area: 'landing' | 'admin' | 'merchant' | 'customer') => void;
  onMerchantRoleChange: (role: 'store_owner' | 'customer_support' | 'warehouse_agent') => void;
  lang: 'ar' | 'en';
  onLangChange: (lang: 'ar' | 'en') => void;
}

export default function RoleSelector({
  currentArea,
  merchantRole,
  onAreaChange,
  onMerchantRoleChange,
  lang,
  onLangChange,
}: RoleSelectorProps) {
  const isAr = lang === 'ar';

  return (
    <div className="bg-[#1c1917] text-white py-3 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-800 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <span className="bg-teal-600 text-white font-bold px-2.5 py-1 rounded text-sm tracking-wide">
          {isAr ? 'حلّها HAL-LA' : 'HAL-LA SaaS'}
        </span>
        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {isAr ? 'Demo Mode - للتنقل بين الأدوار في النموذج فقط' : 'Demo Mode - Switch roles for prototype simulation only'}
        </span>
        <div className="h-4 w-px bg-stone-700 hidden md:block"></div>
        <p className="text-xs text-stone-400 hidden md:block">
          {isAr 
            ? 'بيئة عمل تفاعلية لعرض تجربة المستخدم والتدفق البرمجي المتكامل' 
            : 'Interactive workspace demonstrating full UX workflow & programmatic flows'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Language Switcher */}
        <button
          onClick={() => onLangChange(isAr ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700/50 transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-teal-500" />
          <span>{isAr ? 'English (EN)' : 'العربية (AR)'}</span>
        </button>

        {/* Public SaaS Landing Page */}
        <button
          onClick={() => onAreaChange('landing')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentArea === 'landing'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? 'الصفحة الرئيسية للبرودكت' : 'Product Landing Page'}</span>
        </button>

        {/* Platform Admin Area */}
        <button
          onClick={() => onAreaChange('admin')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentArea === 'admin'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isAr ? 'منصة الإدارة (Platform Admin)' : 'Platform Admin Panel'}</span>
        </button>

        {/* Merchant Area */}
        <button
          onClick={() => onAreaChange('merchant')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentArea === 'merchant'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>{isAr ? 'لوحة التاجر (Merchant Panel)' : 'Merchant Panel'}</span>
        </button>

        {/* Customer Portal Area */}
        <button
          onClick={() => onAreaChange('customer')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentArea === 'customer'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isAr ? 'بوابة العميل (Customer Portal)' : 'Customer Portal'}</span>
        </button>
      </div>

      {/* Role selector if merchant area is active */}
      {currentArea === 'merchant' && (
        <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-lg p-1">
          <span className="text-[10px] text-stone-400 px-2 font-medium">{isAr ? 'صلاحية التاجر:' : 'Merchant Role:'}</span>
          
          <button
            onClick={() => onMerchantRoleChange('store_owner')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
              merchantRole === 'store_owner'
                ? 'bg-teal-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            {isAr ? 'مالك المتجر (Owner)' : 'Store Owner'}
          </button>

          <button
            onClick={() => onMerchantRoleChange('customer_support')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
              merchantRole === 'customer_support'
                ? 'bg-teal-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            {isAr ? 'الدعم الفني (Support)' : 'Support'}
          </button>

          <button
            onClick={() => onMerchantRoleChange('warehouse_agent')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
              merchantRole === 'warehouse_agent'
                ? 'bg-teal-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            {isAr ? 'المستودع (Warehouse)' : 'Warehouse'}
          </button>
        </div>
      )}

      {currentArea === 'customer' && (
        <div className="bg-purple-950/50 border border-purple-800/60 rounded px-2.5 py-1 text-[11px] text-purple-300 hidden lg:flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-purple-400" />
          <span>{isAr ? 'صُممت بوابة العميل بمقاس شاشة جوال تفاعلية (Mobile-First)' : 'Customer Portal is designed Mobile-First'}</span>
        </div>
      )}
    </div>
  );
}
