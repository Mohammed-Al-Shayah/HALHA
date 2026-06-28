/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CustomerRequest, RequestType, RequestItem, RequestStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { durationNormal, easePremium } from '../motionTokens';
import {
  Smartphone,
  ChevronLeft,
  ChevronRight,
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
  onUpdateRequest?: (updatedRequest: CustomerRequest) => void;
  lang: 'ar' | 'en';
}

export default function CustomerPortal({
  requests,
  onSubmitNewRequest,
  onUpdateRequest,
  lang,
}: CustomerPortalProps) {
  // Mobile Navigation Screen
  const [screen, setScreen] = useState<'landing' | 'verify' | 'select_type' | 'form' | 'success' | 'track'>('landing');
  
  // Input fields
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [requestType, setRequestType] = useState<RequestType>('return');
  
  // Tracking search
  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackPhoneInput, setTrackPhoneInput] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<CustomerRequest | null>(null);

  // Form states
  const [selectedItemName, setSelectedItemName] = useState('بن قهوة مختصة - هيرلوم إثيوبي مغسول (٢٥٠ غرام)');
  const [selectedItemPrice, setSelectedItemPrice] = useState(68);
  const [returnReason, setReturnReason] = useState('البن منسكب ومكشوف داخل صندوق التوصيل الكرتوني عند استلامه.');
  const [sizeDesired, setSizeDesired] = useState('56');
  const [complaintType, setComplaintType] = useState('تأخر وصول الطلب');
  const [customerMsgInput, setCustomerMsgInput] = useState('');

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

    const typeDesc = requestType === 'return' ? 'استرجاع السلعة' : requestType === 'exchange' ? 'استبدال المنتج' : `شكوى وبلاغ (${complaintType})`;

    const newRequest: CustomerRequest = {
      id: generatedId,
      storeId: 'store-1',
      storeName: 'نجد للقهوة المختصة',
      orderNumber: orderNumber || 'ORD-98432',
      customerName: 'ضيف المتجر الكريم',
      customerPhone: phoneNumber || '966500000000',
      customerEmail: 'customer@test.sa',
      type: requestType,
      items: [newReqItem],
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `ev-${Date.now()}`,
          status: 'new',
          titleAr: 'تقديم الطلب عبر البوابة',
          descriptionAr: `تم استقبال طلب ${typeDesc} وتوليد رقم التتبع بنجاح.`,
          createdAt: new Date().toISOString(),
          actorName: 'العميل',
          isInternal: false,
        }
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'merchant',
          senderName: 'خدمة العملاء',
          text: `مرحباً بك، أهلاً بك في بوابة الدعم للمتجر. تم استقبال طلب ${typeDesc} بنجاح وسنتواصل معك هنا قريباً جداً.`,
          createdAt: new Date().toISOString()
        }
      ]
    };

    onSubmitNewRequest(newRequest);
    setJustSubmittedId(generatedId);
    setScreen('success');
  };

  // Customer tracking search
  const handleTrackSearch = (id: string, phone: string = phoneNumber) => {
    const pInput = phone.trim();
    if (!id.trim() || !pInput) return;
    const found = requests.find(
      r => r.id.toLowerCase() === id.trim().toLowerCase() && 
      (r.customerPhone.includes(pInput) || pInput.includes(r.customerPhone))
    );
    if (found) {
      setTrackedRequest(found);
    } else {
      setTrackedRequest(null);
    }
  };

  // Chat message and photo handlers
  const handleSendCustomerMessage = (text: string, photoUrl?: string) => {
    if (!trackedRequest || (!text.trim() && !photoUrl)) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer' as const,
      senderName: trackedRequest.customerName,
      text: text,
      createdAt: new Date().toISOString(),
      photoUrl: photoUrl
    };

    const updatedMessages = trackedRequest.messages ? [...trackedRequest.messages, newMessage] : [newMessage];
    
    const updatedTimeline = [...trackedRequest.timeline, {
      id: `ev-${Date.now()}`,
      status: trackedRequest.status,
      titleAr: photoUrl ? 'رفع صورة إضافية من العميل' : 'إضافة رد من العميل',
      descriptionAr: text || 'قام العميل بإرفاق صورة إضافية لتوضيح حالة المنتج.',
      createdAt: new Date().toISOString(),
      actorName: 'العميل',
      isInternal: false,
    }];

    const updatedRequest = {
      ...trackedRequest,
      messages: updatedMessages,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString()
    };

    setTrackedRequest(updatedRequest);
    if (onUpdateRequest) {
      onUpdateRequest(updatedRequest);
    }
    setCustomerMsgInput('');
  };

  const handleUploadAdditionalPhoto = () => {
    const simulatedPhotoUrl = 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=300&auto=format&fit=crop';
    handleSendCustomerMessage('قمت بإرفاق صورة إضافية لإثبات الحالة.', simulatedPhotoUrl);
  };

  const handleCancelRequest = () => {
    if (!trackedRequest) return;
    
    const updatedTimeline = [...trackedRequest.timeline, {
      id: `ev-${Date.now()}`,
      status: 'cancelled' as const,
      titleAr: 'إلغاء الطلب من قِبل العميل',
      descriptionAr: 'قام المشتري بإلغاء طلب المرتجع وإغلاقه من بوابة العميل.',
      createdAt: new Date().toISOString(),
      actorName: 'العميل',
      isInternal: false,
    }];

    const updatedRequest = {
      ...trackedRequest,
      status: 'cancelled' as const,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString()
    };

    setTrackedRequest(updatedRequest);
    if (onUpdateRequest) {
      onUpdateRequest(updatedRequest);
    }
  };

  // Convert merchant-centric statuses to friendly localized statuses for consumers
  const getCustomerFriendlyStatus = (status: RequestStatus) => {
    if (lang === 'en') {
      switch (status) {
        case 'new':
          return 'Request received & under administrative review';
        case 'under_review':
          return 'Your request is under technical review';
        case 'waiting_customer_info':
          return 'Awaiting your input (please check messages below)';
        case 'escalated_to_owner':
          return 'Your request is under store management review';
        case 'approved':
          return 'Initially approved - Processing pickup/delivery steps';
        case 'rejected':
          return 'Request rejected - Justification details shared';
        case 'received':
          return 'Item received in warehouse and is under inspection';
        case 'completed':
          return 'Request fully completed according to store policy.';
        case 'cancelled':
          return 'Request cancelled and closed per your request';
        default:
          return 'Your request is being continuously processed';
      }
    }
    switch (status) {
      case 'new':
        return 'تم استلام الطلب وهو قيد المراجعة والتدقيق الإداري';
      case 'under_review':
        return 'طلبكم قيد المراجعة والتدقيق الفني';
      case 'waiting_customer_info':
        return 'بانتظار معلومات إضافية منكم (يرجى مراجعة الرسائل أدناه)';
      case 'escalated_to_owner':
        return 'طلبك قيد المراجعة من إدارة المتجر';
      case 'approved':
        return 'تم قبول الطلب وجاري متابعة الخطوات التالية حسب سياسة المتجر';
      case 'rejected':
        return 'تم رفض الطلب بعد المراجعة وتوضيح الأسباب للعميل';
      case 'received':
        return 'تم استلام المنتج في المستودع وهو قيد الفحص والتقييم';
      case 'completed':
        return 'تم إكمال الطلب حسب سياسة المتجر.';
      case 'cancelled':
        return 'تم إلغاء الطلب وإغلاقه بناءً على رغبتكم';
      default:
        return 'طلبك تحت المعالجة والمتابعة المستمرة';
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
        <div 
          className="flex-1 bg-[#faf8f5] text-stone-900 rounded-[38px] overflow-y-auto px-5 pt-8 pb-10 flex flex-col relative"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          
          {/* iOS-Style Mobile Status Bar */}
          <div className="flex justify-between items-center text-[11px] text-stone-400 font-semibold mb-4 px-2 select-none">
            <span className="font-mono">{lang === 'ar' ? '9:41 ص' : '9:41 AM'}</span>
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
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <h1 className="text-xs font-bold text-stone-900">
                  {lang === 'ar' ? 'نجد للقهوة المختصة' : 'Najd Specialty Coffee'}
                </h1>
                <p className="text-[10px] text-stone-400">
                  {lang === 'ar' ? 'مركز معالجة الطلبات' : 'Order Processing Center'}
                </p>
              </div>
            </div>
            
            {screen !== 'landing' && (
              <button
                onClick={() => {
                  if (screen === 'track') setTrackedRequest(null);
                  setScreen('landing');
                }}
                className="text-[11px] font-bold text-teal-700 flex items-center gap-0.5 bg-teal-50 px-2 py-1 rounded cursor-pointer"
              >
                <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
              </button>
            )}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {/* SCREEN: LANDING */}
            {screen === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, x: lang === 'ar' ? -15 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: lang === 'ar' ? 15 : -15 }}
                transition={{ duration: durationNormal, ease: easePremium }}
                className="flex-1 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="bg-teal-900 text-white p-5 rounded-2xl smooth-shadow space-y-1">
                    <h2 className="text-sm font-bold text-right">
                      {lang === 'ar' ? 'نهتم بتجربتك دوماً!' : 'We Care About Your Experience!'}
                    </h2>
                    <p className="text-[11px] text-teal-100 leading-relaxed text-right">
                      {lang === 'ar' 
                        ? 'أهلاً بك في البوابة الموحدة لمراجعة طلباتكم. نسعد بمعالجة طلبك بكل سلاسة وفي خطوات بسيطة.' 
                        : 'Welcome to the unified returns portal. We are pleased to process your request smoothly in a few simple steps.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className={`text-[11px] font-bold text-stone-400 uppercase tracking-wide ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                      {lang === 'ar' ? 'خيارات البوابة المتاحة' : 'Available Portal Options'}
                    </h3>
                    
                    {/* Option 1: Start Return/Exchange */}
                    <button
                      onClick={() => setScreen('verify')}
                      className="w-full p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200/50 smooth-shadow flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div className={`space-y-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        <p className="text-xs font-bold text-stone-900">
                          {lang === 'ar' ? 'بدء طلب استرجاع أو استبدال جديد' : 'Start a New Return or Exchange'}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {lang === 'ar' ? 'تحتاج فقط رقم طلب الشراء وجوالك' : 'You only need your order number & mobile'}
                        </p>
                      </div>
                      {lang === 'ar' ? (
                        <ChevronLeft className="w-4 h-4 text-teal-700 group-hover:-translate-x-1 transition-transform shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-teal-700 group-hover:translate-x-1 transition-transform shrink-0" />
                      )}
                    </button>

                    {/* Option 2: Track Existing */}
                    <button
                      onClick={() => {
                        setScreen('track');
                        setTrackIdInput('');
                        setTrackedRequest(null);
                      }}
                      className="w-full p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200/50 smooth-shadow flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div className={`space-y-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        <p className="text-xs font-bold text-stone-900">
                          {lang === 'ar' ? 'تتبّع حالة طلب مرتجع قائم' : 'Track Existing Return/Exchange'}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {lang === 'ar' ? 'أدخل رقم تتبع حلّها (HAL-xxxx) لمشاهدة الموقف' : 'Enter Hal\'ha tracking number (HAL-xxxx) to view status'}
                        </p>
                      </div>
                      {lang === 'ar' ? (
                        <ChevronLeft className="w-4 h-4 text-teal-700 group-hover:-translate-x-1 transition-transform shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-teal-700 group-hover:translate-x-1 transition-transform shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Policy Quick Box */}
                <div className="bg-stone-50 border border-stone-200/40 p-3.5 rounded-2xl space-y-1 text-xs">
                  <span className={`font-bold text-stone-800 flex items-center gap-1 ${lang === 'ar' ? 'justify-start' : 'justify-start'}`}>
                    <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>{lang === 'ar' ? 'سياسة نجد للقهوة' : 'Najd Specialty Coffee Policy'}</span>
                  </span>
                  <p className="text-[10px] text-stone-500 leading-relaxed">
                    {lang === 'ar'
                      ? 'نقبل معالجة الطلبات للمنتجات المستلمة خلال ١٥ يوماً من الاستلام. وتتم المعالجة والخطوات التالية حسب سياسة المتجر المعتمدة.'
                      : 'We accept requests for products received within 15 days of delivery. Processing steps are executed per authorized store policy.'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* SCREEN: VERIFY ORDER */}
            {screen === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: lang === 'ar' ? -15 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: lang === 'ar' ? 15 : -15 }}
                transition={{ duration: durationNormal, ease: easePremium }}
                className="flex-1 flex flex-col justify-between"
              >
                <form onSubmit={handleVerify} className="flex-1 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <h2 className="text-sm font-bold text-stone-900">
                        {lang === 'ar' ? 'التحقق من الفاتورة وطلب الشراء' : 'Verify Invoice & Purchase Order'}
                      </h2>
                      <p className="text-[10px] text-stone-400 mt-1">
                        {lang === 'ar' ? 'يُرجى كتابة البيانات المسجلة بفاتورة المتجر الإلكتروني للبدء.' : 'Please enter details printed on the store receipt to begin.'}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          {lang === 'ar' ? 'رقم طلب الشراء الأصلي' : 'Original Purchase Order Number'}
                        </label>
                        <input
                          type="text"
                          required
                          value={orderNumber}
                          onChange={(e) => setOrderNumber(e.target.value)}
                          placeholder={lang === 'ar' ? 'مثال: ORD-89432 أو 76110' : 'e.g. ORD-89432 or 76110'}
                          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                          dir="ltr"
                        />
                        <p className="text-[9px] text-stone-400 mt-1">
                          {lang === 'ar' ? (
                            <>أدخل <span className="font-bold">ORD-89432</span> أو <span className="font-bold">76110</span> لتجربة بيانات مسبقة جاهزة.</>
                          ) : (
                            <>Enter <span className="font-bold">ORD-89432</span> or <span className="font-bold">76110</span> to test with preloaded demo data.</>
                          )}
                        </p>
                      </div>

                      <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          {lang === 'ar' ? 'رقم الجوال المسجل بالطلب' : 'Registered Mobile Number'}
                        </label>
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
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-xs font-bold shadow-xs mt-6 cursor-pointer"
                  >
                    {lang === 'ar' ? 'التحقق وجلب محتويات السلّة ←' : 'Verify & Retrieve Cart Items →'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* SCREEN: SELECT TYPE */}
            {screen === 'select_type' && (
              <motion.div
                key="select_type"
                initial={{ opacity: 0, x: lang === 'ar' ? -15 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: lang === 'ar' ? 15 : -15 }}
                transition={{ duration: durationNormal, ease: easePremium }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <h2 className="text-sm font-bold text-stone-900">
                      {lang === 'ar' ? 'ما نوع الإجراء المطلوب؟' : 'What Type of Action is Needed?'}
                    </h2>
                    <p className="text-[10px] text-stone-400 mt-1">
                      {lang === 'ar' ? 'اختر الإجراء الذي يناسب حالتك الحالية للمتابعة.' : 'Choose the action that fits your current case to continue.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-4">
                    {/* Option 1: Return */}
                    <button
                      onClick={() => { setRequestType('return'); setScreen('form'); }}
                      className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-teal-500 hover:bg-teal-50/20 smooth-shadow flex items-start gap-3 transition-all cursor-pointer text-right"
                    >
                      <span className="p-2 bg-amber-50 text-amber-700 rounded-xl mt-0.5 shrink-0"><CreditCard className="w-4 h-4" /></span>
                      <div className={`space-y-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h4 className="text-xs font-bold text-stone-900">
                          {lang === 'ar' ? 'إرجاع السلعة' : 'Return the Item'}
                        </h4>
                        <p className="text-[10px] text-stone-400">
                          {lang === 'ar' ? 'لطلب إرجاع السلعة المشتراة وفقاً لسياسة المتجر.' : 'To request returning items in accordance with store policies.'}
                        </p>
                      </div>
                    </button>

                    {/* Option 2: Exchange */}
                    <button
                      onClick={() => { setRequestType('exchange'); setScreen('form'); }}
                      className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-teal-500 hover:bg-teal-50/20 smooth-shadow flex items-start gap-3 transition-all cursor-pointer text-right"
                    >
                      <span className="p-2 bg-teal-50 text-teal-700 rounded-xl mt-0.5 shrink-0"><RefreshCw className="w-4 h-4" /></span>
                      <div className={`space-y-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h4 className="text-xs font-bold text-stone-900">
                          {lang === 'ar' ? 'استبدال مقاس أو نوع المنتج' : 'Exchange Size or Product Type'}
                        </h4>
                        <p className="text-[10px] text-stone-400">
                          {lang === 'ar' ? 'لاستبدال مقاس عباية أو نوع ماكينة ومطحنة ببديل آخر حسب سياسة المتجر.' : 'To exchange abaya sizes or device model with an alternative per store policy.'}
                        </p>
                      </div>
                    </button>

                    {/* Option 3: Complaint */}
                    <button
                      onClick={() => { setRequestType('complaint'); setScreen('form'); }}
                      className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-rose-500 hover:bg-rose-50/20 smooth-shadow flex items-start gap-3 transition-all cursor-pointer text-right"
                    >
                      <span className="p-2 bg-rose-50 text-rose-700 rounded-xl mt-0.5 shrink-0"><AlertCircle className="w-4 h-4" /></span>
                      <div className={`space-y-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h4 className="text-xs font-bold text-stone-900">
                          {lang === 'ar' ? 'تقديم شكوى أو بلاغ بخصوص الطلب' : 'File a Complaint or Ticket'}
                        </h4>
                        <p className="text-[10px] text-stone-400">
                          {lang === 'ar' ? 'لرفع بلاغ فوري عن مشاكل الطلب الأخرى، تأخر التوصيل، السلع الناقصة أو غيرها.' : 'To report delivery delays, missing pieces, or packaging issues immediately.'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setScreen('verify')}
                  className="text-[11px] font-bold text-stone-500 hover:text-stone-800 text-center py-2 cursor-pointer"
                >
                  {lang === 'ar' ? '← العودة للتحقق' : '← Back to Verification'}
                </button>
              </motion.div>
            )}

            {/* SCREEN: FORM DETAILS */}
            {screen === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: lang === 'ar' ? -15 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: lang === 'ar' ? 15 : -15 }}
                transition={{ duration: durationNormal, ease: easePremium }}
                className="flex-1"
              >
                <form onSubmit={handleSubmitRequest} className="flex-1 flex flex-col justify-between space-y-4 h-full">
                  <div className="space-y-3">
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <h2 className="text-sm font-bold text-stone-900">
                        {lang === 'ar' ? 'تعبئة تفاصيل الطلب' : 'Fill Request Details'}
                      </h2>
                      <p className="text-[10px] text-stone-400">
                        {lang === 'ar' ? 'المنتج المتأثر المجلوب تلقائياً من نظام الفواتير:' : 'Affected item auto-fetched from billing system:'}
                      </p>
                    </div>

                    {/* Scraped item mockup */}
                    <div className="p-3 bg-white border border-stone-200/50 rounded-xl flex gap-3 text-xs text-right">
                      <span className="text-2xl shrink-0 mt-1">📦</span>
                      <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                        <p className="font-bold text-stone-900 line-clamp-1">
                          {lang === 'ar' ? selectedItemName : (selectedItemName.includes('عباية') ? 'Linen Black Abaya - Premium Edition' : 'Najd Specialty Coffee Beans - Espresso Roast')}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          {lang === 'ar' 
                            ? `السعر: ${selectedItemPrice} ر.س • الكمية: ١` 
                            : `Price: SAR ${selectedItemPrice} • Quantity: 1`}
                        </p>
                      </div>
                    </div>

                    {/* Complaint type if selected */}
                    {requestType === 'complaint' && (
                      <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          {lang === 'ar' ? 'نوع الشكوى / البلاغ' : 'Complaint / Issue Type'}
                        </label>
                        <select
                          value={complaintType}
                          onChange={(e) => setComplaintType(e.target.value)}
                          className="w-full px-2 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white cursor-pointer"
                        >
                          <option value="تأخر وصول الطلب">
                            {lang === 'ar' ? 'تأخر وصول الطلب' : 'Delay in receiving order'}
                          </option>
                          <option value="سوء معاملة خدمة العملاء">
                            {lang === 'ar' ? 'سوء معاملة خدمة العملاء أو الدعم' : 'Support / customer service mistreatment'}
                          </option>
                          <option value="سلعة ناقصة في الطلب">
                            {lang === 'ar' ? 'وصول طلب ناقص أو عناصر مفقودة' : 'Missing items / incomplete order'}
                          </option>
                          <option value="مشكلة في التغليف">
                            {lang === 'ar' ? 'مشكلة في التغليف' : 'Packaging issue'}
                          </option>
                          <option value="أخرى">
                            {lang === 'ar' ? 'أخرى - توضيح التفاصيل بالأسفل' : 'Other - clarify in details below'}
                          </option>
                        </select>
                      </div>
                    )}

                    {/* Reason field */}
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {requestType === 'complaint' 
                          ? (lang === 'ar' ? 'وصف تفاصيل ومبررات الشكوى' : 'Complaint description and details') 
                          : (lang === 'ar' ? 'وصف مبرر الاستبدال/الاسترجاع' : 'Describe the reason for return/exchange')}
                      </label>
                      <textarea
                        required
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder={
                          requestType === 'complaint' 
                            ? (lang === 'ar' ? 'اكتب تفاصيل البلاغ والمشكلة التي تواجهها هنا ليتلقاها الدعم الفني...' : 'Describe the ticket details and issue you are facing here for support...')
                            : (lang === 'ar' ? 'اشرح الخلل أو سبب عدم ملاءمة المقاس لزملائنا فنيي الفحص بالمستودع...' : 'Explain the fault or size issue to our warehouse checking specialists...')
                        }
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-xs h-16 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                      />
                    </div>

                    {requestType === 'exchange' && (
                      /* Size selection for exchange */
                      <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          {lang === 'ar' ? 'المقاس أو اللون المطلوب استبداله' : 'Desired Size or Color to Exchange'}
                        </label>
                        <select
                          value={sizeDesired}
                          onChange={(e) => setSizeDesired(e.target.value)}
                          className="w-full px-2 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white cursor-pointer"
                        >
                          <option value="56">
                            {lang === 'ar' ? 'عباية كتان سوداء - مقاس ٥٦' : 'Black Linen Abaya - Size 56'}
                          </option>
                          <option value="58">
                            {lang === 'ar' ? 'عباية كتان سوداء - مقاس ٥٨' : 'Black Linen Abaya - Size 58'}
                          </option>
                          <option value="electric">
                            {lang === 'ar' ? 'مطحنة بن كهربائية احترافية (دفع فارق)' : 'Electric Coffee Grinder Pro (Pay diff)'}
                          </option>
                        </select>
                      </div>
                    )}

                    {/* Image Upload box */}
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <span className="block text-[11px] font-bold text-stone-700 mb-1">
                        {lang === 'ar' ? 'إرفاق صورة لإثبات حالة السلعة (موصى به)' : 'Attach Condition Proof Photo (Recommended)'}
                      </span>
                      <div className="border border-dashed border-stone-300 rounded-xl p-3.5 text-center bg-white cursor-pointer hover:bg-stone-50 transition">
                        <UploadCloud className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                        <p className="text-[10px] text-stone-500">
                          {lang === 'ar' ? 'اسحب صورة السلعة التالفة هنا أو اضغط للاختيار' : 'Drag photo of damaged product here or click to browse'}
                        </p>
                        <span className="text-[8px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded inline-block mt-1">
                          {lang === 'ar' ? 'تأكيد: تم إرفاق صورة الإثبات تلقائياً' : 'Confirmed: Proof photo attached automatically'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {lang === 'ar' ? 'تأكيد وإرسال الطلب ←' : 'Confirm & Submit Request →'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* SCREEN: SUCCESS PAGE */}
            {screen === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: durationNormal, ease: easePremium }}
                className="flex-1 flex flex-col justify-between text-center space-y-6"
              >
                <div className="space-y-4 pt-4">
                  <motion.span 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 inline-block"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.span>

                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-stone-900">
                      {lang === 'ar' ? 'تم تقديم طلبك بنجاح!' : 'Request Submitted Successfully!'}
                    </h2>
                    <p className="text-[11px] text-stone-400">
                      {lang === 'ar' ? 'رقم تتبع ومراجعة المرتجع الخاص بك:' : 'Your returns tracking & reference number:'}
                    </p>
                    <p className="text-base font-bold font-mono text-teal-700 bg-teal-50 py-1 px-3 rounded-lg w-fit mx-auto border border-teal-100">{justSubmittedId}</p>
                  </div>

                  <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl text-center text-xs leading-relaxed text-stone-600">
                    <p className="font-bold text-stone-800">
                      {lang === 'ar' 
                        ? 'سيقوم المتجر بمراجعة طلبك وإبلاغك بالخطوات التالية حسب سياسة المتجر.' 
                        : 'The store will review your request details and notify you of the next steps according to policy.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleTrackSearch(justSubmittedId, phoneNumber);
                      setScreen('track');
                    }}
                    className="w-full bg-stone-900 text-white py-3 rounded-xl text-xs font-bold cursor-pointer hover:bg-stone-800 transition-all"
                  >
                    {lang === 'ar' ? 'تتبع حالة هذا الطلب الآن' : 'Track This Request Status Now'}
                  </button>
                  <button
                    onClick={() => setScreen('landing')}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN: TRACK REQUEST PAGE */}
            {screen === 'track' && (
              <motion.div
                key="track"
                initial={{ opacity: 0, x: lang === 'ar' ? -15 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: lang === 'ar' ? 15 : -15 }}
                transition={{ duration: durationNormal, ease: easePremium }}
                className="flex-1 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <h2 className="text-sm font-bold text-stone-900 font-sans">
                      {lang === 'ar' ? 'تتبع الطلبات وحالة المعالجة' : 'Order Tracking & Processing Status'}
                    </h2>
                    <p className="text-[10px] text-stone-400 mt-1 font-sans">
                      {lang === 'ar' ? 'اكتب رقم تتبع حلّها ورقم الجوال لمشاهدة الموقف الفعلي لطلبك.' : 'Enter your Hal\'ha track number and registered mobile to view actual status.'}
                    </p>
                  </div>

                  {/* Track Search inputs */}
                  <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200/50">
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">
                        {lang === 'ar' ? 'رقم تتبع حلّها (HAL-xxxx)' : 'Hal\'ha Return Track ID (HAL-xxxx)'}
                      </label>
                      <input
                        type="text"
                        value={trackIdInput}
                        onChange={(e) => setTrackIdInput(e.target.value)}
                        placeholder="مثال: HAL-1024"
                        className={`w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none bg-white ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                        dir="ltr"
                      />
                    </div>
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">
                        {lang === 'ar' ? 'رقم الجوال المسجل بالطلب' : 'Registered Mobile Number'}
                      </label>
                      <input
                        type="tel"
                        value={trackPhoneInput}
                        onChange={(e) => setTrackPhoneInput(e.target.value)}
                        placeholder="مثال: 966501234567"
                        className={`w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none bg-white ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                        dir="ltr"
                      />
                    </div>
                    <button
                      onClick={() => handleTrackSearch(trackIdInput, trackPhoneInput)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <Search className="w-4 h-4 shrink-0" />
                      <span>{lang === 'ar' ? 'البحث والتحقق من حالة الطلب' : 'Search & Verify Request Status'}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-stone-200/50">
                    {trackedRequest ? (
                      <div className="space-y-4">
                        {/* Customer info header */}
                        <div className="bg-white p-3.5 border border-stone-200/50 rounded-2xl smooth-shadow space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-teal-800 font-mono">{trackedRequest.id}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{trackedRequest.createdAt.split('T')[0]}</span>
                          </div>
                          <p className={`text-stone-700 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                            {lang === 'ar' ? 'حالة الطلب الحالية:' : 'Current Request Status:'}
                          </p>
                          <span className="block font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 text-center text-[11px] leading-relaxed">
                            {getCustomerFriendlyStatus(trackedRequest.status)}
                          </span>
                          
                          {trackedRequest.status === 'completed' && (
                            <div className="p-2 bg-emerald-50 text-emerald-800 text-[10px] rounded leading-relaxed border border-emerald-100 text-center font-bold">
                              {lang === 'ar' ? '🎉 تم إكمال الطلب حسب سياسة المتجر.' : '🎉 Request completed successfully per policy.'}
                            </div>
                          )}
                          {trackedRequest.status === 'rejected' && (
                            <div className="p-2 bg-stone-50 text-stone-800 text-[10px] rounded leading-relaxed border border-stone-200 text-center">
                              {lang === 'ar' 
                                ? 'سيقوم المتجر بمراجعة طلبك وإبلاغك بالخطوات التالية حسب سياسة المتجر.' 
                                : 'The store has finalized processing the decision according to our commercial rules.'}
                            </div>
                          )}

                          {/* Cancel request button before approval */}
                          {['new', 'under_review', 'waiting_customer_info', 'escalated_to_owner'].includes(trackedRequest.status) && (
                            <button
                              onClick={handleCancelRequest}
                              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-[10px] font-bold py-2 rounded-xl border border-rose-100 transition mt-2 cursor-pointer"
                            >
                              {lang === 'ar' ? '❌ إلغاء الطلب نهائياً' : '❌ Cancel Request Permanently'}
                            </button>
                          )}
                        </div>

                        {/* Chat Messages section */}
                        <div className="bg-white p-3.5 border border-stone-200/50 rounded-2xl smooth-shadow space-y-3">
                          <h4 className="text-[11px] font-bold text-stone-800 border-b border-stone-100 pb-1.5 flex items-center justify-between">
                            <span>
                              {lang === 'ar' ? '💬 المحادثة ورسائل الدعم الفني' : '💬 Help & Support Chat History'}
                            </span>
                            <span className="text-[9px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-mono">
                              {lang === 'ar' ? 'نشط' : 'Active'}
                            </span>
                          </h4>

                          {/* Message log */}
                          <div className="space-y-2 max-h-[160px] overflow-y-auto p-1 text-[11px] leading-relaxed">
                            {trackedRequest.messages && trackedRequest.messages.length > 0 ? (
                              trackedRequest.messages.map((msg) => {
                                const isCustomer = msg.sender === 'customer';
                                const senderDispName = msg.sender === 'customer' 
                                  ? (lang === 'ar' ? 'العميل (أنت)' : 'Customer (You)')
                                  : (lang === 'ar' ? msg.senderName : (msg.senderName.includes('عبدالرحمن') ? 'Abdulrahman (Owner)' : (msg.senderName.includes('أحمد') ? 'Ahmad (Support)' : 'Bandar (Warehouse)')));
                                return (
                                  <div key={msg.id} className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}>
                                    <span className="text-[9px] text-stone-400 mb-0.5">{senderDispName}</span>
                                    <div className={`p-2.5 rounded-2xl max-w-[85%] ${
                                      isCustomer 
                                        ? 'bg-teal-600 text-white rounded-tr-none text-right' 
                                        : 'bg-stone-100 text-stone-800 rounded-tl-none text-right'
                                    }`}>
                                      <p>{msg.text}</p>
                                      {msg.photoUrl && (
                                        <img 
                                          src={msg.photoUrl} 
                                          alt="Extra attachment" 
                                          className="mt-1.5 rounded-lg border border-stone-200/50 max-h-[100px] object-cover w-full animate-fade-in"
                                          referrerPolicy="no-referrer"
                                        />
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-center text-stone-400 text-[10px] py-4">
                                {lang === 'ar' ? 'لا توجد رسائل سابقة في هذا الطلب.' : 'No previous messages in this ticket.'}
                              </p>
                            )}
                          </div>

                          {/* Input form for replies & upload additional photos */}
                          {trackedRequest.status !== 'cancelled' && (
                            <div className="space-y-2 pt-2 border-t border-stone-100">
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={customerMsgInput}
                                  onChange={(e) => setCustomerMsgInput(e.target.value)}
                                  placeholder={lang === 'ar' ? 'اكتب ردك هنا للدعم...' : 'Type your reply here...'}
                                  className="flex-1 px-2.5 py-1.5 border border-stone-200 rounded-lg text-[11px] focus:outline-none bg-white text-right"
                                />
                                <button
                                  onClick={() => {
                                    if (customerMsgInput.trim()) {
                                      handleSendCustomerMessage(customerMsgInput);
                                    }
                                  }}
                                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 rounded-lg text-[11px] font-bold cursor-pointer"
                                >
                                  {lang === 'ar' ? 'إرسال' : 'Send'}
                                </button>
                              </div>
                              
                              <button
                                onClick={handleUploadAdditionalPhoto}
                                className="w-full bg-stone-50 hover:bg-stone-100 text-stone-600 text-[10px] font-bold py-1.5 rounded-lg border border-stone-200/60 flex items-center justify-center gap-1 transition cursor-pointer"
                              >
                                {lang === 'ar' ? '📸 رفع وإرفاق صورة إضافية للسلعة' : '📸 Upload & Attach Extra Item Photo'}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Customer-friendly timeline with translated milestones */}
                        <div className="space-y-3.5">
                          <h4 className={`text-[10px] font-bold text-stone-400 uppercase tracking-wider ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                            {lang === 'ar' ? 'سجل الخطوات المكتملة للطلب' : 'Completed Request Steps Log'}
                          </h4>
                          
                          <div className={`relative ${lang === 'ar' ? 'border-r border-stone-200 mr-3 pr-5' : 'border-l border-stone-200 ml-3 pl-5'} space-y-5`}>
                            {/* Step 1: Created */}
                            <div className="relative">
                              <span className={`absolute ${lang === 'ar' ? '-right-[24px]' : '-left-[24px]'} top-0.5 w-3 h-3 rounded-full bg-teal-600`}></span>
                              <div className={`text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                <p className="font-bold text-stone-800">
                                  {lang === 'ar' ? 'تلقي طلب المشتري بالنظام' : 'Buyer Request Logged in System'}
                                </p>
                                <p className="text-[10px] text-stone-500">
                                  {lang === 'ar' ? 'تم تسجيل تفاصيل الطلب وبدء التدقيق المبدئي.' : 'Request details recorded and initial review started.'}
                                </p>
                              </div>
                            </div>

                            {/* Step 2: Review */}
                            {['new', 'under_review', 'waiting_customer_info', 'escalated_to_owner'].includes(trackedRequest.status) && (
                              <div className="relative">
                                <span className={`absolute ${lang === 'ar' ? '-right-[24px]' : '-left-[24px]'} top-0.5 w-3 h-3 rounded-full bg-amber-500 animate-pulse`}></span>
                                <div className={`text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                  <p className="font-bold text-stone-800">
                                    {lang === 'ar' ? 'قيد المراجعة والتدقيق الإداري' : 'Under Administrative Review & Audit'}
                                  </p>
                                  <p className="text-[10px] text-stone-500">
                                    {lang === 'ar' ? 'يقوم ممثلو خدمة العملاء بمطابقة طلبك ومراجعته.' : 'Customer service matches and reviews your return details.'}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Step 3: Approved */}
                            {['approved', 'received', 'completed'].includes(trackedRequest.status) && (
                              <div className="relative">
                                <span className={`absolute ${lang === 'ar' ? '-right-[24px]' : '-left-[24px]'} top-0.5 w-3 h-3 rounded-full ${trackedRequest.status === 'approved' ? 'bg-amber-500 animate-pulse' : 'bg-teal-600'}`}></span>
                                <div className={`text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                  <p className="font-bold text-stone-800">
                                    {lang === 'ar' ? 'تم قبول الطلب وجاري تسليم المنتج للمستودع' : 'Request Accepted & Awaiting Delivery'}
                                  </p>
                                  <p className="text-[10px] text-stone-500">
                                    {lang === 'ar' 
                                      ? 'تم قبول الطلب مبدئياً وجاري استلام القطع لإجراء الفحص والتقييم حسب سياسة المتجر.' 
                                      : 'Initially accepted; awaiting item delivery to the warehouse for inspection.'}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Step 4: Received */}
                            {['received', 'completed'].includes(trackedRequest.status) && (
                              <div className="relative">
                                <span className={`absolute ${lang === 'ar' ? '-right-[24px]' : '-left-[24px]'} top-0.5 w-3 h-3 rounded-full ${trackedRequest.status === 'received' ? 'bg-amber-500 animate-pulse' : 'bg-teal-600'}`}></span>
                                <div className={`text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                  <p className="font-bold text-stone-800">
                                    {lang === 'ar' ? 'وصول المنتج وفحصه في المستودع' : 'Item Received & Inspected at Warehouse'}
                                  </p>
                                  <p className="text-[10px] text-stone-500">
                                    {lang === 'ar' 
                                      ? 'تم تفتيش المنتج في المستودع والتحقق من حالته لإصدار القرار وإكمال الطلب حسب السياسة المعتمدة.' 
                                      : 'The item has been inspected at our warehouse to issue the final action.'}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Step 5: Completed */}
                            {(trackedRequest.status === 'completed') && (
                              <div className="relative font-bold">
                                <span className={`absolute ${lang === 'ar' ? '-right-[24px]' : '-left-[24px]'} top-0.5 w-3 h-3 rounded-full bg-emerald-600`}></span>
                                <div className={`text-xs text-emerald-700 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                  <p className="font-bold">{lang === 'ar' ? 'تم إكمال الطلب بنجاح' : 'Request Completed Successfully'}</p>
                                  <p className="text-[10px] text-emerald-600/80 font-normal">
                                    {lang === 'ar' ? 'تم إكمال ومعالجة الطلب بنجاح طبقاً لسياسة المتجر.' : 'Return processed and request completed according to store policy.'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-white border border-stone-200/50 rounded-2xl p-4 text-stone-400 space-y-2">
                        <AlertCircle className="w-8 h-8 mx-auto text-stone-300" />
                        <h4 className="text-xs font-bold text-stone-800">
                          {lang === 'ar' ? 'لا يوجد تتبع مطابق للبيانات' : 'No Request Matches This Data'}
                        </h4>
                        <p className="text-[10px] text-stone-500 max-w-xs mx-auto font-sans leading-relaxed">
                          {lang === 'ar' 
                            ? 'يرجى إدخال كود تتبع صحيح (مثل HAL-1024 أو HAL-1025) مع الجوال المسجل بالطلب.' 
                            : 'Please enter a valid tracking code (e.g., HAL-1024 or HAL-1025) along with the registered mobile number.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-center text-stone-400">
                  {lang === 'ar' 
                    ? `مجموع الطلبات المفتوحة بالنظام: ${requests.length} طلب` 
                    : `Total active requests in system: ${requests.length} requests`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulated Apple iPhone Home Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-300 rounded-full select-none"></div>

        </div>
      </div>
    </div>
  );
}
