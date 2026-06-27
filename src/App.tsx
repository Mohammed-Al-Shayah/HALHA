/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { initialStores, initialRequests, initialTeamMembers } from './data/mockData';
import { Store, CustomerRequest, RequestStatus, RequestType, InspectionCondition } from './types';
import RoleSelector from './components/RoleSelector';
import AdminPanel from './components/AdminPanel';
import MerchantDashboard from './components/MerchantDashboard';
import CustomerPortal from './components/CustomerPortal';

export default function App() {
  // Global React state
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [requests, setRequests] = useState<CustomerRequest[]>(initialRequests);
  const [teamMembers] = useState(initialTeamMembers);

  // Active view state
  const [currentArea, setCurrentArea] = useState<'merchant' | 'admin' | 'customer'>('merchant');
  const [merchantRole, setMerchantRole] = useState<'owner' | 'support' | 'warehouse'>('owner');

  // Handle creating a new store (Platform Admin Panel Action)
  const handleCreateStore = (newStoreData: Omit<Store, 'stats' | 'createdAt'>) => {
    const newStore: Store = {
      ...newStoreData,
      createdAt: new Date().toISOString().split('T')[0],
      stats: {
        totalRequests: 0,
        pendingCount: 0,
        escalatedCount: 0,
        avgResolutionHours: 12,
        customerSatisfaction: 100,
      }
    };
    setStores((prev) => [newStore, ...prev]);
  };

  // Toggle store active/suspended status (Platform Admin Action)
  const handleToggleStoreStatus = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) =>
        s.id === storeId
          ? { ...s, status: s.status === 'active' ? 'suspended' : 'active' }
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
          stats: {
            ...s.stats,
            totalRequests: s.stats.totalRequests + 1,
            pendingCount: s.stats.pendingCount + 1,
          }
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
        let eventTitle = '';
        let eventDesc = '';
        let isInternalEvent = false;

        // Determine current actor name
        let actorName = 'النظام (تلقائي)';
        if (currentArea === 'merchant') {
          if (merchantRole === 'owner') actorName = 'عبدالرحمن آل سعود (المالك)';
          else if (merchantRole === 'support') actorName = 'أحمد القحطاني (دعم العملاء)';
          else if (merchantRole === 'warehouse') actorName = 'بندر العتيبي (أخصائي المستودع)';
        }

        // Compile Arabic timeline texts for audit logs
        switch (newStatus) {
          case 'new':
            eventTitle = 'تم إنشاء الطلب';
            eventDesc = 'تم تقديم الطلب بنجاح وهو قيد المراجعة المبدئية.';
            break;
          case 'under_review':
            eventTitle = 'قيد المراجعة والتدقيق';
            eventDesc = 'يجري فحص ودراسة تفاصيل ومرفقات الطلب من فريق الدعم الفني.';
            break;
          case 'waiting_customer_info':
            eventTitle = 'بانتظار معلومات العميل';
            eventDesc = `مطلوب معلومات إضافية من العميل: ${additionalData?.infoRequestedDetails || ''}`;
            break;
          case 'escalated_to_owner':
            eventTitle = 'تصعيد الحالة للإدارة العليا ومراجعة المالك';
            eventDesc = `تم الرفع لصاحب المتجر للموافقة الاستثنائية. مبرر الرفع: ${additionalData?.escalationReason || ''}`;
            isInternalEvent = true; // Internal: masked from customer
            break;
          case 'approved':
            eventTitle = 'قبول مبدئي وتنسيق الشحن';
            eventDesc = 'تمت الموافقة المبدئية على طلبكم، وجاري تنسيق استلام الشحنة العكسية للمستودع.';
            break;
          case 'rejected':
            eventTitle = 'رفض الطلب وإغلاقه بشكل نهائي';
            eventDesc = 'تم رفض طلب التعويض وتوضيح المبررات التنظيمية للعميل.';
            break;
          case 'received':
            eventTitle = 'استلام الشحنة في المستودع';
            const condText = 
              additionalData?.inspection?.condition === 'clean_restock' ? 'سليم وجاهز لإعادة البيع' :
              additionalData?.inspection?.condition === 'damaged_scrap' ? 'تالف وإتلاف فوري' :
              additionalData?.inspection?.condition === 'used_discount' ? 'مستعمل خفيف - تصنيف مخفض' : 'منتج خاطئ';
            eventDesc = `وصل المنتج للمستودع وتم فحصه. الحالة: ${condText}. تقرير الفحص: ${additionalData?.inspection?.notes || ''}`;
            break;
          case 'completed':
            eventTitle = 'اعتماد التسوية وإكمال الطلب';
            eventDesc = 'تمت الموافقة النهائية واعتماد إكمال الإجراء والتسوية المالية/العينية للطلب بنجاح.';
            break;
          case 'cancelled':
            eventTitle = 'إلغاء الطلب';
            eventDesc = 'تم إلغاء الطلب وإغلاق ملف العملية بشكل نهائي.';
            break;
        }

        updatedTimeline.push({
          id: `ev-${Date.now()}`,
          status: newStatus,
          titleAr: eventTitle,
          descriptionAr: eventDesc,
          createdAt: new Date().toISOString(),
          actorName: actorName,
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

    // Dynamic stats adjustments for affected stores
    setStores((prevStores) =>
      prevStores.map((store) => {
        const req = requests.find(r => r.id === requestId);
        if (!req || store.id !== req.storeId) return store;

        let pendingDiff = 0;
        let escalatedDiff = 0;

        const isOldPending = ['new', 'under_review', 'waiting_customer_info', 'approved', 'received'].includes(req.status);
        const isNewPending = ['new', 'under_review', 'waiting_customer_info', 'approved', 'received'].includes(newStatus);
        const isOldEscalated = req.status === 'escalated_to_owner';
        const isNewEscalated = newStatus === 'escalated_to_owner';

        if (isOldPending && !isNewPending) pendingDiff = -1;
        if (!isOldPending && isNewPending) pendingDiff = 1;
        if (isOldEscalated && !isNewEscalated) escalatedDiff = -1;
        if (!isOldEscalated && isNewEscalated) escalatedDiff = 1;

        return {
          ...store,
          stats: {
            ...store.stats,
            pendingCount: Math.max(0, store.stats.pendingCount + pendingDiff),
            escalatedCount: Math.max(0, store.stats.escalatedCount + escalatedDiff),
          }
        };
      })
    );
  };

  const handleUpdateFullRequest = (updatedRequest: CustomerRequest) => {
    setRequests((prev) => prev.map((r) => r.id === updatedRequest.id ? updatedRequest : r));
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
      {/* Global Interactive Role Selector Bar */}
      <RoleSelector
        currentArea={currentArea}
        merchantRole={merchantRole}
        onAreaChange={setCurrentArea}
        onMerchantRoleChange={setMerchantRole}
      />

      {/* Primary Context Workspace Canvas */}
      <main className="flex-1">
        {currentArea === 'admin' && (
          <AdminPanel
            stores={stores}
            requests={requests}
            onCreateStore={handleCreateStore}
            onToggleStoreStatus={handleToggleStoreStatus}
          />
        )}

        {currentArea === 'merchant' && (
          <MerchantDashboard
            role={merchantRole}
            requests={requests.filter(r => r.storeId === 'store-1')} // Filter to Najd Coffee mock for high-fidelity merchant simulation
            teamMembers={teamMembers}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onUpdateRequest={handleUpdateFullRequest}
          />
        )}

        {currentArea === 'customer' && (
          <CustomerPortal
            requests={requests}
            onSubmitNewRequest={handleAddRequestFromCustomer}
            onUpdateRequest={handleUpdateFullRequest}
          />
        )}
      </main>

      {/* Branded and Aesthetic Footer */}
      <footer className="border-t border-stone-200/50 bg-white py-6 px-4 md:px-8 text-center text-xs text-stone-400 mt-12 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            حقوق الطبع والنشر &copy; ٢٠٢٦ منصة حلّها (Hal&#39;ha SaaS). جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <span className="hover:text-stone-600 transition-colors">اتفاقية استخدام الخدمة</span>
            <span className="text-stone-200">|</span>
            <span className="hover:text-stone-600 transition-colors">سياسة الخصوصية والأمن المشفر</span>
            <span className="text-stone-200">|</span>
            <span className="hover:text-stone-600 transition-colors">بوابة الربط الفني المفتوحة API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
