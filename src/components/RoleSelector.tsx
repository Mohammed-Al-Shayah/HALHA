/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Store, UserCircle, Smartphone, HelpCircle } from 'lucide-react';

interface RoleSelectorProps {
  currentArea: 'admin' | 'merchant' | 'customer';
  merchantRole: 'owner' | 'support' | 'warehouse';
  onAreaChange: (area: 'admin' | 'merchant' | 'customer') => void;
  onMerchantRoleChange: (role: 'owner' | 'support' | 'warehouse') => void;
}

export default function RoleSelector({
  currentArea,
  merchantRole,
  onAreaChange,
  onMerchantRoleChange,
}: RoleSelectorProps) {
  return (
    <div className="bg-[#1c1917] text-white py-3 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-800 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <span className="bg-teal-600 text-white font-bold px-2.5 py-1 rounded text-sm tracking-wide">
          حلّها HAL-LA
        </span>
        <div className="h-4 w-px bg-stone-700 hidden md:block"></div>
        <p className="text-xs text-stone-400 hidden md:block">
          بيئة عمل تفاعلية لعرض تجربة المستخدم والتدفق البرمجي المتكامل
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Platform Admin Area */}
        <button
          onClick={() => onAreaChange('admin')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentArea === 'admin'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>منصة الإدارة (Platform Admin)</span>
        </button>

        {/* Merchant Area */}
        <button
          onClick={() => onAreaChange('merchant')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentArea === 'merchant'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>لوحة التاجر (Merchant Panel)</span>
        </button>

        {/* Customer Portal Area */}
        <button
          onClick={() => onAreaChange('customer')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentArea === 'customer'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>بوابة العميل (Customer Portal)</span>
        </button>
      </div>

      {/* Role selector if merchant area is active */}
      {currentArea === 'merchant' && (
        <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-lg p-1">
          <span className="text-[10px] text-stone-400 px-2 font-medium">صلاحية التاجر:</span>
          
          <button
            onClick={() => onMerchantRoleChange('owner')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              merchantRole === 'owner'
                ? 'bg-teal-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            مالك المتجر (Owner)
          </button>

          <button
            onClick={() => onMerchantRoleChange('support')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              merchantRole === 'support'
                ? 'bg-teal-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            الدعم الفني (Support)
          </button>

          <button
            onClick={() => onMerchantRoleChange('warehouse')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              merchantRole === 'warehouse'
                ? 'bg-teal-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            المستودع (Warehouse)
          </button>
        </div>
      )}

      {currentArea === 'customer' && (
        <div className="bg-purple-950/50 border border-purple-800/60 rounded px-2.5 py-1 text-[11px] text-purple-300 hidden lg:flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-purple-400" />
          <span>صُممت بوابة العميل بمقاس شاشة جوال تفاعلية (Mobile-First)</span>
        </div>
      )}
    </div>
  );
}
