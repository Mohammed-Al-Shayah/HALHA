/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Store, CustomerRequest } from '../types';
import { 
  TrendingUp, 
  Layers, 
  Store as StoreIcon, 
  PlusCircle, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Calendar,
  Globe,
  Mail,
  User,
  ShieldAlert
} from 'lucide-react';

interface AdminPanelProps {
  stores: Store[];
  requests: CustomerRequest[];
  onCreateStore: (newStore: Omit<Store, 'stats' | 'createdAt'>) => void;
  onToggleStoreStatus: (storeId: string) => void;
}

export default function AdminPanel({
  stores,
  requests,
  onCreateStore,
  onToggleStoreStatus,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stores' | 'create_store'>('dashboard');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Form states for creating store
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreDomain, setNewStoreDomain] = useState('');
  const [newStoreOwner, setNewStoreOwner] = useState('');
  const [newStoreEmail, setNewStoreEmail] = useState('');
  const [newStorePlan, setNewStorePlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');
  const [newStoreLogo, setNewStoreLogo] = useState('🛍️');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName || !newStoreDomain || !newStoreOwner || !newStoreEmail) return;

    onCreateStore({
      id: `store-${Date.now()}`,
      name: newStoreName,
      domain: newStoreDomain,
      ownerName: newStoreOwner,
      ownerEmail: newStoreEmail,
      logo: newStoreLogo,
      status: 'active',
      plan: newStorePlan,
    });

    // Reset Form
    setNewStoreName('');
    setNewStoreDomain('');
    setNewStoreOwner('');
    setNewStoreEmail('');
    setNewStorePlan('pro');
    
    // Jump to stores tab
    setActiveTab('stores');
  };

  // Stats calculation
  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === 'active').length;
  const proStores = stores.filter(s => s.plan === 'pro').length;
  const enterpriseStores = stores.filter(s => s.plan === 'enterprise').length;
  
  const totalRevenue = stores.reduce((acc, s) => {
    if (s.status !== 'active') return acc;
    if (s.plan === 'basic') return acc + 199; // 199 ر.س شهرياً
    if (s.plan === 'pro') return acc + 499;   // 499 ر.س شهرياً
    return acc + 1299;                         // 1299 ر.س شهرياً
  }, 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/50">
            إدارة المنصة الشاملة (حلّها SaaS Admin)
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 mt-1">
            مرحباً بك في لوحة تحكّم النظام الرئيسيّة
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            تتبّع أداء الاشتراكات والمتاجر المربوطة بمحرّك "حلّها" وإدارتها تقنياً.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200/50 self-stretch md:self-auto">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedStore(null); }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard' && !selectedStore
                ? 'bg-white text-stone-950 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            الإحصائيات العامة
          </button>
          <button
            onClick={() => { setActiveTab('stores'); setSelectedStore(null); }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'stores' && !selectedStore
                ? 'bg-white text-stone-950 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            قائمة المتاجر ({totalStores})
          </button>
          <button
            onClick={() => { setActiveTab('create_store'); setSelectedStore(null); }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'create_store' && !selectedStore
                ? 'bg-white text-stone-950 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ربط متجر جديد
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedStore ? (
        /* Store details sub-view */
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedStore(null)}
            className="text-stone-500 hover:text-stone-900 text-xs font-medium flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-200/40 w-fit"
          >
            <span>&rarr; العودة لقائمة المتاجر</span>
          </button>

          <div className="premium-card p-6 md:p-8 smooth-shadow grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6 border-l border-stone-100 pl-0 lg:pl-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl bg-stone-50 p-4 rounded-2xl border border-stone-200/50">{selectedStore.logo}</span>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">{selectedStore.name}</h2>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">{selectedStore.domain}</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-4">
                <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-2.5">
                  <span className="text-stone-400">حالة الربط</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    selectedStore.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {selectedStore.status === 'active' ? 'مربوط ومفعّل' : 'موقوف مؤقتاً'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-2.5">
                  <span className="text-stone-400">باقة الاشتراك</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    selectedStore.plan === 'enterprise' 
                      ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                      : selectedStore.plan === 'pro' 
                        ? 'bg-teal-50 text-teal-700 border border-teal-100'
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                  }`}>
                    {selectedStore.plan === 'enterprise' ? 'الشركات الكبرى' : selectedStore.plan === 'pro' ? 'الباقة الاحترافية' : 'الباقة الأساسية'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-2.5">
                  <span className="text-stone-400">مالك الحساب</span>
                  <span className="text-stone-700 font-medium">{selectedStore.ownerName}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-2.5">
                  <span className="text-stone-400">بريد التواصل</span>
                  <span className="text-stone-700 font-mono text-xs">{selectedStore.ownerEmail}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-1">
                  <span className="text-stone-400">تاريخ الانضمام</span>
                  <span className="text-stone-700 text-xs font-mono">{selectedStore.createdAt}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onToggleStoreStatus(selectedStore.id);
                    setSelectedStore({
                      ...selectedStore,
                      status: selectedStore.status === 'active' ? 'suspended' : 'active'
                    });
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-2 ${
                    selectedStore.status === 'active'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{selectedStore.status === 'active' ? 'تعطيل الحساب وتجميد الخدمة' : 'إعادة تفعيل متجر التاجر'}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-stone-900 tracking-wide">أداء وإحصائيات المتجر</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#fbfaf8] border border-stone-200/50 p-4 rounded-xl">
                  <p className="text-xs text-stone-400">إجمالي طلبات التعويض</p>
                  <p className="text-2xl font-bold font-mono text-stone-900 mt-1">{selectedStore.stats.totalRequests}</p>
                </div>
                <div className="bg-[#fbfaf8] border border-stone-200/50 p-4 rounded-xl">
                  <p className="text-xs text-stone-400">الطلبات المعلقة حالياً</p>
                  <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{selectedStore.stats.pendingCount}</p>
                </div>
                <div className="bg-[#fbfaf8] border border-stone-200/50 p-4 rounded-xl col-span-2 md:col-span-1">
                  <p className="text-xs text-stone-400">الحالات المصعّدة للمالك</p>
                  <p className="text-2xl font-bold font-mono text-red-600 mt-1">{selectedStore.stats.escalatedCount}</p>
                </div>
                <div className="bg-[#fbfaf8] border border-stone-200/50 p-4 rounded-xl">
                  <p className="text-xs text-stone-400">متوسط وقت الإغلاق</p>
                  <p className="text-2xl font-bold font-mono text-stone-900 mt-1">{selectedStore.stats.avgResolutionHours} <span className="text-xs">ساعة</span></p>
                </div>
                <div className="bg-[#fbfaf8] border border-stone-200/50 p-4 rounded-xl col-span-2">
                  <p className="text-xs text-stone-400">تقييم رضا المشترين النهائي</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold font-mono text-emerald-600">{selectedStore.stats.customerSatisfaction}%</p>
                    <div className="flex-1 bg-stone-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${selectedStore.stats.customerSatisfaction}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Insights */}
              <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-xl flex items-start gap-3">
                <Activity className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">سجل النشاط الفني للحساب</h4>
                  <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                    الاتصال ببوابة سلة/زد مستقر بنسبة ١٠٠٪. تم تسليم آخر إشعار خطاف (Webhook) الخاص بالاسترجاع بنجاح قبل ٣٤ دقيقة. تم توليد إيصالات بوليصة الشحن بنجاح من خلال مزودي خدمات اللوجستيات (سمسا، أرامكس).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'dashboard' ? (
        /* Executive Dashboard view */
        <div className="space-y-8">
          {/* Key Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="premium-card p-5 smooth-shadow">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">إجمالي المتاجر المربوطة</span>
                <span className="p-2 bg-stone-50 rounded-lg text-stone-600 border border-stone-100"><StoreIcon className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-stone-900 mt-2">{totalStores}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 mt-2 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>{activeStores} متجر بحالة نشطة حالياً</span>
              </div>
            </div>

            <div className="premium-card p-5 smooth-shadow">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">العائد الشهري المتكرر (MRR)</span>
                <span className="p-2 bg-stone-50 rounded-lg text-stone-600 border border-stone-100"><TrendingUp className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-teal-600 mt-2">
                {totalRevenue.toLocaleString()} <span className="text-xs">ر.س</span>
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-2 font-medium">
                <Layers className="w-3 h-3" />
                <span>من قنوات الاشتراكات الفعّالة</span>
              </div>
            </div>

            <div className="premium-card p-5 smooth-shadow">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">إجمالي الحالات المعالجة بالنظام</span>
                <span className="p-2 bg-stone-50 rounded-lg text-stone-600 border border-stone-100"><Activity className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-stone-900 mt-2">{requests.length + 540}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 mt-2 font-medium">
                <AlertTriangle className="w-3 h-3" />
                <span>٨ حالات استثنائية قيد الانتظار اليوم</span>
              </div>
            </div>

            <div className="premium-card p-5 smooth-shadow">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">معدل توافر النظام (Uptime)</span>
                <span className="p-2 bg-stone-50 rounded-lg text-stone-600 border border-stone-100"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-stone-900 mt-2">٩٩.٩٨%</p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 mt-2 font-medium">
                <Activity className="w-3 h-3" />
                <span>جميع السيرفرات في وضع سليم ومستقر</span>
              </div>
            </div>
          </div>

          {/* Subscriptions Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="premium-card p-6 smooth-shadow lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-stone-950">توزيع المتاجر حسب باقات الاشتراك في حلّها</h3>
              
              <div className="space-y-4 pt-2">
                {/* Enterprise bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-stone-700 mb-1.5">
                    <span>باقة الشركات الكبرى (1299 ر.س/شهر)</span>
                    <span className="font-mono">{enterpriseStores} متاجر ({Math.round(enterpriseStores/totalStores*100) || 0}%)</span>
                  </div>
                  <div className="bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${(enterpriseStores/totalStores)*100 || 0}%` }}></div>
                  </div>
                </div>

                {/* Pro bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-stone-700 mb-1.5">
                    <span>الباقة الاحترافية الأكثر مبيعاً (499 ر.س/شهر)</span>
                    <span className="font-mono">{proStores} متاجر ({Math.round(proStores/totalStores*100) || 0}%)</span>
                  </div>
                  <div className="bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${(proStores/totalStores)*100 || 0}%` }}></div>
                  </div>
                </div>

                {/* Basic bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-stone-700 mb-1.5">
                    <span>الباقة الأساسية للمتاجر الصغيرة (199 ر.س/شهر)</span>
                    <span className="font-mono">{totalStores - proStores - enterpriseStores} متاجر ({Math.round((totalStores - proStores - enterpriseStores)/totalStores*100) || 0}%)</span>
                  </div>
                  <div className="bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-stone-400 h-2.5 rounded-full" style={{ width: `${((totalStores - proStores - enterpriseStores)/totalStores)*100 || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card p-6 smooth-shadow space-y-4">
              <h3 className="text-sm font-bold text-stone-950">مستجدات منصة حلّها</h3>
              <div className="space-y-4 pt-1 text-xs">
                <div className="flex items-start gap-2.5 border-b border-stone-100 pb-3">
                  <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg shrink-0 mt-0.5"><Activity className="w-3.5 h-3.5" /></span>
                  <div>
                    <p className="font-semibold text-stone-800">إطلاق ميزة التفتيش الذكي</p>
                    <p className="text-stone-500 mt-0.5 leading-relaxed">أصبح بإمكان أمناء المستودعات رفع تقرير التفتيش بالصور مع توليد فوري لباركود التعويض العكسي.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg shrink-0 mt-0.5"><Calendar className="w-3.5 h-3.5" /></span>
                  <div>
                    <p className="font-semibold text-stone-800">تحديثات واجهة زد / سلة</p>
                    <p className="text-stone-500 mt-0.5 leading-relaxed">أتمتة كاملة لإرجاع المبالغ مباشرة إلى بوابات الدفع (تابي، تمارا، ومدى) دون تدخل يدوي.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'stores' ? (
        /* Stores List view */
        <div className="premium-card smooth-shadow overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">سجل حسابات التجار المسجلين</h3>
            <span className="text-xs text-stone-500">مجموع المتاجر: {totalStores}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 border-b border-stone-200/50 text-stone-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">المتجر وشعار العلامة</th>
                  <th className="px-6 py-4">المالك وجهة الاتصال</th>
                  <th className="px-6 py-4">باقة الخدمة</th>
                  <th className="px-6 py-4">الطلبات المعالجة</th>
                  <th className="px-6 py-4">الرضا العام</th>
                  <th className="px-6 py-4">حالة الربط</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-stone-50/70 transition-all">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl bg-stone-100 p-2 rounded-xl border border-stone-200/40">{store.logo}</span>
                        <div>
                          <p className="font-bold text-stone-900">{store.name}</p>
                          <p className="text-[11px] text-stone-400 font-mono mt-0.5">{store.domain}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="text-stone-800">{store.ownerName}</p>
                      <p className="text-[11px] text-stone-400 font-mono mt-0.5">{store.ownerEmail}</p>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        store.plan === 'enterprise'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : store.plan === 'pro'
                            ? 'bg-teal-50 text-teal-700 border border-teal-100'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}>
                        {store.plan === 'enterprise' ? 'مؤسسات كبرى' : store.plan === 'pro' ? 'الباقة الاحترافية' : 'باقة أساسية'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-mono text-stone-900 text-sm">
                      {store.stats.totalRequests} طلب
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1.5 font-mono text-stone-900">
                        <span className="text-emerald-600 font-bold">{store.stats.customerSatisfaction}%</span>
                        <span className="text-stone-300 text-[10px]">&bull; رائع</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        store.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/30'
                          : 'bg-stone-100 text-stone-500 border border-stone-200/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${store.status === 'active' ? 'bg-emerald-600' : 'bg-stone-400'}`}></span>
                        <span>{store.status === 'active' ? 'نشط ومستمر' : 'معطل مؤقتاً'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedStore(store)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200/40 transition-all"
                          title="عرض التفاصيل والأداء"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleStoreStatus(store.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            store.status === 'active'
                              ? 'text-rose-600 hover:text-rose-900 bg-rose-50 border-rose-100 hover:bg-rose-100'
                              : 'text-emerald-600 hover:text-emerald-900 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                          }`}
                          title={store.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Create Store Form view */
        <div className="max-w-xl mx-auto premium-card p-6 md:p-8 smooth-shadow">
          <div className="border-b border-stone-100 pb-4 mb-6">
            <h3 className="text-base font-bold text-stone-900">ربط وتفعيل متجر إلكتروني جديد</h3>
            <p className="text-xs text-stone-500 mt-1">توليد مساحة معزولة جديدة للتاجر وتفعيل تكامل API مباشرة.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">اسم المتجر التجاري</label>
                <div className="relative">
                  <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-mono"><StoreIcon className="w-4 h-4" /></span>
                  <input
                    type="text"
                    required
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="مثال: سلة العطور الراقية"
                    className="w-full pr-10 pl-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">أيقونة مميزة</label>
                <select
                  value={newStoreLogo}
                  onChange={(e) => setNewStoreLogo(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8]"
                >
                  <option value="🛍️">🛍️ حقيبة تسوق</option>
                  <option value="👗">👗 ملابس/عبايات</option>
                  <option value="☕">☕ مقهى/بن</option>
                  <option value="✨">✨ عطور ومستحضرات</option>
                  <option value="🔌">🔌 إلكترونيات</option>
                  <option value="👟">👟 أحذية ورياضة</option>
                  <option value="🎮">🎮 ألعاب وترفيه</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">النطاق والربط التقني (Domain)</label>
              <div className="relative">
                <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-mono"><Globe className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  value={newStoreDomain}
                  onChange={(e) => setNewStoreDomain(e.target.value)}
                  placeholder="eliteperfumes.sa"
                  className="w-full pr-10 pl-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8] text-right"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">اسم المسؤول للتواصل</label>
                <div className="relative">
                  <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-mono"><User className="w-4 h-4" /></span>
                  <input
                    type="text"
                    required
                    value={newStoreOwner}
                    onChange={(e) => setNewStoreOwner(e.target.value)}
                    placeholder="خالد بن يوسف"
                    className="w-full pr-10 pl-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني للإدارة</label>
                <div className="relative">
                  <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-mono"><Mail className="w-4 h-4" /></span>
                  <input
                    type="email"
                    required
                    value={newStoreEmail}
                    onChange={(e) => setNewStoreEmail(e.target.value)}
                    placeholder="admin@perfume.sa"
                    className="w-full pr-10 pl-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8] text-right"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">باقة الترخيص والاشتراك السنوية</label>
              <div className="grid grid-cols-3 gap-3">
                <label className={`border p-3 rounded-xl cursor-pointer flex flex-col justify-between h-20 transition-all ${
                  newStorePlan === 'basic' ? 'border-amber-500 bg-amber-50/30 ring-1 ring-amber-500' : 'border-stone-200 hover:bg-stone-50'
                }`}>
                  <input 
                    type="radio" 
                    name="plan" 
                    value="basic" 
                    checked={newStorePlan === 'basic'}
                    onChange={() => setNewStorePlan('basic')}
                    className="sr-only" 
                  />
                  <span className="text-xs font-bold text-stone-800">باقة أساسية</span>
                  <span className="text-[10px] text-stone-500 font-mono">199 ر.س / شهرياً</span>
                </label>

                <label className={`border p-3 rounded-xl cursor-pointer flex flex-col justify-between h-20 transition-all ${
                  newStorePlan === 'pro' ? 'border-amber-500 bg-amber-50/30 ring-1 ring-amber-500' : 'border-stone-200 hover:bg-stone-50'
                }`}>
                  <input 
                    type="radio" 
                    name="plan" 
                    value="pro" 
                    checked={newStorePlan === 'pro'}
                    onChange={() => setNewStorePlan('pro')}
                    className="sr-only" 
                  />
                  <span className="text-xs font-bold text-stone-800">الباقة الاحترافية</span>
                  <span className="text-[10px] text-teal-600 font-bold font-mono">499 ر.س / شهرياً</span>
                </label>

                <label className={`border p-3 rounded-xl cursor-pointer flex flex-col justify-between h-20 transition-all ${
                  newStorePlan === 'enterprise' ? 'border-amber-500 bg-amber-50/30 ring-1 ring-amber-500' : 'border-stone-200 hover:bg-stone-50'
                }`}>
                  <input 
                    type="radio" 
                    name="plan" 
                    value="enterprise" 
                    checked={newStorePlan === 'enterprise'}
                    onChange={() => setNewStorePlan('enterprise')}
                    className="sr-only" 
                  />
                  <span className="text-xs font-bold text-stone-800">باقة الشركات</span>
                  <span className="text-[10px] text-purple-600 font-bold font-mono">1299 ر.س / شهرياً</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl text-xs font-bold mt-4 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ربط وتفعيل المتجر فوراً</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
