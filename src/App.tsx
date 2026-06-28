/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MotionConfig, AnimatePresence, motion } from 'motion/react';
import { easePremium, durationNormal } from './motionTokens';
import { initialStores, initialRequests, initialTeamMembers } from './data/mockData';
import { Store, CustomerRequest, RequestStatus, RequestType, InspectionCondition } from './types';
import RoleSelector from './components/RoleSelector';
import AdminPanel from './components/AdminPanel';
import MerchantDashboard from './components/MerchantDashboard';
import CustomerPortal from './components/CustomerPortal';
import { MerchantLoginMock, ActivateAccountMock } from './components/MerchantAuthMock';
import LandingPage from './components/LandingPage';
import SplashScreen from './components/SplashScreen';
import AnimatedBackground from './components/AnimatedBackground';

export default function App() {
  // Splash screen state
  const [splashComplete, setSplashComplete] = useState(false);

  // Global React state
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [requests, setRequests] = useState<CustomerRequest[]>(initialRequests);
  const [teamMembers] = useState(initialTeamMembers);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  // Active view state
  const [currentArea, setCurrentArea] = useState<'landing' | 'merchant' | 'admin' | 'customer'>('landing');
  const [merchantRole, setMerchantRole] = useState<'store_owner' | 'customer_support' | 'warehouse_agent'>('store_owner');
  const [merchantSubView, setMerchantSubView] = useState<'dashboard' | 'login' | 'activate'>('dashboard');

  // Handle creating a new store (Platform Admin Panel Action)
  const handleCreateStore = (newStoreData: Omit<Store, 'createdAt' | 'requestsCount'>) => {
    const newStore: Store = {
      ...newStoreData,
      createdAt: new Date().toISOString().split('T')[0],
      requestsCount: 0,
    };
    setStores((prev) => [newStore, ...prev]);
  };

  // Toggle store active/disabled status (Platform Admin Action)
  const handleToggleStoreStatus = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) =>
        s.id === storeId
          ? { ...s, status: s.status === 'active' ? 'disabled' : 'active' }
          : s
      )
    );
  };

  // Handle adding a brand new request from Customer Portal
  const handleAddRequestFromCustomer = (newRequest: CustomerRequest) => {
    setRequests((prev) => [newRequest, ...prev]);

    // Update store stats
    setStores((prevStores) =>
      prevStores.map((s) => {
        if (s.id !== newRequest.storeId) return s;
        return {
          ...s,
          requestsCount: s.requestsCount + 1,
        };
      })
    );
  };

  // Central state machine for updating Return requests
  const handleUpdateRequestStatus = (
    requestId: string,
    newStatus: RequestStatus,
    additionalData?: {
      internalNotes?: string;
      escalationReason?: string;
      infoRequestedDetails?: string;
      inspection?: {
        inspectedBy: string;
        inspectedAt: string;
        condition: InspectionCondition;
        notes: string;
      };
    }
  ) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) => {
        if (req.id !== requestId) return req;

        const updatedTimeline = [...req.timeline];
        let eventTitleAr = '';
        let eventDescAr = '';
        let eventTitleEn = '';
        let eventDescEn = '';
        let isInternalEvent = false;

        // Determine current actor name
        let actorNameAr = 'النظام (تلقائي)';
        let actorNameEn = 'System (Auto)';
        if (currentArea === 'merchant') {
          if (merchantRole === 'store_owner') {
            actorNameAr = 'عبدالرحمن آل سعود (المالك)';
            actorNameEn = 'Abdulrahman Al Saud (Owner)';
          } else if (merchantRole === 'customer_support') {
            actorNameAr = 'أحمد القحطاني (دعم العملاء)';
            actorNameEn = 'Ahmad Al-Qahtani (Customer Support)';
          } else if (merchantRole === 'warehouse_agent') {
            actorNameAr = 'بندر العتيبي (أخصائي المستودع)';
            actorNameEn = 'Bandar Al-Otaibi (Warehouse Specialist)';
          }
        } else if (currentArea === 'customer') {
          actorNameAr = 'العميل';
          actorNameEn = 'Customer';
        }

        // Compile bilingual timeline texts for audit logs
        switch (newStatus) {
          case 'new':
            eventTitleAr = 'تم إنشاء الطلب';
            eventDescAr = 'تم تقديم الطلب بنجاح وهو قيد المراجعة المبدئية.';
            eventTitleEn = 'Request Created';
            eventDescEn = 'The request was submitted successfully and is under initial review.';
            break;
          case 'under_review':
            eventTitleAr = 'قيد المراجعة والتدقيق';
            eventDescAr = 'يجري فحص ودراسة تفاصيل ومرفقات الطلب من فريق الدعم الفني.';
            eventTitleEn = 'Under Review';
            eventDescEn = 'Details and attachments are being reviewed by the technical support team.';
            break;
          case 'waiting_customer_info':
            eventTitleAr = 'بانتظار معلومات العميل';
            eventDescAr = `مطلوب معلومات إضافية من العميل: ${additionalData?.infoRequestedDetails || ''}`;
            eventTitleEn = 'Waiting for Customer Info';
            eventDescEn = `Additional information requested: ${additionalData?.infoRequestedDetails || ''}`;
            break;
          case 'escalated_to_owner':
            eventTitleAr = 'تصعيد الحالة للإدارة العليا ومراجعة المالك';
            eventDescAr = `تم الرفع لصاحب المتجر للموافقة الاستثنائية. مبرر الرفع: ${additionalData?.escalationReason || ''}`;
            eventTitleEn = 'Escalated to Store Owner';
            eventDescEn = `Escalated to management for review. Reason: ${additionalData?.escalationReason || ''}`;
            isInternalEvent = true; // Internal: masked from customer
            break;
          case 'approved':
            eventTitleAr = 'قبول مبدئي ومتابعة الطلب';
            eventDescAr = 'تمت الموافقة المبدئية على طلبكم، وجاري متابعة الخطوات التالية لتسليم المنتج للمستودع.';
            eventTitleEn = 'Approved - Waiting for Pickup';
            eventDescEn = 'Initial approval granted. Processing steps to receive the item at our warehouse.';
            break;
          case 'rejected':
            eventTitleAr = 'رفض الطلب وإغلاقه';
            eventDescAr = 'تم رفض الطلب وتوضيح المبررات التنظيمية للعميل.';
            eventTitleEn = 'Request Rejected';
            eventDescEn = 'Request was rejected. Explanatory details have been provided.';
            break;
          case 'received':
            eventTitleAr = 'استلام المنتج في المستودع';
            const condTextAr = 
              additionalData?.inspection?.condition === 'good_condition' ? 'سليم وبحالة ممتازة' :
              additionalData?.inspection?.condition === 'damaged' ? 'تالف' :
              additionalData?.inspection?.condition === 'used' ? 'مستعمل' :
              additionalData?.inspection?.condition === 'wrong_item' ? 'منتج خاطئ' : 'نقص ملحقات/إكسسوارات';
            eventDescAr = `وصل المنتج للمستودع وتم فحصه. الحالة: ${condTextAr}. تقرير الفحص: ${additionalData?.inspection?.notes || ''}`;
            
            eventTitleEn = 'Item Received in Warehouse';
            const condTextEn = 
              additionalData?.inspection?.condition === 'good_condition' ? 'Excellent (like new)' :
              additionalData?.inspection?.condition === 'damaged' ? 'Damaged' :
              additionalData?.inspection?.condition === 'used' ? 'Used' :
              additionalData?.inspection?.condition === 'wrong_item' ? 'Wrong item' : 'Missing accessories';
            eventDescEn = `Product arrived at warehouse and inspected. Condition: ${condTextEn}. Notes: ${additionalData?.inspection?.notes || ''}`;
            break;
          case 'completed':
            eventTitleAr = 'إكمال الطلب';
            eventDescAr = 'تمت الموافقة النهائية وإكمال معالجة الطلب بنجاح حسب سياسة المتجر.';
            eventTitleEn = 'Request Completed';
            eventDescEn = 'Final approval and processing have been completed according to store policy.';
            break;
          case 'cancelled':
            eventTitleAr = 'إلغاء الطلب';
            eventDescAr = 'تم إلغاء الطلب وإغلاق ملف العملية بشكل نهائي.';
            eventTitleEn = 'Request Cancelled';
            eventDescEn = 'The request has been cancelled and closed permanently.';
            break;
        }

        updatedTimeline.push({
          id: `ev-${Date.now()}`,
          status: newStatus,
          titleAr: eventTitleAr,
          descriptionAr: eventDescAr,
          titleEn: eventTitleEn,
          descriptionEn: eventDescEn,
          createdAt: new Date().toISOString(),
          actorName: lang === 'ar' ? actorNameAr : actorNameEn,
          isInternal: isInternalEvent,
        });

        return {
          ...req,
          status: newStatus,
          internalNotes: additionalData?.internalNotes || req.internalNotes,
          escalationReason: additionalData?.escalationReason || req.escalationReason,
          infoRequestedDetails: additionalData?.infoRequestedDetails || req.infoRequestedDetails,
          inspection: additionalData?.inspection || req.inspection,
          timeline: updatedTimeline,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleUpdateFullRequest = (updatedRequest: CustomerRequest) => {
    setRequests((prev) => prev.map((r) => r.id === updatedRequest.id ? updatedRequest : r));
  };

  return (
    <MotionConfig reducedMotion="user">
      {!splashComplete && (
        <SplashScreen onComplete={() => setSplashComplete(true)} lang={lang} />
      )}
      <AnimatedBackground />
      
      {splashComplete && (
        <div className="min-h-screen bg-transparent flex flex-col font-sans animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* Global Interactive Role Selector Bar */}
          <RoleSelector
            currentArea={currentArea}
            merchantRole={merchantRole}
            onAreaChange={setCurrentArea}
            onMerchantRoleChange={setMerchantRole}
            lang={lang}
            onLangChange={setLang}
          />

          {/* Primary Context Workspace Canvas */}
          <main className="flex-1 relative">
            <AnimatePresence mode="wait">
              {currentArea === 'landing' && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: durationNormal, ease: easePremium }}
                >
                  <LandingPage
                    onStartDemo={() => setCurrentArea('merchant')}
                    lang={lang}
                  />
                </motion.div>
              )}

              {currentArea === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: durationNormal, ease: easePremium }}
                >
                  <AdminPanel
                    stores={stores}
                    requests={requests}
                    onCreateStore={handleCreateStore}
                    onToggleStoreStatus={handleToggleStoreStatus}
                    lang={lang}
                  />
                </motion.div>
              )}

              {currentArea === 'merchant' && (
                <motion.div
                  key="merchant"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: durationNormal, ease: easePremium }}
                  className="flex flex-col gap-4"
                >
                  {/* Sub-view Selector for Auth Prototype Screens */}
                  <div className="bg-stone-100 border-b border-stone-200/60 py-2 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-500 font-medium">
                        {lang === 'ar' ? 'عرض صفحات النموذج الأولي (UI Prototype Pages):' : 'Prototype UI Pages View:'}
                      </span>
                      <div className="flex gap-1.5 relative bg-white border border-stone-200/60 p-1 rounded-lg overflow-x-auto max-w-full flex-nowrap scrollbar-none">
                        {(['dashboard', 'login', 'activate'] as const).map((view) => {
                          const isActive = merchantSubView === view;
                          return (
                            <button
                              key={view}
                              onClick={() => setMerchantSubView(view)}
                              className={`relative px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors duration-200 cursor-pointer z-10 select-none flex-shrink-0 whitespace-nowrap ${
                                isActive ? 'text-white font-bold' : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="activeSubTabIndicator"
                                  className="absolute inset-0 bg-teal-600 rounded-md -z-10 shadow-sm shadow-teal-600/10"
                                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                              )}
                              {view === 'dashboard' && (lang === 'ar' ? 'لوحة تحكم المتجر (Dashboard)' : 'Merchant Dashboard')}
                              {view === 'login' && (lang === 'ar' ? 'تسجيل دخول التاجر (Merchant Login)' : 'Merchant Login')}
                              {view === 'activate' && (lang === 'ar' ? 'تنشيط الحساب (Activate Account)' : 'Activate Account')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {merchantSubView === 'dashboard' && (
                      <motion.div
                        key={`merchant-dashboard-${merchantRole}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: durationNormal, ease: easePremium }}
                      >
                        <MerchantDashboard
                          role={merchantRole}
                          requests={requests.filter(r => r.storeId === 'store-1')} // Filter to Najd Coffee mock for high-fidelity merchant simulation
                          teamMembers={teamMembers}
                          onUpdateRequestStatus={handleUpdateRequestStatus}
                          onUpdateRequest={handleUpdateFullRequest}
                          lang={lang}
                        />
                      </motion.div>
                    )}

                    {merchantSubView === 'login' && (
                      <motion.div
                        key="merchant-login"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: durationNormal, ease: easePremium }}
                        className="py-12 px-4"
                      >
                        <MerchantLoginMock onSuccess={() => setMerchantSubView('dashboard')} lang={lang} />
                      </motion.div>
                    )}

                    {merchantSubView === 'activate' && (
                      <motion.div
                        key="merchant-activate"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: durationNormal, ease: easePremium }}
                        className="py-12 px-4"
                      >
                        <ActivateAccountMock onSuccess={() => setMerchantSubView('dashboard')} lang={lang} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {currentArea === 'customer' && (
                <motion.div
                  key="customer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: durationNormal, ease: easePremium }}
                >
                  <CustomerPortal
                    requests={requests}
                    onSubmitNewRequest={handleAddRequestFromCustomer}
                    onUpdateRequest={handleUpdateFullRequest}
                    lang={lang}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Branded and Aesthetic Footer */}
          <footer className="border-t border-stone-200/50 bg-white py-6 px-4 md:px-8 text-center text-xs text-stone-400 mt-12 select-none">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>
                {lang === 'ar' 
                  ? 'حقوق الطبع والنشر © ٢٠٢٦ منصة حلّها (Hal\'ha SaaS). جميع الحقوق محفوظة.' 
                  : 'Copyright © 2026 Hal\'ha SaaS Platform. All rights reserved.'}
              </p>
              <div className="flex gap-4">
                <span className="hover:text-stone-600 transition-colors cursor-pointer">
                  {lang === 'ar' ? 'اتفاقية استخدام الخدمة' : 'Terms of Service'}
                </span>
                <span className="text-stone-200">|</span>
                <span className="hover:text-stone-600 transition-colors cursor-pointer">
                  {lang === 'ar' ? 'سياسة الخصوصية والأمن المشفر' : 'Privacy & Security Policy'}
                </span>
                <span className="text-stone-200">|</span>
                <span className="hover:text-stone-600 transition-colors cursor-pointer">
                  {lang === 'ar' ? 'بوابة الربط الفني المفتوحة API' : 'Developer Open API Gateway'}
                </span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </MotionConfig>
  );
}
