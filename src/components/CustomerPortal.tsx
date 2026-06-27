/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CustomerRequest, RequestType, RequestItem, RequestStatus } from '../types';
import {
  Smartphone,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Package,
  UploadCloud,
  FileText,
  CreditCard,
  RefreshCw,
  Search,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface CustomerPortalProps {
  requests: CustomerRequest[];
  onSubmitNewRequest: (newRequest: CustomerRequest) => void;
}

export default function CustomerPortal({
  requests,
  onSubmitNewRequest,
}: CustomerPortalProps) {
  // Mobile Navigation Screen
  const [screen, setScreen] = useState<'landing' | 'verify' | 'select_type' | 'form' | 'success' | 'track'>('landing');
  
  // Input fields
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [requestType, setRequestType] = useState<RequestType>('return');
  
  // Tracking search
  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<CustomerRequest | null>(null);

  // Form states
  const [selectedItemName, setSelectedItemName] = useState('بن قهوة مختصة - هيرلوم إثيوبي مغسول (٢٥٠ غرام)');
  const [selectedItemPrice, setSelectedItemPrice] = useState(68);
  const [returnReason, setReturnReason] = useState('البن منسكب ومكشوف داخل صندوق التوصيل الكرتوني عند استلامه.');
  const [iban, setIban] = useState('SA');
  const [sizeDesired, setSizeDesired] = useState('56');

  // Completed tracking id
  const [justSubmittedId, setJustSubmittedId] = useState('');

  // Handle Verify Order
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phoneNumber) return;
    
    // Simulate finding order items
    if (orderNumber.toUpperCase().includes('89211')) {
      setSelectedItemName('مطحنة بن يدوية سيراميك احترافية');
      setSelectedItemPrice(185);
      setReturnReason('أرغب باستبدالها بموديل كهربائي مع دفع الفارق.');
    } else if (orderNumber.toUpperCase().includes('76110')) {
      setSelectedItemName('عباية كتان سوداء كلاسيكية - مقاس ٥٤');
      setSelectedItemPrice(320);
      setReturnReason('المقاس ضيق جداً في الأكمام، أرغب باستبدالها بمقاس ٥٦.');
    } else {
      setSelectedItemName('بن قهوة مختصة - هيرلوم إثيوبي مغسول (٢٥٠ غرام)');
      setSelectedItemPrice(68);
    }
    
    setScreen('select_type');
  };

  // Submit flow
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const generatedId = `HAL-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newReqItem: RequestItem = {
      id: `item-${Date.now()}`,
      name: selectedItemName,
      sku: 'SKU-' + Math.floor(10000 + Math.random() * 90000),
      price: selectedItemPrice,
      quantity: 1,
      reason: returnReason,
    };

    const newRequest: CustomerRequest = {
      id: generatedId,
      storeId: 'store-1',
      storeName: 'نجد للقهوة المختصة',
      orderNumber: orderNumber || 'ORD-98432',
      customerName: 'ضيف المتجر الكريم',
      customerPhone: phoneNumber || '966500000000',
      customerEmail: 'customer@test.sa',
      customerIBAN: requestType === 'return' ? iban : undefined,
      type: requestType,
      items: [newReqItem],
      status: 'pending_support',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `ev-${Date.now()}`,
          status: 'created',
          titleAr: 'تقديم الطلب عبر البوابة',
          descriptionAr: `تم استقبال طلب ${requestType === 'return' ? 'الاسترجاع المالي للسلعة' : 'الاستبدال'} وتوليد رقم التتبع بنجاح.`,
          createdAt: new Date().toISOString(),
          actorName: 'العميل',
          isInternal: false,
        }
      ]
    };

    onSubmitNewRequest(newRequest);
    setJustSubmittedId(generatedId);
    setScreen('success');
  };

  // Customer tracking search
  const handleTrackSearch = (id: string) => {
    const found = requests.find(r => r.id.toLowerCase() === id.trim().toLowerCase());
    if (found) {
      setTrackedRequest(found);
    } else {
      setTrackedRequest(null);
    }
  };

  // Convert merchant-centric statuses to friendly localized statuses for consumers
  const getCustomerFriendlyStatus = (status: RequestStatus) => {
    switch (status) {
      case 'pending_support':
        return 'طلبك قيد المراجعة والتدقيق من إدارة المتجر';
      case 'escalated_owner':
        return 'طلبك قيد المراجعة من إدارة المتجر'; // SECURITY EXCLUSION: customers NEVER see internal escalation
      case 'pending_warehouse':
        return 'بانتظار شحن/وصول المنتج التالف للمستودع';
      case 'warehouse_inspected':
        return 'تم فحص السلعة في المستودع وقبول التوصية';
      case 'resolved_approved':
        return 'تم قبول الطلب وتحويل المستحقات البنكية بنجاح';
      case 'resolved_rejected':
        return 'تم إغلاق الطلب ومراجعة الملحوظات مع العميل';
    }
  };

  return (
    <div className="flex justify-center items-center py-6 min-h-[85vh] bg-stone-100/50">
      {/* Visual mockup of iPhone device */}
      <div className="relative mx-auto w-full max-w-[390px] h-[780px] bg-[#1c1917] rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-[12px] border-[#292524] overflow-hidden flex flex-col">
        {/* Notch / Speaker Earbar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[26px] w-[140px] bg-[#1c1917] rounded-b-2xl z-50 flex items-end justify-center pb-1">
          <div className="w-12 h-1 bg-stone-800 rounded-full"></div>
        </div>

        {/* Mobile Phone Screen Content Canvas */}
        <div className="flex-1 bg-[#faf8f5] text-stone-900 rounded-[38px] overflow-y-auto px-5 pt-8 pb-10 flex flex-col relative">
          
          {/* iOS-Style Mobile Status Bar */}
          <div className="flex justify-between items-center text-[11px] text-stone-400 font-semibold mb-4 px-2 select-none">
            <span className="font-mono">9:41 ص</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-stone-300 rounded-sm p-0.5 flex items-center">
                <div className="w-3.5 h-1.5 bg-stone-500 rounded-xs"></div>
              </div>
            </div>
          </div>

          {/* Branded Store Header in Portal */}
          <div className="flex items-center justify-between border-b border-stone-200/50 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">☕</span>
              <div>
                <h1 className="text-xs font-bold text-stone-900">نجد للقهوة المختصة</h1>
                <p className="text-[10px] text-stone-400">مركز الضمان والاسترجاع الذكي</p>
              </div>
            </div>
            
            {screen !== 'landing' && (
              <button
                onClick={() => {
                  if (screen === 'track') setTrackedRequest(null);
                  setScreen('landing');
                }}
                className="text-[11px] font-bold text-teal-700 flex items-center gap-0.5 bg-teal-50 px-2 py-1 rounded"
              >
                <span>الرئيسية</span>
              </button>
            )}
          </div>

          {/* SCREEN: LANDING */}
          {screen === 'landing' && (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="bg-teal-900 text-white p-5 rounded-2xl smooth-shadow space-y-1">
                  <h2 className="text-sm font-bold">نهتم بتجربتك دوماً!</h2>
                  <p className="text-[11px] text-teal-100 leading-relaxed">أهلاً بك في البوابة الفورية لتعويض المنتجات. نسعد بحل أي مشكلة واجهت طلبك بكل سلاسة وفي خطوات بسيطة.</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">خيارات البوابة المتاحة</h3>
                  
                  {/* Option 1: Start Return/Exchange */}
                  <button
                    onClick={() => setScreen('verify')}
                    className="w-full text-right p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200/50 smooth-shadow flex items-center justify-between group transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-stone-900">بدء طلب استرجاع أو استبدال جديد</p>
                      <p className="text-[10px] text-stone-400">تحتاج فقط رقم طلب الشراء وجوالك</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-teal-700 group-hover:-translate-x-1 transition-transform" />
                  </button>

                  {/* Option 2: Track Existing */}
                  <button
                    onClick={() => {
                      setScreen('track');
                      setTrackIdInput('');
                      setTrackedRequest(null);
                    }}
                    className="w-full text-right p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200/50 smooth-shadow flex items-center justify-between group transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-stone-900">تتبّع حالة طلب مرتجع قائم</p>
                      <p className="text-[10px] text-stone-400">أدخل رقم تتبع حلّها (HAL-xxxx) لمشاهدة الموقف</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-teal-700 group-hover:-translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Policy Quick Box */}
              <div className="bg-stone-50 border border-stone-200/40 p-3.5 rounded-2xl space-y-1 text-xs">
                <span className="font-bold text-stone-800 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>سياسة استرجاع نجد للقهوة</span>
                </span>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  نقبل استرجاع البن والمطاحن السليمة خلال ١٥ يوماً من استلام الشحنة. يتحمل المتجر كافة تكاليف الشحن العكسي للعميل في حال وجود عيب مصنعي أو كسر في السلعة.
                </p>
              </div>
            </div>
          )}

          {/* SCREEN: VERIFY ORDER */}
          {screen === 'verify' && (
            <form onSubmit={handleVerify} className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-stone-900">التحقق من الفاتورة وطلب الشراء</h2>
                  <p className="text-[10px] text-stone-400 mt-1">يُرجى كتابة البيانات المسجلة بفاتورة المتجر الإلكتروني للبدء.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">رقم طلب الشراء الأصلي</label>
                    <input
                      type="text"
                      required
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="مثال: ORD-89432 أو 76110"
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                      dir="ltr"
                    />
                    <p className="text-[9px] text-stone-400 mt-1">أدخل <span className="font-bold">ORD-89432</span> أو <span className="font-bold">76110</span> لتجربة بيانات مسبقة جاهزة.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">رقم الجوال المسجل بالطلب</label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="96650xxxxxxxx"
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-xs font-bold shadow-xs mt-6"
              >
                التحقق وجلب محتويات السلّة &rarr;
              </button>
            </form>
          )}

          {/* SCREEN: SELECT TYPE */}
          {screen === 'select_type' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-stone-900">ما نوع التعويض المراد تقديمه؟</h2>
                  <p className="text-[10px] text-stone-400 mt-1">اختر الإجراء الذي يناسب حالتك الحالية للمتابعة.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4">
                  {/* Option 1: Return (Refund) */}
                  <button
                    onClick={() => { setRequestType('return'); setScreen('form'); }}
                    className="p-4 text-right bg-white rounded-2xl border border-stone-200 hover:border-teal-500 hover:bg-teal-50/20 smooth-shadow flex items-start gap-3 transition-all"
                  >
                    <span className="p-2 bg-amber-50 text-amber-700 rounded-xl mt-0.5"><CreditCard className="w-4 h-4" /></span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-stone-900">استرجاع مالي وتحويل للحساب البنكي</h4>
                      <p className="text-[10px] text-stone-400">لطلب استرجاع قيمة سلعة معينة مع إعادة قيمة الطلب لحساب الآيبان البنكي الخاص بك.</p>
                    </div>
                  </button>

                  {/* Option 2: Exchange */}
                  <button
                    onClick={() => { setRequestType('exchange'); setScreen('form'); }}
                    className="p-4 text-right bg-white rounded-2xl border border-stone-200 hover:border-teal-500 hover:bg-teal-50/20 smooth-shadow flex items-start gap-3 transition-all"
                  >
                    <span className="p-2 bg-teal-50 text-teal-700 rounded-xl mt-0.5"><RefreshCw className="w-4 h-4" /></span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-stone-900">استبدال مقاس أو نوع المنتج</h4>
                      <p className="text-[10px] text-stone-400">لاستبدال مقاس عباية أو نوع ماكينة ومطحنة ببديل آخر مع تنسيق شحن القطعة البديلة.</p>
                    </div>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setScreen('verify')}
                className="text-[11px] font-bold text-stone-500 hover:text-stone-800 text-center py-2"
              >
                &larr; العودة للتحقق
              </button>
            </div>
          )}

          {/* SCREEN: FORM DETAILS */}
          {screen === 'form' && (
            <form onSubmit={handleSubmitRequest} className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-bold text-stone-900">تعبئة تفاصيل طلب التعويض</h2>
                  <p className="text-[10px] text-stone-400">المنتج المتأثر المجلوب تلقائياً من نظام الفواتير:</p>
                </div>

                {/* Scraped item mockup */}
                <div className="p-3 bg-white border border-stone-200/50 rounded-xl flex gap-3 text-xs">
                  <span className="text-2xl shrink-0 mt-1">📦</span>
                  <div>
                    <p className="font-bold text-stone-900 line-clamp-1">{selectedItemName}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">السعر: {selectedItemPrice} ر.س &bull; الكمية: ١</p>
                  </div>
                </div>

                {/* Reason field */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">وصف مبرر الاستبدال/الاسترجاع</label>
                  <textarea
                    required
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="اشرح الخلل أو سبب عدم ملاءمة المقاس لزملائنا فنيي الفحص بالمستودع..."
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-xs h-16 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>

                {/* Contextual field for Return (IBAN) */}
                {requestType === 'return' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">رقم الآيبان البنكي للتعويض المالي (IBAN)</label>
                    <input
                      type="text"
                      required
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder="SAxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                      dir="ltr"
                    />
                    <p className="text-[9px] text-stone-400 mt-1">سيتم التحويل مباشرة لهذا الحساب فور تدقيق المنتج وقبوله.</p>
                  </div>
                ) : (
                  /* Size selection for exchange */
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">المقاس أو اللون المطلوب استبداله</label>
                    <select
                      value={sizeDesired}
                      onChange={(e) => setSizeDesired(e.target.value)}
                      className="w-full px-2 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                    >
                      <option value="56">عباية كتان سوداء - مقاس ٥٦</option>
                      <option value="58">عباية كتان سوداء - مقاس ٥٨</option>
                      <option value="electric">مطحنة بن كهربائية احترافية (دفع فارق)</option>
                    </select>
                  </div>
                )}

                {/* Image Upload box */}
                <div>
                  <span className="block text-[11px] font-bold text-stone-700 mb-1">إرفاق صورة لإثبات حالة السلعة (موصى به)</span>
                  <div className="border border-dashed border-stone-300 rounded-xl p-3.5 text-center bg-white">
                    <UploadCloud className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                    <p className="text-[10px] text-stone-500">اسحب صورة السلعة التالفة هنا أو اضغط للاختيار</p>
                    <span className="text-[8px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded inline-block mt-1">تأكيد: تم إرفاق صورة الإثبات تلقائياً</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-xs font-bold shadow-xs"
              >
                تأكيد وإرسال طلب التعويض &larr;
              </button>
            </form>
          )}

          {/* SCREEN: SUCCESS PAGE */}
          {screen === 'success' && (
            <div className="flex-1 flex flex-col justify-between text-center space-y-6">
              <div className="space-y-4 pt-4">
                <span className="p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 inline-block">
                  <CheckCircle2 className="w-10 h-10" />
                </span>

                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-stone-900">تم تقديم طلبك بنجاح!</h2>
                  <p className="text-[11px] text-stone-400">رقم تتبع ومراجعة المرتجع الخاص بك:</p>
                  <p className="text-base font-bold font-mono text-teal-700 bg-teal-50 py-1 px-3 rounded-lg w-fit mx-auto border border-teal-100">{justSubmittedId}</p>
                </div>

                <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl text-right text-[11px] space-y-2 leading-relaxed text-stone-600">
                  <h4 className="font-bold text-stone-800">الخطوات التالية المتبقية:</h4>
                  <p>١. ستقوم إدارة المتجر بمراجعة صور ومبررات طلبك خلال أقل من ٢٤ ساعة.</p>
                  <p>٢. فور القبول، سنرسل بوليصة شحن مجانية لمرتجعك عبر رسالة نصية SMS.</p>
                  <p>٣. بمجرد وصول الشحنة وفحصها بالمستودع، سيتم تفعيل حوالتك البنكية فوراً.</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleTrackSearch(justSubmittedId);
                    setScreen('track');
                  }}
                  className="w-full bg-stone-900 text-white py-3 rounded-xl text-xs font-bold"
                >
                  تتبع حالة هذا الطلب الآن
                </button>
                <button
                  onClick={() => setScreen('landing')}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl text-xs font-bold"
                >
                  العودة للرئيسية
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: TRACK REQUEST PAGE */}
          {screen === 'track' && (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-stone-900">تتبع الطلبات وحالة التسويات</h2>
                  <p className="text-[10px] text-stone-400 mt-1">اكتب رقم تتبع حلّها الممنوح لك لمشاهدة الموقف الفعلي لطلبك.</p>
                </div>

                {/* Track Search input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackIdInput}
                    onChange={(e) => setTrackIdInput(e.target.value)}
                    placeholder="مثال: HAL-1024"
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none bg-white text-right"
                    dir="ltr"
                  />
                  <button
                    onClick={() => handleTrackSearch(trackIdInput)}
                    className="bg-teal-600 text-white px-3.5 rounded-xl text-xs font-bold flex items-center justify-center"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-stone-200/50">
                  {trackedRequest ? (
                    <div className="space-y-4">
                      {/* Customer info header */}
                      <div className="bg-white p-3.5 border border-stone-200/50 rounded-2xl smooth-shadow space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-teal-800">{trackedRequest.id}</span>
                          <span className="text-[10px] text-stone-400 font-mono">{trackedRequest.createdAt.split('T')[0]}</span>
                        </div>
                        <p className="text-stone-700">مرحلة طلب التعويض الحالية:</p>
                        <span className="block font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 text-center text-[11px] leading-relaxed">
                          {getCustomerFriendlyStatus(trackedRequest.status)}
                        </span>
                        
                        {trackedRequest.status === 'resolved_approved' && (
                          <div className="p-2 bg-emerald-50 text-emerald-800 text-[10px] rounded leading-relaxed border border-emerald-100 text-center font-bold">
                            🎉 تهانينا! تم تحويل المبلغ البنكي وتفويض التسوية وإغلاق المعالجة بنجاح.
                          </div>
                        )}
                        {trackedRequest.status === 'resolved_rejected' && (
                          <div className="p-2 bg-stone-50 text-stone-800 text-[10px] rounded leading-relaxed border border-stone-200 text-center">
                            تم البت في طلبك وإغلاقه. يُرجى مراجعة ملحوظات القرار النهائي.
                          </div>
                        )}
                      </div>

                      {/* Customer-friendly timeline with translated milestones */}
                      <div className="space-y-3.5">
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">سجل الخطوات المكتملة لمرتجعك</h4>
                        
                        <div className="relative border-r border-stone-200 mr-3 pr-5 space-y-5">
                          {/* Step 1: Created */}
                          <div className="relative">
                            <span className="absolute -right-[24px] top-0.5 w-3 h-3 rounded-full bg-teal-600"></span>
                            <div className="text-xs">
                              <p className="font-bold text-stone-800">تلقي طلب المشتري بالنظام</p>
                              <p className="text-[10px] text-stone-500">تم تسجيل تفاصيل السلعة المرتجعة وبدء التدقيق.</p>
                            </div>
                          </div>

                          {/* Step 2: Review (pending support or escalated owner both look like 'reviewing') */}
                          {(trackedRequest.status === 'pending_support' || trackedRequest.status === 'escalated_owner') && (
                            <div className="relative">
                              <span className="absolute -right-[24px] top-0.5 w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                              <div className="text-xs">
                                <p className="font-bold text-stone-800">قيد المراجعة والتدقيق الإداري</p>
                                <p className="text-[10px] text-stone-500">يقوم ممثلو خدمة المبيعات بمطابقة طلبك مع صور الإثبات لاعتماد بوليصة المرتجع.</p>
                              </div>
                            </div>
                          )}

                          {/* Step 3: Pending Warehouse */}
                          {(trackedRequest.status === 'pending_warehouse' || trackedRequest.status === 'warehouse_inspected' || trackedRequest.status === 'resolved_approved') && (
                            <div className="relative">
                              <span className={`absolute -right-[24px] top-0.5 w-3 h-3 rounded-full ${trackedRequest.status === 'pending_warehouse' ? 'bg-amber-500 animate-pulse' : 'bg-teal-600'}`}></span>
                              <div className="text-xs">
                                <p className="font-bold text-stone-800">بانتظار وصول وفحص السلعة بالمستودع</p>
                                <p className="text-[10px] text-stone-500">تم تزويدك ببوليصة الشحن. يُرجى تسليم المنتج لأقرب فرع لمزود الشحن المذكور.</p>
                              </div>
                            </div>
                          )}

                          {/* Step 4: Inspected */}
                          {(trackedRequest.status === 'warehouse_inspected' || trackedRequest.status === 'resolved_approved') && (
                            <div className="relative">
                              <span className={`absolute -right-[24px] top-0.5 w-3 h-3 rounded-full ${trackedRequest.status === 'warehouse_inspected' ? 'bg-amber-500 animate-pulse' : 'bg-teal-600'}`}></span>
                              <div className="text-xs">
                                <p className="font-bold text-stone-800 font-semibold">اكتمال فحص المستودع</p>
                                <p className="text-[10px] text-stone-500">استلم الفاحص المنتج وتأكد من سلامة الخلل أو جودة التعبئة لتوصية التعويض.</p>
                              </div>
                            </div>
                          )}

                          {/* Step 5: Resolved */}
                          {(trackedRequest.status === 'resolved_approved') && (
                            <div className="relative font-bold">
                              <span className="absolute -right-[24px] top-0.5 w-3 h-3 rounded-full bg-emerald-600"></span>
                              <div className="text-xs text-emerald-700">
                                <p className="font-bold">تم تحويل مبلغ التعويض بنجاح</p>
                                <p className="text-[10px] text-emerald-600/80">تم إصدار التسوية المالية وتحويل قيمة السلعة لحساب الآيبان البنكي الخاص بك بنجاح.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-white border border-stone-200/50 rounded-2xl p-4 text-stone-400 space-y-2">
                      <AlertCircle className="w-8 h-8 mx-auto text-stone-300" />
                      <h4 className="text-xs font-bold text-stone-800">لا يوجد تتبع بهذا الرقم</h4>
                      <p className="text-[10px] text-stone-500 max-w-xs mx-auto">أدخل رمزاً صالحاً للتتبع مثل <span className="font-bold font-mono">HAL-1024</span> أو <span className="font-bold font-mono">HAL-1025</span> لرؤية التحديثات الجارية.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-center text-stone-400">
                مجموع طلبات الضمان المفتوحة بالنظام: {requests.length} طلب
              </div>
            </div>
          )}

          {/* Simulated Apple iPhone Home Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-300 rounded-full select-none"></div>

        </div>
      </div>
    </div>
  );
}
