/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Store, CustomerRequest } from '../types';
import { 
  Store as StoreIcon, 
  PlusCircle, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Globe,
  Mail,
  User,
  Phone,
  ShieldAlert,
  Copy,
  Check,
  LayoutDashboard,
  List,
  Plus
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
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [status, setStatus] = useState<'pending' | 'active' | 'disabled'>('active');
  const [storeLogo, setStoreLogo] = useState('🛍️');

  // Success screen state after creation
  const [createdUrls, setCreatedUrls] = useState<{
    customerPortalUrl: string;
    activationUrl: string;
    storeName: string;
  } | null>(null);

  const [copiedPortal, setCopiedPortal] = useState(false);
  const [copiedActivation, setCopiedActivation] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !slug || !ownerName || !ownerEmail || !ownerPhone) return;

    // Clean slug
    const cleanedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    const storeDomain = `${cleanedSlug}.halha.com`;

    const newStoreId = `store-${Date.now()}`;

    onCreateStore({
      id: newStoreId,
      name: storeName,
      slug: cleanedSlug,
      domain: storeDomain,
      ownerName,
      ownerEmail,
      ownerPhone,
      logo: storeLogo,
      status: status,
      plan: 'basic', // Default internal plan
    });

    // Set links for display
    const host = window.location.origin;
    setCreatedUrls({
      customerPortalUrl: `${host}/portal/${cleanedSlug}`,
      activationUrl: `${host}/activate/${cleanedSlug}`,
      storeName: storeName,
    });

    // Reset Form fields
    setStoreName('');
    setSlug('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPhone('');
    setStatus('active');
    setStoreLogo('🛍️');
  };

  const copyToClipboard = (text: string, type: 'portal' | 'activation') => {
    navigator.clipboard.writeText(text);
    if (type === 'portal') {
      setCopiedPortal(true);
      setTimeout(() => setCopiedPortal(false), 2000);
    } else {
      setCopiedActivation(true);
      setTimeout(() => setCopiedActivation(false), 2000);
    }
  };

  // Stats calculation
  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === 'active').length;
  const pendingStores = stores.filter(s => s.status === 'pending').length;
  const disabledStores = stores.filter(s => s.status === 'disabled').length;
  const totalProcessedRequests = requests.length + 540;

  // Average satisfaction
  const avgSatisfaction = Math.round(
    stores.reduce((acc, s) => acc + s.stats.customerSatisfaction, 0) / (totalStores || 1)
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/50">
            إدارة المنصة الشاملة (حلّها MVP Admin)
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 mt-1">
            مرحباً بك في لوحة تحكّم النظام الرئيسيّة
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            مراقبة المتاجر المسجلة وتهيئة بوابات الخدمة للعملاء والتجار.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200/50 self-stretch md:self-auto">
          <button
            id="admin-tab-dashboard"
            onClick={() => { setActiveTab('dashboard'); setSelectedStore(null); setCreatedUrls(null); }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard' && !selectedStore
                ? 'bg-white text-stone-950 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>الإحصائيات العامة</span>
          </button>
          <button
            id="admin-tab-stores"
            onClick={() => { setActiveTab('stores'); setSelectedStore(null); setCreatedUrls(null); }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'stores' && !selectedStore
                ? 'bg-white text-stone-950 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>قائمة المتاجر ({totalStores})</span>
          </button>
          <button
            id="admin-tab-create"
            onClick={() => { setActiveTab('create_store'); setSelectedStore(null); setCreatedUrls(null); }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'create_store' && !selectedStore
                ? 'bg-white text-stone-950 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ربط متجر جديد</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedStore ? (
        /* Store details sub-view */
        <div className="space-y-6">
          <button 
            id="admin-btn-back-stores"
            onClick={() => setSelectedStore(null)}
            className="text-stone-500 hover:text-stone-900 text-xs font-medium flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-200/40 w-fit transition-all"
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
                  <span className="text-stone-400 font-medium">حالة الربط</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    selectedStore.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : selectedStore.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>
                    {selectedStore.status === 'active' ? 'نشط ومفعّل' : selectedStore.status === 'pending' ? 'بانتظار التفعيل' : 'معطل'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-2.5">
                  <span className="text-stone-400 font-medium">المعرف التعريفي (Slug)</span>
                  <span className="text-stone-700 font-mono text-xs">{selectedStore.slug || selectedStore.id}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-2.5">
                  <span className="text-stone-400 font-medium">مسؤول المتجر</span>
                  <span className="text-stone-700 font-bold">{selectedStore.ownerName}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-2.5">
                  <span className="text-stone-400 font-medium">البريد الإلكتروني</span>
                  <span className="text-stone-700 font-mono text-xs">{selectedStore.ownerEmail}</span>
                </div>
                {selectedStore.ownerPhone && (
                  <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-2.5">
                    <span className="text-stone-400 font-medium">رقم الجوال</span>
                    <span className="text-stone-700 font-mono text-xs" dir="ltr">{selectedStore.ownerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm pb-1">
                  <span className="text-stone-400 font-medium">تاريخ التسجيل</span>
                  <span className="text-stone-700 text-xs font-mono">{selectedStore.createdAt}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="admin-btn-toggle-status"
                  onClick={() => {
                    onToggleStoreStatus(selectedStore.id);
                    setSelectedStore({
                      ...selectedStore,
                      status: selectedStore.status === 'active' ? 'disabled' : 'active'
                    });
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    selectedStore.status === 'active'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{selectedStore.status === 'active' ? 'تعطيل حساب المتجر' : 'تفعيل حساب المتجر'}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-stone-900 tracking-wide">مؤشرات أداء ومعالجة الطلبات</h3>
              
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
                  <p className="text-2xl font-bold font-mono text-rose-600 mt-1">{selectedStore.stats.escalatedCount}</p>
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

              <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-teal-900">جاهزية بوابة العميل الخاصة بالمتجر</h4>
                  <p className="text-xs text-teal-800/80 mt-1 leading-relaxed">
                    تم التحقق من ربط مساحة العميل بنجاح. يمكن للمشترين الآن استخدام بوابة حلّها الخاصة بهذا المتجر لرفع طلبات الاستبدال والاسترجاع فوراً.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'dashboard' ? (
        /* Executive Dashboard view */
        <div className="space-y-6">
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
                <span>{activeStores} متجر بحالة نشطة</span>
              </div>
            </div>

            <div className="premium-card p-5 smooth-shadow">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">المتاجر بانتظار التفعيل</span>
                <span className="p-2 bg-stone-50 rounded-lg text-stone-600 border border-stone-100"><Activity className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-amber-600 mt-2">{pendingStores}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-2 font-medium">
                <span>تحتاج مراجعة سريعة للمالكين</span>
              </div>
            </div>

            <div className="premium-card p-5 smooth-shadow">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">إجمالي الحالات المعالجة</span>
                <span className="p-2 bg-stone-50 rounded-lg text-stone-600 border border-stone-100"><Activity className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-stone-900 mt-2">{totalProcessedRequests}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-teal-600 mt-2 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>إرجاع واستبدال مؤتمت بالكامل</span>
              </div>
            </div>

            <div className="premium-card p-5 smooth-shadow">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">متوسط رضا العملاء</span>
                <span className="p-2 bg-stone-50 rounded-lg text-stone-600 border border-stone-100"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-emerald-600 mt-2">{avgSatisfaction}%</p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 mt-2 font-medium">
                <span>تخطي مستهدف الـ ٩٠٪ المعتمد</span>
              </div>
            </div>
          </div>

          <div className="premium-card p-6 smooth-shadow space-y-4">
            <h3 className="text-sm font-bold text-stone-950">نظام إدارة ومتابعة منصة حلّها (MVP)</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              تعمل لوحة التحكم هذه كمركز متكامل لمتابعة المتاجر المنضمة إلى حلّها وتسهيل تسجيلهم. بصفتك مديراً للمنصة، يمكنك إدارة المتاجر الفعالة، والتحقق من حالة ملاكها، وإنشاء متاجر جديدة فوراً لتوليد بوابات الدعم المخصصة للتعويضات والارتجاع العكسي.
            </p>
          </div>
        </div>
      ) : activeTab === 'stores' ? (
        /* Stores List view */
        <div className="premium-card smooth-shadow overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">سجل حسابات المتاجر الشريكة</h3>
            <span className="text-xs text-stone-500">مجموع المتاجر: {totalStores}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 border-b border-stone-200/50 text-stone-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">المتجر وعنوان الويب</th>
                  <th className="px-6 py-4">المالك وجهة الاتصال</th>
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
                      <p className="text-stone-800 font-bold">{store.ownerName}</p>
                      <p className="text-[11px] text-stone-400 font-mono mt-0.5">{store.ownerEmail}</p>
                      {store.ownerPhone && (
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5" dir="ltr">{store.ownerPhone}</p>
                      )}
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
                          : store.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/30'
                            : 'bg-stone-100 text-stone-500 border border-stone-200/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          store.status === 'active' ? 'bg-emerald-600' : store.status === 'pending' ? 'bg-amber-500' : 'bg-stone-400'
                        }`}></span>
                        <span>{store.status === 'active' ? 'نشط' : store.status === 'pending' ? 'معلق' : 'معطل'}</span>
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
        <div className="max-w-xl mx-auto">
          {createdUrls ? (
            /* Post-creation URLs Display Screen */
            <div className="premium-card p-6 md:p-8 smooth-shadow space-y-6 border-2 border-emerald-100 bg-[#fdfdfb]">
              <div className="text-center space-y-2">
                <span className="text-4xl">🎉</span>
                <h3 className="text-lg font-bold text-emerald-950">تم إنشاء متجر "{createdUrls.storeName}" بنجاح!</h3>
                <p className="text-xs text-stone-500">تم توليد روابط التهيئة وبوابة العملاء للمتجر في حلّها.</p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Customer Portal Link card */}
                <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>رابط بوابة إرجاع العملاء (Customer Portal)</span>
                    </span>
                    <button
                      id="copy-portal-btn"
                      onClick={() => copyToClipboard(createdUrls.customerPortalUrl, 'portal')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 ${
                        copiedPortal 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {copiedPortal ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPortal ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono text-stone-800 break-all select-all text-left" dir="ltr">
                    {createdUrls.customerPortalUrl}
                  </p>
                </div>

                {/* Activation link card */}
                <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>رابط تنشيط حساب التاجر (Activation Link)</span>
                    </span>
                    <button
                      id="copy-activation-btn"
                      onClick={() => copyToClipboard(createdUrls.activationUrl, 'activation')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 ${
                        copiedActivation 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {copiedActivation ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedActivation ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono text-stone-800 break-all select-all text-left" dir="ltr">
                    {createdUrls.activationUrl}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  id="btn-create-another-store"
                  onClick={() => setCreatedUrls(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all border border-stone-200"
                >
                  ربط متجر آخر
                </button>
                <button
                  id="btn-go-stores"
                  onClick={() => {
                    setCreatedUrls(null);
                    setActiveTab('stores');
                  }}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  الانتقال لقائمة المتاجر
                </button>
              </div>
            </div>
          ) : (
            /* Standard creation form */
            <div className="premium-card p-6 md:p-8 smooth-shadow">
              <div className="border-b border-stone-100 pb-4 mb-6">
                <h3 className="text-base font-bold text-stone-900">ربط وتفعيل متجر إلكتروني جديد (MVP)</h3>
                <p className="text-xs text-stone-500 mt-1">إنشاء مساحة معزولة جديدة وتوليد روابط بوابة الدعم الفني بشكل فوري.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">اسم المتجر التجاري</label>
                    <div className="relative">
                      <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-mono"><StoreIcon className="w-4 h-4" /></span>
                      <input
                        id="form-store-name"
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="مثال: سلة العطور الراقية"
                        className="w-full pr-10 pl-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">أيقونة مميزة</label>
                    <select
                      id="form-store-logo"
                      value={storeLogo}
                      onChange={(e) => setStoreLogo(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8]"
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
                  <label className="block text-xs font-bold text-stone-700 mb-1">المعرف التعريفي للمتجر (Slug)</label>
                  <div className="relative">
                    <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-mono"><Globe className="w-4 h-4" /></span>
                    <input
                      id="form-store-slug"
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="مثال: elite-perfumes"
                      className="w-full pr-10 pl-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8] text-right"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">اسم مالك المتجر</label>
                    <div className="relative">
                      <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-mono"><User className="w-4 h-4" /></span>
                      <input
                        id="form-owner-name"
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="خالد بن يوسف"
                        className="w-full pr-10 pl-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني للمالك</label>
                    <div className="relative">
                      <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-mono"><Mail className="w-4 h-4" /></span>
                      <input
                        id="form-owner-email"
                        type="email"
                        required
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="admin@perfume.sa"
                        className="w-full pr-10 pl-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8] text-right"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">رقم جوال المالك</label>
                    <div className="relative">
                      <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-mono"><Phone className="w-4 h-4" /></span>
                      <input
                        id="form-owner-phone"
                        type="text"
                        required
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="0501234567"
                        className="w-full pr-10 pl-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8] text-right"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">حالة الحساب المبدئية</label>
                    <select
                      id="form-store-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'pending' | 'active' | 'disabled')}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8]"
                    >
                      <option value="pending">معلق (Pending)</option>
                      <option value="active">نشط ومفعل (Active)</option>
                      <option value="disabled">معطل (Disabled)</option>
                    </select>
                  </div>
                </div>

                <button
                  id="form-btn-submit"
                  type="submit"
                  className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 rounded-xl text-xs font-bold mt-4 flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>ربط وإنتاج روابط المتجر فوراً</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
