/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Store, CustomerRequest, RequestType, RequestStatus } from '../types';
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
  Plus,
  Lock,
  RefreshCw,
  EyeOff,
  Link as LinkIcon
} from 'lucide-react';

interface AdminPanelProps {
  stores: Store[];
  requests: CustomerRequest[];
  onCreateStore: (newStore: Omit<Store, 'createdAt' | 'requestsCount'>) => void;
  onToggleStoreStatus: (storeId: string) => void;
  lang: 'ar' | 'en';
}

export default function AdminPanel({
  stores,
  requests,
  onCreateStore,
  onToggleStoreStatus,
  lang,
}: AdminPanelProps) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('admin@halha.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'stores' | 'create_store'>('dashboard');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Form states for creating store
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [status, setStatus] = useState<'pending' | 'active' | 'disabled'>('active');

  // Success screen state after creation
  const [createdUrls, setCreatedUrls] = useState<{
    customerPortalUrl: string;
    activationUrl: string;
    storeName: string;
  } | null>(null);

  const [copiedPortal, setCopiedPortal] = useState(false);
  const [copiedActivation, setCopiedActivation] = useState(false);
  const [copiedDetailActivation, setCopiedDetailActivation] = useState(false);

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin@halha.com' && adminPassword === 'admin123') {
      setIsAdminLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !slug || !ownerName || !ownerEmail || !ownerPhone) return;

    // Clean slug
    const cleanedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    const newStoreId = `store-${Date.now()}`;

    const host = window.location.origin;
    const portalUrl = `${host}/store/${cleanedSlug}`;
    const actUrl = `${host}/activate?token=token-${cleanedSlug}`;

    onCreateStore({
      id: newStoreId,
      name: storeName,
      slug: cleanedSlug,
      status: status,
      ownerName,
      ownerEmail,
      ownerPhone,
      customerPortalUrl: portalUrl,
      activationUrl: actUrl,
    });

    setCreatedUrls({
      customerPortalUrl: portalUrl,
      activationUrl: actUrl,
      storeName: storeName,
    });

    // Reset Form fields
    setStoreName('');
    setSlug('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPhone('');
    setStatus('active');
  };

  const copyToClipboard = (text: string, type: 'portal' | 'activation' | 'detail_activation') => {
    navigator.clipboard.writeText(text);
    if (type === 'portal') {
      setCopiedPortal(true);
      setTimeout(() => setCopiedPortal(false), 2000);
    } else if (type === 'activation') {
      setCopiedActivation(true);
      setTimeout(() => setCopiedActivation(false), 2000);
    } else {
      setCopiedDetailActivation(true);
      setTimeout(() => setCopiedDetailActivation(false), 2000);
    }
  };

  // Stats calculation
  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === 'active').length;
  const pendingStores = stores.filter(s => s.status === 'pending').length;
  const disabledStores = stores.filter(s => s.status === 'disabled').length;
  
  const totalRequestsCount = requests.length;
  const thisMonthRequestsCount = requests.filter(r => r.createdAt && r.createdAt.includes('2026-06')).length;

  // Requests by Type
  const returnsCount = requests.filter(r => r.type === 'return').length;
  const exchangesCount = requests.filter(r => r.type === 'exchange').length;
  const complaintsCount = requests.filter(r => r.type === 'complaint').length;

  // Requests by Status
  const statusCounts = {
    new: requests.filter(r => r.status === 'new').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
    waiting_customer_info: requests.filter(r => r.status === 'waiting_customer_info').length,
    escalated_to_owner: requests.filter(r => r.status === 'escalated_to_owner').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    received: requests.filter(r => r.status === 'received').length,
    completed: requests.filter(r => r.status === 'completed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  // Regeneration of Activation Link
  const handleRegenerateActivationLink = (store: Store) => {
    const newToken = `token-regen-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLink = `${window.location.origin}/activate?token=${newToken}`;
    store.activationUrl = newLink;
    setSelectedStore({ ...store });
    alert('تم إعادة توليد رابط التفعيل للمتجر بنجاح!');
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-600">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">دخول مدير المنصة (Platform Admin)</h2>
            <p className="text-xs text-stone-500">لوحة إدارة النظام العام لموقع حلّها</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">اسم المستخدم / البريد</label>
              <input
                type="email"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8]"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100 font-bold">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              تسجيل الدخول للنظام
            </button>
          </form>

          <p className="text-center text-[10px] text-stone-400 font-mono">حساب تجريبي افتراضي: admin@halha.com / admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/50">
            إدارة المنصة الشاملة (حلّها MVP Admin)
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 mt-1">
            لوحة تحكّم النظام الرئيسيّة
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            إدارة المتاجر المسجلة، توليد بوابات التفعيل ومراقبة حجم الطلبات العام.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200/50 self-stretch md:self-auto">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedStore(null); setCreatedUrls(null); }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard' && !selectedStore
                ? 'bg-white text-stone-950 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>الإحصائيات العامة</span>
          </button>
          <button
            onClick={() => { setActiveTab('stores'); setSelectedStore(null); setCreatedUrls(null); }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'stores' && !selectedStore
                ? 'bg-white text-stone-950 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>قائمة المتاجر ({totalStores})</span>
          </button>
          <button
            onClick={() => { setActiveTab('create_store'); setSelectedStore(null); setCreatedUrls(null); }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'create_store' && !selectedStore
                ? 'bg-white text-stone-950 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إنشاء متجر جديد</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedStore ? (
        /* Store details sub-view */
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedStore(null)}
            className="text-stone-500 hover:text-stone-900 text-xs font-medium flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-200/40 w-fit transition-all"
          >
            <span>&rarr; العودة لقائمة المتاجر</span>
          </button>

          <div className="bg-white p-6 md:p-8 border border-stone-200 rounded-2xl shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Store details and Status */}
            <div className="lg:col-span-1 space-y-6 border-l border-stone-100 pl-0 lg:pl-8">
              <div className="flex items-center gap-4">
                <span className="text-3xl bg-stone-50 p-3.5 rounded-2xl border border-stone-200/50">🛍️</span>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">{selectedStore.name}</h2>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">/{selectedStore.slug}</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-4">
                <h3 className="text-xs font-bold text-stone-400 tracking-wide uppercase border-b border-stone-100 pb-1.5">بيانات المتجر الأساسية</h3>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">حالة المتجر في المنصة</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    selectedStore.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : selectedStore.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>
                    {selectedStore.status === 'active' ? 'نشط ومفعّل' : selectedStore.status === 'pending' ? 'بانتظار التفعيل' : 'معطل'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">رابط صفحة العملاء</span>
                  <a href={selectedStore.customerPortalUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline font-mono">
                    {selectedStore.slug}
                  </a>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">تاريخ التسجيل بالمنصة</span>
                  <span className="text-stone-700 font-mono">{selectedStore.createdAt}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">إجمالي طلبات المتجر</span>
                  <span className="text-stone-700 font-bold font-mono">{selectedStore.requestsCount} طلب</span>
                </div>
              </div>

              <div className="space-y-3.5 pt-4">
                <h3 className="text-xs font-bold text-stone-400 tracking-wide uppercase border-b border-stone-100 pb-1.5">بيانات صاحب المتجر</h3>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">الاسم الكامل</span>
                  <span className="text-stone-800 font-bold">{selectedStore.ownerName}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">البريد الإلكتروني</span>
                  <span className="text-stone-800 font-mono">{selectedStore.ownerEmail}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">رقم الجوال</span>
                  <span className="text-stone-800 font-mono" dir="ltr">{selectedStore.ownerPhone}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">حالة حساب المالك</span>
                  <span className="text-stone-800 font-bold">
                    {selectedStore.status === 'pending' ? 'معلّق بانتظار التفعيل' : 'مفعّل ونشط'}
                  </span>
                </div>
              </div>

              {/* Action toggles */}
              <div className="pt-6 border-t border-stone-100 space-y-3">
                <button
                  onClick={() => {
                    onToggleStoreStatus(selectedStore.id);
                    setSelectedStore({
                      ...selectedStore,
                      status: selectedStore.status === 'active' ? 'disabled' : 'active'
                    });
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
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

            {/* Links, activation, actions details */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">روابط التهيئة والتنشيط الخاصة بالمتجر</h3>

              <div className="space-y-4">
                <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4 text-teal-600" />
                      <span>رابط بوابة العملاء المخصصة (Customer Portal URL)</span>
                    </span>
                  </div>
                  <p className="text-xs font-mono text-stone-800 bg-white p-2 border border-stone-200 rounded-lg text-left" dir="ltr">
                    {selectedStore.customerPortalUrl}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>رابط تنشيط حساب المالك وتعيين كلمة المرور</span>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(selectedStore.activationUrl, 'detail_activation')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                          copiedDetailActivation 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {copiedDetailActivation ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDetailActivation ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                      </button>

                      <button
                        onClick={() => handleRegenerateActivationLink(selectedStore)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>إعادة توليد رابط التفعيل</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-stone-800 bg-white p-2 border border-stone-200 rounded-lg text-left" dir="ltr">
                    {selectedStore.activationUrl}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">تعليمات تفعيل المتاجر</h4>
                  <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                    عند مشاركة رابط التنشيط مع المالك، سيتمكن من إدخال اسم المستخدم، واسم متجره، وتعيين كلمة مرور آمنة لتشغيل حساب متجره والوصول إلى لوحة المالك المباشرة (Merchant Dashboard).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'dashboard' ? (
        /* Platform Executive Dashboard */
        <div className="space-y-8">
          {/* Top Summary KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">إجمالي المتاجر المربوطة</span>
                <span className="p-2 bg-stone-50 rounded-lg text-stone-600 border border-stone-100"><StoreIcon className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-stone-900 mt-2">{totalStores}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 mt-2 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>{activeStores} متجر بحالة نشطة</span>
              </div>
            </div>

            <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">متاجر بانتظار التفعيل</span>
                <span className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100"><Activity className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-amber-600 mt-2">{pendingStores}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-2 font-medium">
                <span>روابط التهيئة مرسلة وبانتظار المالك</span>
              </div>
            </div>

            <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">المتاجر المعطلة</span>
                <span className="p-2 bg-rose-50 rounded-lg text-rose-600 border border-rose-100"><XCircle className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-rose-600 mt-2">{disabledStores}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-2 font-medium">
                <span>تم إيقاف تداولها مؤقتاً</span>
              </div>
            </div>

            <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs font-medium">إجمالي طلبات الاسترجاع والشكاوى</span>
                <span className="p-2 bg-stone-50 rounded-lg text-stone-600 border border-stone-100"><Activity className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-bold font-mono text-stone-900 mt-2">{totalRequestsCount}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-teal-600 mt-2 font-medium">
                <span>{thisMonthRequestsCount} طلباً مسجلاً هذا الشهر</span>
              </div>
            </div>
          </div>

          {/* Type and Status charts & statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Requests by Type & Status list */}
            <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs lg:col-span-1 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide border-b border-stone-100 pb-1.5">الطلبات حسب النوع</h3>
                <div className="space-y-2.5 pt-3">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-stone-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span>طلبات الاسترجاع (Return)</span>
                    </span>
                    <span className="font-mono text-stone-900 font-bold">{returnsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-stone-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <span>طلبات الاستبدال (Exchange)</span>
                    </span>
                    <span className="font-mono text-stone-900 font-bold">{exchangesCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-stone-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>الشكاوى والبلاغات (Complaint)</span>
                    </span>
                    <span className="font-mono text-stone-900 font-bold">{complaintsCount}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide border-b border-stone-100 pb-1.5">الطلبات حسب الحالة</h3>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg text-center">
                    <p className="text-[10px] text-stone-400">جديد</p>
                    <p className="text-sm font-bold text-stone-900 font-mono">{statusCounts.new}</p>
                  </div>
                  <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg text-center">
                    <p className="text-[10px] text-stone-400">قيد المراجعة</p>
                    <p className="text-sm font-bold text-stone-900 font-mono">{statusCounts.under_review}</p>
                  </div>
                  <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg text-center">
                    <p className="text-[10px] text-stone-400">طلب معلومات</p>
                    <p className="text-sm font-bold text-stone-900 font-mono">{statusCounts.waiting_customer_info}</p>
                  </div>
                  <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg text-center">
                    <p className="text-[10px] text-stone-400">مصعّد للمالك</p>
                    <p className="text-sm font-bold text-rose-600 font-mono">{statusCounts.escalated_to_owner}</p>
                  </div>
                  <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg text-center">
                    <p className="text-[10px] text-stone-400">مقبول</p>
                    <p className="text-sm font-bold text-teal-600 font-mono">{statusCounts.approved}</p>
                  </div>
                  <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg text-center">
                    <p className="text-[10px] text-stone-400">مستلم بالمستودع</p>
                    <p className="text-sm font-bold text-stone-900 font-mono">{statusCounts.received}</p>
                  </div>
                  <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg text-center">
                    <p className="text-[10px] text-stone-400">مكتمل</p>
                    <p className="text-sm font-bold text-emerald-600 font-mono">{statusCounts.completed}</p>
                  </div>
                  <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg text-center">
                    <p className="text-[10px] text-stone-400">مرفوض / ملغى</p>
                    <p className="text-sm font-bold text-stone-500 font-mono">{statusCounts.rejected + statusCounts.cancelled}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recently added stores & recent requests list */}
            <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide border-b border-stone-100 pb-2">آخر المتاجر المضافة</h3>
                <div className="divide-y divide-stone-100 font-medium">
                  {stores.slice(0, 3).map((store) => (
                    <div key={store.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl bg-stone-50 p-2 rounded-xl border border-stone-200/50">🛍️</span>
                        <div>
                          <p className="text-xs font-bold text-stone-900">{store.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono">/{store.slug}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        store.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {store.status === 'active' ? 'نشط' : store.status === 'pending' ? 'بانتظار التفعيل' : 'معطل'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide border-b border-stone-100 pb-2">آخر طلبات التعويض والشكاوى</h3>
                <div className="divide-y divide-stone-100 font-medium">
                  {requests.slice(0, 4).map((req) => (
                    <div key={req.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-stone-900 font-mono">{req.id}</span>
                          <span className="text-stone-300 text-[10px]">&bull;</span>
                          <span className="text-[10px] text-stone-500">{req.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-stone-400">{req.storeName}</span>
                          <span className="text-stone-300 text-[9px]">&bull;</span>
                          <span className="text-[9px] font-bold text-teal-700">
                            {req.type === 'return' ? 'استرجاع' : req.type === 'exchange' ? 'استبدال' : 'شكوى'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-stone-800 font-mono bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-md">
                        {req.status === 'new' ? 'جديد' : req.status === 'under_review' ? 'قيد المراجعة' : req.status === 'escalated_to_owner' ? 'مصعّد للمالك' : 'معالج'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'stores' ? (
        /* Stores List */
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-900">سجل حسابات المتاجر الشريكة في حلّها</h3>
            <span className="text-xs text-stone-500">مجموع المتاجر: {totalStores}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 border-b border-stone-200/50 text-stone-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">المتجر والمعرف (Slug)</th>
                  <th className="px-6 py-4">المالك وبيانات الاتصال</th>
                  <th className="px-6 py-4">الطلبات المسجلة</th>
                  <th className="px-6 py-4">تاريخ التسجيل</th>
                  <th className="px-6 py-4">حالة الربط</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-stone-50/70 transition-all">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl bg-stone-100 p-2 rounded-xl border border-stone-200/40">🛍️</span>
                        <div>
                          <p className="font-bold text-stone-900">{store.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono mt-0.5">/{store.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="text-stone-800 font-bold">{store.ownerName}</p>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">{store.ownerEmail}</p>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5" dir="ltr">{store.ownerPhone}</p>
                    </td>
                    <td className="px-6 py-4.5 font-mono text-stone-900 text-sm">
                      {store.requestsCount} طلب
                    </td>
                    <td className="px-6 py-4.5 font-mono text-stone-500">
                      {store.createdAt}
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
                          className="p-1.5 text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200/40 transition-all cursor-pointer"
                          title="عرض التفاصيل والأداء"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleStoreStatus(store.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            store.status === 'active'
                              ? 'text-rose-600 hover:text-rose-950 bg-rose-50 border-rose-100 hover:bg-rose-100'
                              : 'text-emerald-600 hover:text-emerald-950 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
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
        /* Create Store Form */
        <div className="max-w-xl mx-auto">
          {createdUrls ? (
            /* Post-creation URLs Display Screen */
            <div className="bg-white p-6 md:p-8 border-2 border-emerald-100 rounded-2xl shadow-xs space-y-6 bg-[#fdfdfb]">
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
                      onClick={() => copyToClipboard(createdUrls.customerPortalUrl, 'portal')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
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
                      onClick={() => copyToClipboard(createdUrls.activationUrl, 'activation')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
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
                  onClick={() => setCreatedUrls(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all border border-stone-200 cursor-pointer"
                >
                  ربط متجر آخر
                </button>
                <button
                  onClick={() => {
                    setCreatedUrls(null);
                    setActiveTab('stores');
                  }}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  الانتقال لقائمة المتاجر
                </button>
              </div>
            </div>
          ) : (
            /* Standard creation form */
            <div className="bg-white p-6 md:p-8 border border-stone-200 rounded-2xl shadow-xs">
              <div className="border-b border-stone-100 pb-4 mb-6">
                <h3 className="text-base font-bold text-stone-900">ربط وتفعيل متجر إلكتروني جديد (MVP)</h3>
                <p className="text-xs text-stone-500 mt-1">إنشاء مساحة معزولة جديدة وتوليد روابط بوابة الدعم الفني بشكل فوري.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">اسم المتجر التجاري</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="مثال: سلة العطور الراقية"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">المعرف التعريفي للمتجر (Slug)</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="مثال: elite-perfumes"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8] text-right"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">اسم مالك المتجر</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="خالد بن يوسف"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني للمالك</label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="admin@perfume.sa"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8] text-right"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">رقم جوال المالك</label>
                    <input
                      type="text"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="0501234567"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8] text-right"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">حالة الحساب المبدئية</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'pending' | 'active' | 'disabled')}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8]"
                    >
                      <option value="pending">معلق (Pending)</option>
                      <option value="active">نشط ومفعل (Active)</option>
                      <option value="disabled">معطل (Disabled)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-xs font-bold mt-4 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
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
