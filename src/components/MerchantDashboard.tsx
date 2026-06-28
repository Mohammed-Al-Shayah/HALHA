/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CustomerRequest, RequestStatus, RequestType, TeamMember, InspectionCondition } from '../types';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  ChevronLeft,
  Filter,
  FileText,
  User,
  Users,
  Settings,
  PackageCheck,
  Search,
  MessageSquare,
  Plus,
  BarChart4,
  RefreshCw,
  Info,
  XCircle,
  Calendar,
  ShieldAlert,
  Copy,
  Check,
  Eye
} from 'lucide-react';

interface MerchantDashboardProps {
  role: 'store_owner' | 'customer_support' | 'warehouse_agent';
  requests: CustomerRequest[];
  teamMembers: TeamMember[];
  onUpdateRequestStatus: (
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
  ) => void;
  onUpdateRequest?: (updatedRequest: CustomerRequest) => void;
}

export default function MerchantDashboard({
  role,
  requests,
  teamMembers,
  onUpdateRequestStatus,
  onUpdateRequest,
}: MerchantDashboardProps) {
  // Navigation tabs based on role
  const [ownerTab, setOwnerTab] = useState<'dashboard' | 'requests' | 'escalated' | 'reports' | 'settings' | 'team'>('dashboard');
  const [supportTab, setSupportTab] = useState<'dashboard' | 'requests'>('dashboard');
  const [warehouseTab, setWarehouseTab] = useState<'dashboard' | 'requests'>('dashboard');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Selected request for details view
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);

  // Form states for support and owner actions
  const [actionNotes, setActionNotes] = useState('');
  const [escalationReasonInput, setEscalationReasonInput] = useState('');
  const [infoRequestInput, setInfoRequestInput] = useState('');
  const [messageToCustomerInput, setMessageToCustomerInput] = useState('');

  // Modals / sub-actions triggers
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [showInfoRequestModal, setShowInfoRequestModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Warehouse Inspection Form States
  const [inspectionCondition, setInspectionCondition] = useState<InspectionCondition>('clean_restock');
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Store Settings (with robust state for previewing the portal)
  const [storeLogo, setStoreLogo] = useState('☕');
  const [storeColor, setStoreColor] = useState('#14b8a6'); // Teal 500
  const [welcomeMessage, setWelcomeMessage] = useState('مرحباً بك في بوابة الدعم والطلبات الخاصة بـ نجد للقهوة المختصة. نحن هنا لضمان رضاك التام.');
  const [returnPolicy, setReturnPolicy] = useState('يحق للعميل طلب استرجاع أو استبدال المنتجات الغذائية (كالحبوب والبن) في حال وصولها تالفة أو غير مطابقة للطلب خلال ٧ أيام من الاستلام. أما الإكسسوارات والأدوات فيمكن استرجاعها بحالتها الأصلية المغلقة خلال ١٥ يوماً.');
  const [settingsWindow, setSettingsWindow] = useState(15);
  const [reasons, setReasons] = useState<string[]>(['وصول تالف / كسر بالعبوة', 'طعم البن قديم / عيب جودة', 'خطأ في نوع بن الحبوب المرسل', 'المقاس / الحجم غير متوافق']);
  const [complaints, setComplaints] = useState<string[]>(['تأخر في التوصيل عن الموعد', 'سوء تعامل شركة الشحن', 'عدم الرد على استفساري', 'مشكلة في الدفع الإلكتروني']);
  
  const [newReasonInput, setNewReasonInput] = useState('');
  const [newComplaintInput, setNewComplaintInput] = useState('');

  // Team Management State
  const [localTeam, setLocalTeam] = useState<TeamMember[]>(teamMembers);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'customer_support' | 'warehouse_agent'>('customer_support');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Simple reports date filter
  const [reportDateFilter, setReportDateFilter] = useState<'all' | '7days' | '30days'>('all');

  // Filter requests list
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.type === typeFilter;

    // Date filtering (mocked based on actual list)
    let matchesDate = true;
    if (reportDateFilter === '7days') {
      matchesDate = req.createdAt >= '2026-06-21';
    } else if (reportDateFilter === '30days') {
      matchesDate = req.createdAt >= '2026-06-01';
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Calculate statistics
  const pendingSupportCount = requests.filter(r => ['new', 'under_review', 'waiting_customer_info'].includes(r.status)).length;
  const escalatedCount = requests.filter(r => r.status === 'escalated_to_owner').length;
  const approvedWarehouseCount = requests.filter(r => r.status === 'approved').length;
  const receivedWarehouseCount = requests.filter(r => r.status === 'received').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  // Handler for adding dynamic notes / internal updates
  const handleAddInternalNote = () => {
    if (!selectedRequest || !actionNotes.trim()) return;

    const updatedRequest = {
      ...selectedRequest,
      internalNotes: selectedRequest.internalNotes 
        ? `${selectedRequest.internalNotes}\n[${new Date().toLocaleDateString('ar-SA')}]: ${actionNotes}`
        : actionNotes,
    };

    if (onUpdateRequest) {
      onUpdateRequest(updatedRequest);
      setSelectedRequest(updatedRequest);
    }
    setActionNotes('');
    alert('تم إضافة الملاحظة الداخلية للموظفين بنجاح!');
  };

  // Handler for sending customer message
  const handleSendCustomerMessage = () => {
    if (!selectedRequest || !messageToCustomerInput.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'store',
      senderName: role === 'store_owner' ? 'إدارة المتجر' : 'الدعم الفني والخدمة',
      content: messageToCustomerInput,
      createdAt: new Date().toISOString(),
    };

    const updatedRequest = {
      ...selectedRequest,
      messages: [...(selectedRequest.messages || []), newMessage],
    };

    if (onUpdateRequest) {
      onUpdateRequest(updatedRequest);
      setSelectedRequest(updatedRequest);
    }
    setMessageToCustomerInput('');
    alert('تم إرسال الرسالة إلى بوابة العميل بنجاح!');
  };

  // Handler for Escalating to Owner
  const handlePerformEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !escalationReasonInput.trim()) return;

    onUpdateRequestStatus(selectedRequest.id, 'escalated_to_owner', {
      escalationReason: escalationReasonInput,
      internalNotes: actionNotes.trim() ? actionNotes : undefined,
    });

    const refreshed = requests.find(r => r.id === selectedRequest.id);
    if (refreshed) {
      setSelectedRequest({
        ...refreshed,
        status: 'escalated_to_owner',
        escalationReason: escalationReasonInput,
      });
    } else {
      setSelectedRequest(null);
    }

    setEscalationReasonInput('');
    setActionNotes('');
    setShowEscalationModal(false);
  };

  // Handler for Requesting Info
  const handlePerformInfoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !infoRequestInput.trim()) return;

    // Send a message to the customer explaining the info request
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'store',
      senderName: 'الدعم الفني والخدمة',
      content: `طلب معلومات إضافية: ${infoRequestInput}`,
      createdAt: new Date().toISOString(),
    };

    onUpdateRequestStatus(selectedRequest.id, 'waiting_customer_info', {
      infoRequestedDetails: infoRequestInput,
      internalNotes: `طلب تزويدنا ببيانات إضافية: ${infoRequestInput}`,
    });

    // Also inject customer message to log
    const updatedRequest = {
      ...selectedRequest,
      status: 'waiting_customer_info' as RequestStatus,
      infoRequestedDetails: infoRequestInput,
      messages: [...(selectedRequest.messages || []), newMessage],
    };

    if (onUpdateRequest) {
      onUpdateRequest(updatedRequest);
      setSelectedRequest(updatedRequest);
    }

    setInfoRequestInput('');
    setShowInfoRequestModal(false);
  };

  // Handler for adding a team member
  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail || !newMemberPhone) return;

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMemberName,
      email: newMemberEmail,
      phone: newMemberPhone,
      role: newMemberRole,
      status: 'pending_activation',
      activationUrl: `${window.location.origin}/activate?member=token-${Math.floor(Math.random() * 9000) + 1000}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLocalTeam([newMember, ...localTeam]);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberPhone('');
    setShowAddMemberModal(false);
    alert('تم تسجيل الموظف الجديد بنجاح في وضع "بانتظار التنشيط". يمكنك نسخ الرابط لإرساله له.');
  };

  // Copy Activation link
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Toggle member status
  const handleToggleMemberStatus = (id: string) => {
    setLocalTeam(prev => prev.map(m => {
      if (m.id !== id) return m;
      const nextStatus = m.status === 'active' ? 'disabled' : 'active';
      return { ...m, status: nextStatus };
    }));
  };

  // Dynamic Add reason & complaint
  const handleAddReason = () => {
    if (!newReasonInput.trim()) return;
    setReasons([...reasons, newReasonInput.trim()]);
    setNewReasonInput('');
  };

  const handleAddComplaint = () => {
    if (!newComplaintInput.trim()) return;
    setComplaints([...complaints, newComplaintInput.trim()]);
    setNewComplaintInput('');
  };

  // Status Badge Helper
  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200/50 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            طلب جديد
          </span>
        );
      case 'under_review':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200/50 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            قيد المراجعة - الدعم
          </span>
        );
      case 'waiting_customer_info':
        return (
          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200/50 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
            بانتظار معلومات العميل
          </span>
        );
      case 'escalated_to_owner':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
            مصعّد للمالك
          </span>
        );
      case 'approved':
        return (
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/50 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            مقبول وبانتظار الشحن
          </span>
        );
      case 'received':
        return (
          <span className="bg-sky-50 text-sky-700 border border-sky-200/50 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
            مستلم بالمستودع
          </span>
        );
      case 'completed':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/30 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
            مكتمل ومسوى
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-stone-500 rounded-full"></span>
            مرفوض ومغلق
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-stone-50 text-stone-400 border border-stone-200 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-stone-300 rounded-full"></span>
            ملغي
          </span>
        );
    }
  };

  // Type Badge Helper
  const getTypeBadge = (type: RequestType) => {
    switch (type) {
      case 'return':
        return <span className="text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200/30 rounded text-[10px] font-bold">إرجاع منتج</span>;
      case 'exchange':
        return <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 border border-indigo-200/30 rounded text-[10px] font-bold">استبدال مقاس/لون</span>;
      case 'complaint':
        return <span className="text-rose-700 bg-rose-50 px-2 py-0.5 border border-rose-200/30 rounded text-[10px] font-bold">بلاغ / شكوى</span>;
    }
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen" dir="rtl">
      
      {/* Sub navigation bar sticky */}
      <div className="bg-white border-b border-stone-200 sticky top-14 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl bg-stone-50 p-2 rounded-xl border border-stone-200/50">{storeLogo}</span>
            <div>
              <h2 className="text-base font-bold text-stone-900">نجد للقهوة المختصة</h2>
              <p className="text-[11px] text-stone-400 font-medium">لوحة المالك والدعم الفني للمتجر &bull; وضع تداول مباشر</p>
            </div>
          </div>

          {/* Context Tab options based on role */}
          <div className="flex flex-wrap gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200/50">
            {role === 'store_owner' && (
              <>
                <button
                  onClick={() => { setOwnerTab('dashboard'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${ownerTab === 'dashboard' && !selectedRequest ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  لوحة المالك
                </button>
                <button
                  onClick={() => { setOwnerTab('requests'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${ownerTab === 'requests' && !selectedRequest ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  الطلبات ({requests.length})
                </button>
                <button
                  onClick={() => { setOwnerTab('escalated'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${ownerTab === 'escalated' && !selectedRequest ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  <span>مصعّدة للمالك</span>
                  {escalatedCount > 0 && (
                    <span className="bg-rose-500 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {escalatedCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setOwnerTab('reports'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${ownerTab === 'reports' && !selectedRequest ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  تقارير الأداء
                </button>
                <button
                  onClick={() => { setOwnerTab('settings'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${ownerTab === 'settings' && !selectedRequest ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  تهيئة البوابة
                </button>
                <button
                  onClick={() => { setOwnerTab('team'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${ownerTab === 'team' && !selectedRequest ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  الفريق ({localTeam.length})
                </button>
              </>
            )}

            {role === 'customer_support' && (
              <>
                <button
                  onClick={() => { setSupportTab('dashboard'); setSelectedRequest(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${supportTab === 'dashboard' && !selectedRequest ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  لوحة الخدمة
                </button>
                <button
                  onClick={() => { setSupportTab('requests'); setSelectedRequest(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${supportTab === 'requests' && !selectedRequest ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  <span>مراجعة الطلبات</span>
                  {pendingSupportCount > 0 && (
                    <span className="bg-amber-500 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {pendingSupportCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {role === 'warehouse_agent' && (
              <>
                <button
                  onClick={() => { setWarehouseTab('dashboard'); setSelectedRequest(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${warehouseTab === 'dashboard' && !selectedRequest ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  حالة المخزن
                </button>
                <button
                  onClick={() => { setWarehouseTab('requests'); setSelectedRequest(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${warehouseTab === 'requests' && !selectedRequest ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  <span>استلام وتفتيش المرتجعات</span>
                  {(approvedWarehouseCount + receivedWarehouseCount) > 0 && (
                    <span className="bg-indigo-600 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {approvedWarehouseCount + receivedWarehouseCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Container Frame */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {selectedRequest ? (
          /* ========================================================================= */
          /* REQUEST DETAIL SUBVIEW */
          /* ========================================================================= */
          <div className="space-y-6">
            <button
              onClick={() => setSelectedRequest(null)}
              className="text-stone-500 hover:text-stone-900 text-xs font-medium flex items-center gap-1 bg-white hover:bg-stone-50 px-3 py-2 rounded-lg border border-stone-200/60 w-fit transition cursor-pointer"
            >
              <span>&rarr; العودة لقائمة الطلبات</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer summary / metadata */}
              <div className="bg-white p-6 border border-stone-200 rounded-2xl shadow-xs space-y-6 h-fit">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] text-stone-400 font-mono">رقم تتبع حلّها</span>
                    <h3 className="text-base font-bold text-stone-900 font-mono">{selectedRequest.id}</h3>
                  </div>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">العميل</span>
                    <span className="font-bold text-stone-800">{selectedRequest.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">رقم الهاتف</span>
                    <span className="font-mono text-stone-700" dir="ltr">{selectedRequest.customerPhone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">البريد الإلكتروني</span>
                    <span className="font-mono text-stone-700">{selectedRequest.customerEmail}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-stone-100 pt-3">
                    <span className="text-stone-400">رقم الطلب الأصلي</span>
                    <span className="font-mono text-stone-800 font-bold">{selectedRequest.orderNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">نوع العملية</span>
                    {getTypeBadge(selectedRequest.type)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">تاريخ التقديم</span>
                    <span className="font-mono text-stone-500">{selectedRequest.createdAt}</span>
                  </div>
                </div>

                {/* File / Images Attachment */}
                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div className="pt-4 border-t border-stone-100 space-y-2">
                    <span className="block text-xs font-bold text-stone-700">الصور والمرفقات المرفقة:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedRequest.images.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noreferrer" className="group relative block aspect-square rounded-lg border border-stone-200 overflow-hidden bg-stone-50">
                          <img src={img} alt="مرفق العميل" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <span className="absolute bottom-1 right-1 bg-stone-900/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">معاينة ↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Items details / messaging */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Product details card */}
                <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">تفاصيل المنتجات والمشكلة المطروحة</h4>
                  
                  <div className="divide-y divide-stone-100">
                    {selectedRequest.items.map((item) => (
                      <div key={item.id} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-16 h-16 object-cover rounded-xl border border-stone-200 shrink-0" />
                        ) : (
                          <div className="w-16 h-16 bg-stone-100 border border-stone-200 text-stone-400 rounded-xl flex items-center justify-center shrink-0 text-2xl font-bold">📦</div>
                        )}
                        <div className="space-y-1 w-full">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-stone-900">{item.name}</p>
                            <span className="text-xs font-bold text-stone-700 font-mono">{item.price} ر.س</span>
                          </div>
                          <p className="text-[10px] text-stone-500 font-mono">رمز السلعة: {item.sku} &bull; الكمية المطلوبة: {item.quantity}</p>
                          
                          {/* Specific exchange fields */}
                          {(item.sizeDesired || item.colorDesired) && (
                            <p className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded w-fit font-bold">
                              المقاس/اللون المطلوب البديل: {item.sizeDesired || 'القياسي'} - {item.colorDesired || 'الافتراضي'}
                            </p>
                          )}

                          <div className="bg-[#fbfaf8] border border-stone-200/50 p-2.5 rounded-lg mt-2">
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">سبب أو شرح العميل:</span>
                            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">{item.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Specific complaint details */}
                  {selectedRequest.complaintType && (
                    <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl mt-4">
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/40 px-2 py-0.5 rounded">تصنيف الشكوى المختار: {selectedRequest.complaintType}</span>
                      {selectedRequest.problemDetails && (
                        <p className="text-xs text-rose-900 mt-2 leading-relaxed">{selectedRequest.problemDetails}</p>
                      )}
                    </div>
                  )}

                  {selectedRequest.additionalNotes && (
                    <div className="bg-stone-50 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-stone-500">ملاحظات العميل الإضافية:</span>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">{selectedRequest.additionalNotes}</p>
                    </div>
                  )}
                </div>

                {/* Warehouse Inspection Outcome (if inspected) */}
                {selectedRequest.inspection && (
                  <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs space-y-3">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1">
                        <PackageCheck className="w-4 h-4 text-indigo-600" />
                        <span>تقرير تفتيش وفحص المستودع الفعلي</span>
                      </h4>
                      <span className="text-[10px] text-stone-400 font-mono">بواسطة: {selectedRequest.inspection.inspectedBy}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500 font-medium">حالة السلعة المفحوصة:</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          selectedRequest.inspection.condition === 'clean_restock'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : selectedRequest.inspection.condition === 'used_discount'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : selectedRequest.inspection.condition === 'wrong_item'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {selectedRequest.inspection.condition === 'clean_restock' && 'ممتازة - تعاد مباشرة للرفوف'}
                          {selectedRequest.inspection.condition === 'used_discount' && 'بها عيب بسيط - بيع مخفض'}
                          {selectedRequest.inspection.condition === 'wrong_item' && 'منتج خاطئ - سيتم إعادته للعميل'}
                          {selectedRequest.inspection.condition === 'damaged_scrap' && 'تالفة كلياً - إتلاف وتخريد'}
                        </span>
                      </div>
                      <div className="text-xs bg-stone-50 p-2.5 rounded-lg text-stone-700 leading-relaxed font-mono">
                        {selectedRequest.inspection.notes || 'لا توجد ملاحظات تفتيش إضافية'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contextual actions block based on role */}
                <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-stone-900">إجراءات فريق العمل المتاحة على هذا الطلب</h4>
                  
                  {/* SUPPORT ACTIONS */}
                  {role === 'customer_support' && (
                    <div className="space-y-4">
                      {['new', 'under_review'].includes(selectedRequest.status) && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={() => {
                              onUpdateRequestStatus(selectedRequest.id, 'approved', {
                                internalNotes: actionNotes ? actionNotes : 'تمت الموافقة المبدئية وتوجيه المنتج للمستودع للتقييم.'
                              });
                              setSelectedRequest({ ...selectedRequest, status: 'approved' });
                              setActionNotes('');
                              alert('تمت الموافقة المبدئية بنجاح! تم قبول الطلب مبدئياً وتوجيهه للمستودع للفحص والتقييم.');
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                          >
                            قبول مبدئي للطلب وتوجيهه للمستودع
                          </button>

                          <button
                            onClick={() => {
                              onUpdateRequestStatus(selectedRequest.id, 'rejected', {
                                internalNotes: actionNotes ? actionNotes : 'تم رفض الطلب لعدم تطابق الشروط سياسة المتجر.'
                              });
                              setSelectedRequest({ ...selectedRequest, status: 'rejected' });
                              setActionNotes('');
                              alert('تم رفض الطلب رسمياً وإخطار العميل عبر البوابة بالسبب.');
                            }}
                            className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                          >
                            رفض وإغلاق الطلب
                          </button>

                          <button
                            onClick={() => setShowInfoRequestModal(true)}
                            className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                          >
                            طلب معلومات من العميل
                          </button>

                          <button
                            onClick={() => setShowEscalationModal(true)}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                          >
                            تصعّيد للإدارة العليا (المالك)
                          </button>
                        </div>
                      )}

                      {selectedRequest.status === 'waiting_customer_info' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onUpdateRequestStatus(selectedRequest.id, 'under_review', {
                                internalNotes: 'استئناف المراجعة اليدوية بعد الرد.'
                              });
                              setSelectedRequest({ ...selectedRequest, status: 'under_review' });
                              alert('تم نقل الحالة إلى "تحت المراجعة والتدقيق" لاستئناف الفحص.');
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                          >
                            استئناف المراجعة اليدوية (تحت التدقيق)
                          </button>
                        </div>
                      )}

                      {/* Fallback info */}
                      {!['new', 'under_review', 'waiting_customer_info'].includes(selectedRequest.status) && (
                        <p className="text-xs text-stone-400 font-medium">هذا الطلب خارج مراحل التدقيق الفني للدعم حالياً ({selectedRequest.status}).</p>
                      )}
                    </div>
                  )}

                  {/* OWNER ACTIONS FOR ESCALATED REQUESTS */}
                  {role === 'store_owner' && (
                    <div className="space-y-4">
                      {selectedRequest.status === 'escalated_to_owner' && (
                        <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-rose-700 uppercase">تصعيد عالي الأهمية</span>
                            <p className="text-xs text-rose-950 font-bold">أوصى ممثل الدعم بتدخل المالك للسبب التالي:</p>
                            <p className="text-xs text-rose-800 leading-relaxed font-mono">"{selectedRequest.escalationReason || 'لا يوجد سبب مفصل'}"</p>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => {
                                onUpdateRequestStatus(selectedRequest.id, 'approved', {
                                  internalNotes: 'قرار المالك النهائي: موافقة كاملة بعد التصعيد.'
                                });
                                setSelectedRequest({ ...selectedRequest, status: 'approved' });
                                alert('تمت الموافقة على الطلب بقرار من المالك!');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                            >
                              قرار المالك: موافقة واعتماد الطلب
                            </button>

                            <button
                              onClick={() => {
                                onUpdateRequestStatus(selectedRequest.id, 'rejected', {
                                  internalNotes: 'قرار المالك النهائي: رفض وتأكيد إغلاق بعد التصعيد.'
                                });
                                setSelectedRequest({ ...selectedRequest, status: 'rejected' });
                                alert('تم رفض الطلب بشكل قطعي من إدارة المتجر.');
                              }}
                              className="bg-rose-700 hover:bg-rose-850 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                            >
                              قرار المالك: رفض نهائي ومغلق
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Direct settlement for received returns by Owner */}
                      {selectedRequest.status === 'received' && (
                        <div className="p-4 bg-teal-50/40 border border-teal-100 rounded-xl space-y-3">
                          <p className="text-xs text-teal-950 font-bold">تم فحص السلعة في المستودع بنجاح. بصفتك مالك المتجر، يرجى إجراء المراجعة النهائية للطلب وإكماله:</p>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                onUpdateRequestStatus(selectedRequest.id, 'completed', {
                                  internalNotes: 'قرار المالك النهائي: إكمال ومعالجة الطلب بالكامل.'
                                });
                                setSelectedRequest({ ...selectedRequest, status: 'completed' });
                                alert('تم إكمال الطلب بنجاح وإغلاقه بنظام حلّها!');
                              }}
                              className="bg-teal-700 hover:bg-teal-900 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                            >
                              إكمال ومعالجة الطلب (Completed)
                            </button>

                            <button
                              onClick={() => {
                                onUpdateRequestStatus(selectedRequest.id, 'rejected', {
                                  internalNotes: 'قرار المالك النهائي: الرفض النهائي بعد استلام وفحص المنتج.'
                                });
                                setSelectedRequest({ ...selectedRequest, status: 'rejected' });
                                alert('تم رفض الطلب نهائياً بعد الفحص.');
                              }}
                              className="bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                            >
                              رفض الطلب بعد المراجعة
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedRequest.status !== 'escalated_to_owner' && selectedRequest.status !== 'received' && (
                        <p className="text-xs text-stone-400">كمالك للمتجر، الصلاحيات الإدارية الكاملة جارية. لم يرفع هذا الطلب للتصعيد أو التسوية الفورية حالياً.</p>
                      )}
                    </div>
                  )}

                  {/* WAREHOUSE ACTIONS */}
                  {role === 'warehouse_agent' && (
                    <div className="space-y-4">
                      {selectedRequest.status === 'approved' && (
                        <div className="space-y-2">
                          <p className="text-xs text-stone-600 font-medium">المنتج لم يصل المستودع فعلياً بعد، عند استلام الطرد يرجى تأكيد الاستلام الفعلي للبدء بالفحص:</p>
                          <button
                            onClick={() => {
                              onUpdateRequestStatus(selectedRequest.id, 'received', {
                                internalNotes: 'أكد المستودع وصول الطرد وبدء الفحص الفني.'
                              });
                              setSelectedRequest({ ...selectedRequest, status: 'received' });
                              alert('تم تسجيل استلام المنتج في المستودع! يرجى البدء في تعبئة استمارة التفتيش لتسجيل حالة السلعة.');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                          >
                            تأكيد استلام المنتج والبدء في الفحص
                          </button>
                        </div>
                      )}

                      {selectedRequest.status === 'received' && (
                        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                          <h5 className="text-xs font-bold text-stone-900 border-b border-stone-100 pb-1.5">تعبئة استمارة تفتيش جودة السلعة الراجعة</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 mb-1">حالة السلعة المادية</label>
                              <select
                                value={inspectionCondition}
                                onChange={(e) => setInspectionCondition(e.target.value as InspectionCondition)}
                                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                              >
                                <option value="good_condition">ممتازة (بحالة جديدة للرفوف)</option>
                                <option value="used">مستخدم (به آثار استخدام خفيفة)</option>
                                <option value="damaged">تالف (به تلفيات أو كسور واضحة)</option>
                                <option value="wrong_item">منتج خاطئ (غير مطابق للسلعة الأصلية)</option>
                                <option value="missing_accessories">نقص ملحقات (العناصر المرفقة ناقصة)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 mb-1">ملاحظات الفحص والعيوب الفعليّة</label>
                              <input
                                type="text"
                                value={inspectionNotes}
                                onChange={(e) => setInspectionNotes(e.target.value)}
                                placeholder="مثال: الغلاف مفتوح، السلعة سليمة وبكامل الملحقات..."
                                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stone-200/50 mt-2">
                            <button
                              onClick={() => {
                                onUpdateRequestStatus(selectedRequest.id, 'under_review', {
                                  internalNotes: 'أنهى المستودع تفتيش المنتج وسجل نتيجتها في النظام.',
                                  inspection: {
                                    inspectedBy: 'بندر العتيبي (أخصائي المستودع)',
                                    inspectedAt: new Date().toISOString().split('T')[0],
                                    condition: inspectionCondition,
                                    notes: inspectionNotes || 'تطابق كامل للمواصفات.'
                                  }
                                });
                                
                                const refreshed = requests.find(r => r.id === selectedRequest.id);
                                if (refreshed) {
                                  setSelectedRequest({
                                    ...refreshed,
                                    status: 'under_review',
                                    inspection: {
                                      inspectedBy: 'بندر العتيبي (أخصائي المستودع)',
                                      inspectedAt: new Date().toISOString().split('T')[0],
                                      condition: inspectionCondition,
                                      notes: inspectionNotes || 'تطابق كامل للمواصفات.'
                                    }
                                  });
                                } else {
                                  setSelectedRequest(null);
                                }
                                setInspectionNotes('');
                                alert('تم إرسال استمارة تفتيش المستودع بنجاح وتحويل الطلب للمراجعة النهائية للدعم الفني!');
                              }}
                              className="bg-indigo-700 hover:bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition flex-1"
                            >
                              تأكيد فحص السلعة واستلامها (Confirm Inspection & Receipt)
                            </button>

                            <button
                              onClick={() => {
                                onUpdateRequestStatus(selectedRequest.id, 'under_review', {
                                  internalNotes: 'أعاد أخصائي المستودع الطلب لممثلي الدعم للمراجعة والتدقيق الإضافي.'
                                });
                                const newEvent = {
                                  id: `ev-${Date.now()}`,
                                  status: 'under_review' as RequestStatus,
                                  titleAr: 'قيد المراجعة والتدقيق',
                                  descriptionAr: 'أعاد أخصائي المستودع الطلب لممثلي الدعم للمراجعة والتدقيق الإضافي.',
                                  createdAt: new Date().toISOString(),
                                  actorName: 'بندر العتيبي (أخصائي المستودع)',
                                  isInternal: false,
                                };
                                const updatedTimeline = selectedRequest.timeline ? [...selectedRequest.timeline, newEvent] : [newEvent];
                                setSelectedRequest({ 
                                  ...selectedRequest, 
                                  status: 'under_review',
                                  internalNotes: 'أعاد أخصائي المستودع الطلب لممثلي الدعم للمراجعة والتدقيق الإضافي.',
                                  timeline: updatedTimeline,
                                  updatedAt: new Date().toISOString(),
                                });
                                alert('تمت إعادة الطلب للمراجعة من الدعم وتغيير الحالة بنجاح!');
                              }}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                            >
                              إرجاع للدعم للمراجعة
                            </button>
                          </div>
                        </div>
                      )}

                      {!['approved', 'received'].includes(selectedRequest.status) && (
                        <p className="text-xs text-stone-400">أنت في "وضع المستودع الفني". لا توجد إجراءات متاحة لك على هذا الطلب وهو بهذه الحالة التشغيلية ({selectedRequest.status}).</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Unified messaging tabs between customer messages and internal notes */}
                <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                    <h4 className="text-xs font-bold text-stone-900">سجل تواصل العميل والتعليقات الداخلية (أمان كامل)</h4>
                    <span className="text-[10px] text-stone-400 font-mono">حلّها MVP Communication Logs</span>
                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-stone-100">
                    
                    {/* Customer Messages (Viewable by customer in portal) */}
                    <div className="space-y-4 pb-4 md:pb-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                          <MessageSquare className="w-4 h-4 text-teal-600" />
                          <span>الرسائل مع العميل (بوابة العميل)</span>
                        </span>
                        <span className="text-[9px] text-stone-400 font-bold bg-stone-100 px-1.5 py-0.5 rounded">مظهرة للمشتري</span>
                      </div>

                      <div className="bg-[#fcfcfb] border border-stone-200/50 rounded-xl p-3 h-48 overflow-y-auto space-y-3">
                        {selectedRequest.messages && selectedRequest.messages.length > 0 ? (
                          selectedRequest.messages.map((msg) => (
                            <div key={msg.id} className={`p-2.5 rounded-xl max-w-[85%] text-xs ${
                              msg.sender === 'customer' 
                              ? 'bg-stone-200 text-stone-900 ml-auto' 
                              : 'bg-teal-50 text-teal-950 mr-auto border border-teal-100/60'
                            }`}>
                              <p className="font-bold text-[9px] mb-1 text-stone-500">{msg.senderName}</p>
                              <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                            </div>
                          ))
                        ) : (
                          <div className="h-full flex items-center justify-center text-stone-400 text-center">
                            <p className="text-[11px]">لم يتم تبادل أي رسائل أو استفسارات مع العميل حتى الآن.</p>
                          </div>
                        )}
                      </div>

                      {/* Messaging Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageToCustomerInput}
                          onChange={(e) => setMessageToCustomerInput(e.target.value)}
                          placeholder="اكتب رسالة للعميل تظهر في بوابته..."
                          className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8]"
                        />
                        <button
                          onClick={handleSendCustomerMessage}
                          className="px-3 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 cursor-pointer"
                        >
                          إرسال
                        </button>
                      </div>
                    </div>

                    {/* Internal Notes (Strictly hidden from customer) */}
                    <div className="space-y-4 pt-4 md:pt-0 pl-0 md:pr-6">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>سجل الملاحظات الداخلية والعملياتية</span>
                        </span>
                        <span className="text-[9px] text-rose-600 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">مخفية تماماً عن العميل</span>
                      </div>

                      <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3 h-48 overflow-y-auto font-mono text-[11px] text-stone-600 space-y-2 whitespace-pre-line leading-relaxed">
                        {selectedRequest.internalNotes ? (
                          selectedRequest.internalNotes
                        ) : (
                          <span className="text-stone-400 block text-center pt-16">لا توجد ملاحظات داخلية سرية مسجلة بعد.</span>
                        )}
                      </div>

                      {/* Internal Notes Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          placeholder="ملاحظة للفحص أو الإدارة فقط..."
                          className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                        />
                        <button
                          onClick={handleAddInternalNote}
                          className="px-3 py-2 bg-stone-950 text-white text-xs font-bold rounded-xl hover:bg-stone-800 cursor-pointer"
                        >
                          حفظ
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Audit Timeline Logs (External Timeline mask) */}
                <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
                  <h4 className="text-xs font-bold text-stone-900 border-b border-stone-100 pb-2 mb-4">سجل الأحداث والمتابعة الزمني (Timeline)</h4>
                  
                  <div className="space-y-4 font-medium">
                    {selectedRequest.timeline && selectedRequest.timeline.map((event, idx) => (
                      <div key={event.id || idx} className="flex gap-3 text-xs items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></div>
                        <div className="space-y-0.5">
                          {/* Timeline mask logic for escalated_to_owner status */}
                          <p className="text-stone-800 font-bold">
                            {event.status === 'escalated_to_owner' 
                              ? 'تم مراجعة طلبك وتوجيهه إلى قسم المتابعة الإدارية العليا لتسريع المعالجة.' 
                              : event.description}
                          </p>
                          <p className="text-[10px] text-stone-400 font-mono">بواسطة: {event.actor} &bull; {event.createdAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* ROLE BASED TAB NAVIGATION (DASHBOARD VIEWS) */
          /* ========================================================================= */
          <>
            {/* 1. STORE OWNER WORKSPACE VIEW */}
            {role === 'store_owner' && (
              <>
                {ownerTab === 'dashboard' && (
                  <div className="space-y-8">
                    {/* Metrics grid (no financial MRR stuff!) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
                        <span className="text-stone-400 text-xs font-medium">إجمالي الحالات المستلمة</span>
                        <p className="text-3xl font-bold font-mono text-stone-900 mt-1">{requests.length}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 mt-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{completedCount} حالة منتهية ومكتملة</span>
                        </div>
                      </div>

                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
                        <span className="text-stone-400 text-xs font-medium">حالات بانتظار معالجة الدعم</span>
                        <p className="text-3xl font-bold font-mono text-amber-600 mt-1">{pendingSupportCount}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-2">
                          <span>طابور فحص الدعم الفني</span>
                        </div>
                      </div>

                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
                        <span className="text-stone-400 text-xs font-medium">حالات مصعّدة ومرفوعة لك</span>
                        <p className="text-3xl font-bold font-mono text-rose-600 mt-1">{escalatedCount}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-rose-600 mt-2">
                          <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                          <span>تتطلب قرارك الإداري الفوري</span>
                        </div>
                      </div>

                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
                        <span className="text-stone-400 text-xs font-medium">مرتجعات بالمخزن بانتظار الفحص</span>
                        <p className="text-3xl font-bold font-mono text-indigo-600 mt-1">{approvedWarehouseCount}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-2">
                          <span>{receivedWarehouseCount} طرد تم استلامه فعلياً</span>
                        </div>
                      </div>
                    </div>

                    {/* Overview layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-8 bg-white p-5 border border-stone-200 rounded-2xl shadow-xs space-y-4">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide border-b border-stone-100 pb-2">طلبات مصعّدة للإدارة العليا بانتظار حسمك</h3>
                        
                        {escalatedCount > 0 ? (
                          <div className="divide-y divide-stone-100 font-medium">
                            {requests.filter(r => r.status === 'escalated_to_owner').map((req) => (
                              <div key={req.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-stone-900 font-mono">{req.id}</span>
                                    <span className="text-stone-300 text-[10px]">&bull;</span>
                                    <span className="text-xs text-stone-600">{req.customerName}</span>
                                  </div>
                                  <p className="text-[11px] text-stone-400 leading-relaxed font-mono">سبب التصعيد: "{req.escalationReason}"</p>
                                </div>
                                <button
                                  onClick={() => setSelectedRequest(req)}
                                  className="px-3 py-1.5 text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 font-bold"
                                >
                                  حسم القرار والاطلاع
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 text-center text-stone-400 space-y-2">
                            <span className="text-3xl">🎉</span>
                            <h4 className="text-xs font-bold text-stone-800">لا توجد حالات مصعدة للمالك حالياً</h4>
                            <p className="text-[11px] text-stone-500">فريق الدعم الفني يعالج جميع الطلبات الاعتيادية بكفاءة متناهية.</p>
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-4 bg-white p-5 border border-stone-200 rounded-2xl shadow-xs space-y-4">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide border-b border-stone-100 pb-2">حالة بوابة العملاء</h3>
                        
                        <div className="space-y-4">
                          <p className="text-xs text-stone-600 leading-relaxed font-medium">بوابتك للعملاء جاهزة تماماً ومحدثة في حلّها. يمكن لمشترين متجرك الدخول فوراً ببياناتهم.</p>
                          
                          <div className="p-3 bg-stone-50 rounded-xl space-y-1 text-xs">
                            <span className="text-[10px] text-stone-400 font-mono">رابط البوابة العامة للعميل</span>
                            <p className="font-mono text-[11px] text-stone-700 bg-white p-2 border border-stone-200 rounded break-all text-left" dir="ltr">
                              {window.location.origin}/store/najd-coffee
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <a 
                              href={`${window.location.origin}/store/najd-coffee`}
                              target="_blank" 
                              rel="noreferrer"
                              className="flex-1 text-center py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              افتح مساحة العميل ↗
                            </a>
                            <button
                              onClick={() => setShowPreviewModal(true)}
                              className="flex-1 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              معاينة إعدادات البوابة
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ownerTab === 'requests' && (
                  <div className="space-y-4">
                    {/* Search / Filters for Owner */}
                    <div className="bg-white p-4 border border-stone-200 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="relative w-full md:max-w-xs">
                        <span className="absolute right-3 top-2.5 text-stone-400"><Search className="w-4 h-4" /></span>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="ابحث بالرقم، الاسم، الرمز..."
                          className="w-full pr-9 pl-3 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                        />
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="flex-1 md:flex-none px-3 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                        >
                          <option value="all">كل الحالات التشغيلية</option>
                          <option value="new">جديد</option>
                          <option value="under_review">قيد التدقيق</option>
                          <option value="waiting_customer_info">بانتظار معلومات العميل</option>
                          <option value="escalated_to_owner">مصعّد للمالك</option>
                          <option value="approved">مقبول - بانتظار الشحن</option>
                          <option value="received">مستلم بالمستودع</option>
                          <option value="completed">مكتمل</option>
                          <option value="rejected">مرفوض</option>
                          <option value="cancelled">ملغي</option>
                        </select>

                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="flex-1 md:flex-none px-3 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                        >
                          <option value="all">كل الأنواع</option>
                          <option value="return">إرجاع</option>
                          <option value="exchange">استبدال</option>
                          <option value="complaint">بلاغات وشكاوى</option>
                        </select>
                      </div>
                    </div>

                    {/* Requests list table */}
                    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
                      <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                        <h4 className="text-xs font-bold text-stone-900">سجلات تذاكر متجرك الجارية ({filteredRequests.length} تذكرة)</h4>
                      </div>

                      {filteredRequests.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-stone-50 border-b border-stone-200/50 text-stone-400 font-semibold">
                              <tr>
                                <th className="px-6 py-4">رقم تتبع حلّها</th>
                                <th className="px-6 py-4">العميل</th>
                                <th className="px-6 py-4">رقم الطلب الأصلي</th>
                                <th className="px-6 py-4">النوع والسلعة</th>
                                <th className="px-6 py-4">تاريخ التقديم</th>
                                <th className="px-6 py-4">حالة المعالجة</th>
                                <th className="px-6 py-4 text-center">التدقيق</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                              {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-stone-50/50 transition">
                                  <td className="px-6 py-4.5 font-bold text-stone-900 font-mono">{req.id}</td>
                                  <td className="px-6 py-4.5">
                                    <p className="font-bold text-stone-900">{req.customerName}</p>
                                    <p className="text-[10px] text-stone-400 font-mono mt-0.5" dir="ltr">{req.customerPhone}</p>
                                  </td>
                                  <td className="px-6 py-4.5 font-mono text-stone-800 font-bold">{req.orderNumber}</td>
                                  <td className="px-6 py-4.5">
                                    <div className="flex flex-col gap-1 items-start">
                                      {getTypeBadge(req.type)}
                                      <span className="text-[10px] text-stone-500 line-clamp-1 max-w-xs">{req.items[0]?.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4.5 font-mono text-stone-500">{req.createdAt}</td>
                                  <td className="px-6 py-4.5">{getStatusBadge(req.status)}</td>
                                  <td className="px-6 py-4.5 text-center">
                                    <button
                                      onClick={() => setSelectedRequest(req)}
                                      className="px-3 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-bold cursor-pointer transition"
                                    >
                                      عرض التفاصيل
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-16 text-center text-stone-400 space-y-3">
                          <span className="text-5xl">📭</span>
                          <h4 className="text-sm font-bold text-stone-800">لا توجد سجلات مطابقة لمعايير البحث</h4>
                          <p className="text-xs text-stone-500">حاول تعديل فلاتر التصفية أو المدخلات.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {ownerTab === 'escalated' && (
                  <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-stone-900">الالتباسات والطلبات المصعّدة لمكتب المالك مباشرة</h3>
                    <p className="text-xs text-stone-500">حالات تتطلب تدقيقاً وموافقة مباشرة من مالك المتجر لاتخاذ القرار حسب سياسة المتجر.</p>

                    <div className="divide-y divide-stone-100 font-medium">
                      {requests.filter(r => r.status === 'escalated_to_owner').map((req) => (
                        <div key={req.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-900 font-mono">{req.id}</span>
                              <span className="text-stone-300 text-[10px]">&bull;</span>
                              <span className="text-xs font-bold text-stone-700">{req.customerName}</span>
                              <span className="text-stone-300 text-[10px]">&bull;</span>
                              {getTypeBadge(req.type)}
                            </div>
                            <p className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg mt-2 w-fit font-mono">
                              سبب التصعيد: {req.escalationReason}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold transition cursor-pointer"
                          >
                            مراجعة وحسم القرار
                          </button>
                        </div>
                      ))}

                      {requests.filter(r => r.status === 'escalated_to_owner').length === 0 && (
                        <div className="py-12 text-center text-stone-400 space-y-2">
                          <span className="text-3xl">🌿</span>
                          <h4 className="text-xs font-bold text-stone-800">كل شيء هادئ!</h4>
                          <p className="text-[11px] text-stone-500">لم يتم تصعيد أي حالات إضافية للمالك لليوم.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {ownerTab === 'reports' && (
                  <div className="space-y-6">
                    {/* Simple Date Filter */}
                    <div className="bg-white p-4 border border-stone-200 rounded-2xl shadow-xs flex flex-wrap gap-3 items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-stone-900">تقارير أداء المتجر والعمليات</h3>
                        <p className="text-[10px] text-stone-400 mt-0.5">مراقبة جودة المنتجات وحجم تذاكر الخدمة دورياً.</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setReportDateFilter('all')}
                          className={`px-3 py-1 bg-stone-50 rounded-lg text-xs font-semibold border ${reportDateFilter === 'all' ? 'bg-stone-950 text-white border-stone-950' : 'text-stone-600 border-stone-200'}`}
                        >
                          كامل الفترة الزمنية
                        </button>
                        <button
                          onClick={() => setReportDateFilter('7days')}
                          className={`px-3 py-1 bg-stone-50 rounded-lg text-xs font-semibold border ${reportDateFilter === '7days' ? 'bg-stone-950 text-white border-stone-950' : 'text-stone-600 border-stone-200'}`}
                        >
                          آخر ٧ أيام للعمليات
                        </button>
                        <button
                          onClick={() => setReportDateFilter('30days')}
                          className={`px-3 py-1 bg-stone-50 rounded-lg text-xs font-semibold border ${reportDateFilter === '30days' ? 'bg-stone-950 text-white border-stone-950' : 'text-stone-600 border-stone-200'}`}
                        >
                          هذا الشهر
                        </button>
                      </div>
                    </div>

                    {/* Analytics bento grids */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Counts by Type */}
                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs space-y-4">
                        <h4 className="text-xs font-bold text-stone-900 border-b border-stone-100 pb-2">تصنيف الطلبات حسب الصنف</h4>
                        
                        <div className="space-y-3 font-medium">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-500">إرجاع منتج (Return)</span>
                            <span className="font-bold font-mono text-stone-900">{filteredRequests.filter(r => r.type === 'return').length} طلبات</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-500">استبدال مقاس/لون (Exchange)</span>
                            <span className="font-bold font-mono text-stone-900">{filteredRequests.filter(r => r.type === 'exchange').length} طلبات</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-500">بلاغات وشكاوى (Complaint)</span>
                            <span className="font-bold font-mono text-stone-900">{filteredRequests.filter(r => r.type === 'complaint').length} طلبات</span>
                          </div>
                        </div>
                      </div>

                      {/* Counts by Status */}
                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs space-y-4">
                        <h4 className="text-xs font-bold text-stone-900 border-b border-stone-100 pb-2">تصنيف الحالات الجارية</h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg">
                            <p className="text-[9px] text-stone-400">جديدة قيد التدقيق</p>
                            <p className="font-mono text-stone-900 font-bold">{filteredRequests.filter(r => r.status === 'new' || r.status === 'under_review').length}</p>
                          </div>
                          <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg">
                            <p className="text-[9px] text-stone-400">بانتظار العميل</p>
                            <p className="font-mono text-stone-900 font-bold">{filteredRequests.filter(r => r.status === 'waiting_customer_info').length}</p>
                          </div>
                          <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg">
                            <p className="text-[9px] text-stone-400">مكتمل ومغلق</p>
                            <p className="font-mono text-stone-900 font-bold">{filteredRequests.filter(r => r.status === 'completed').length}</p>
                          </div>
                          <div className="p-2 border border-stone-100 bg-stone-50 rounded-lg">
                            <p className="text-[9px] text-stone-400">مرفوض وملغي</p>
                            <p className="font-mono text-stone-900 font-bold">{filteredRequests.filter(r => r.status === 'rejected' || r.status === 'cancelled').length}</p>
                          </div>
                        </div>
                      </div>

                      {/* Top Reasons list */}
                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs space-y-4">
                        <h4 className="text-xs font-bold text-stone-900 border-b border-stone-100 pb-2">المسببات الأكثر شيوعاً</h4>
                        
                        <div className="space-y-2.5 text-xs font-medium">
                          <div className="flex justify-between items-center">
                            <span className="text-stone-600">وصول تالف / كسر بالعبوة</span>
                            <span className="font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-bold">٢ طلبات</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-stone-600">طعم البن قديم / عيب جودة</span>
                            <span className="font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">١ طلب</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-stone-600">خطأ في نوع بن الحبوب</span>
                            <span className="font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded font-bold">١ طلب</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {ownerTab === 'settings' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Settings configure */}
                    <div className="lg:col-span-2 bg-white p-6 border border-stone-200 rounded-2xl shadow-xs space-y-6">
                      <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-stone-900">تخصيص وتهيئة بوابة إرجاع العملاء</h3>
                        <p className="text-xs text-stone-500">التحكم في المظهر والشعور العام والسياسات الخاصة ببوابتك في حلّها.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">شعار / أيقونة المتجر</label>
                            <select
                              value={storeLogo}
                              onChange={(e) => setStoreLogo(e.target.value)}
                              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                            >
                              <option value="☕">☕ مقهى/بن نجد</option>
                              <option value="🛍️">🛍️ حقيبة تسوق</option>
                              <option value="✨">✨ عطور ومستحضرات</option>
                              <option value="🔌">🔌 إلكترونيات وأدوات</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">اللون الهويّاتي الأساسي</label>
                            <input
                              type="color"
                              value={storeColor}
                              onChange={(e) => setStoreColor(e.target.value)}
                              className="w-full h-9 border border-stone-200 rounded-xl bg-white cursor-pointer p-0.5"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">رسالة الترحيب والتعليمات للعميل</label>
                          <textarea
                            value={welcomeMessage}
                            onChange={(e) => setWelcomeMessage(e.target.value)}
                            className="w-full p-2.5 border border-stone-200 rounded-xl text-xs h-16 focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">سياسات الاسترجاع والاستبدال للمتجر</label>
                          <textarea
                            value={returnPolicy}
                            onChange={(e) => setReturnPolicy(e.target.value)}
                            className="w-full p-2.5 border border-stone-200 rounded-xl text-xs h-24 focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8] leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">مدة نافذة تقديم طلبات المرتجعات (بالأيام)</label>
                          <select
                            value={settingsWindow}
                            onChange={(e) => setSettingsWindow(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                          >
                            <option value={7}>٧ أيام (السياسة الصارمة)</option>
                            <option value={15}>١٥ يوماً (السياسة الافتراضية المعتمدة)</option>
                            <option value={30}>٣٠ يوماً (السياسة المرنة)</option>
                          </select>
                        </div>

                        <button
                          onClick={() => alert('تم حفظ تفضيلات وتهيئة بوابة العملاء بنجاح!')}
                          className="w-full bg-stone-950 hover:bg-stone-800 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition"
                        >
                          حفظ التغييرات الهوياتيّة للمتجر
                        </button>
                      </div>
                    </div>

                    {/* Reasons / Custom Chips configuration */}
                    <div className="bg-white p-6 border border-stone-200 rounded-2xl shadow-xs space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 border-b border-stone-100 pb-2">مسببات الاسترجاع المعتمدة</h4>
                        <div className="flex flex-wrap gap-1.5 pt-3">
                          {reasons.map((r, i) => (
                            <span key={i} className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full border border-stone-200">
                              {r}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <input
                            type="text"
                            value={newReasonInput}
                            onChange={(e) => setNewReasonInput(e.target.value)}
                            placeholder="سبب جديد..."
                            className="flex-1 px-3 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                          />
                          <button onClick={handleAddReason} className="p-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-stone-800">
                            إضافة
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-stone-900 border-b border-stone-100 pb-2">تصنيفات البلاغات والشكاوى</h4>
                        <div className="flex flex-wrap gap-1.5 pt-3">
                          {complaints.map((c, i) => (
                            <span key={i} className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-100">
                              {c}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <input
                            type="text"
                            value={newComplaintInput}
                            onChange={(e) => setNewComplaintInput(e.target.value)}
                            placeholder="شكوى جديدة..."
                            className="flex-1 px-3 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                          />
                          <button onClick={handleAddComplaint} className="p-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-stone-800">
                            إضافة
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ownerTab === 'team' && (
                  <div className="bg-white p-6 border border-stone-200 rounded-2xl shadow-xs space-y-6">
                    <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">إدارة فريق وتراخيص موظفي المتجر</h3>
                        <p className="text-xs text-stone-500 mt-1">تحديد صلاحيات التدقيق واستلام المرتجعات لأقسام المتجر.</p>
                      </div>
                      <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="px-3 py-2 bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة موظف جديد</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-stone-50 border-b border-stone-200/50 text-stone-400 font-semibold">
                          <tr>
                            <th className="px-6 py-4">اسم الموظف</th>
                            <th className="px-6 py-4">البريد الإلكتروني</th>
                            <th className="px-6 py-4">الجوال</th>
                            <th className="px-6 py-4">الدور الوظيفي</th>
                            <th className="px-6 py-4">حالة الحساب</th>
                            <th className="px-6 py-4 text-center">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                          {localTeam.map((member) => (
                            <tr key={member.id} className="hover:bg-stone-50/50 transition">
                              <td className="px-6 py-4.5 font-bold text-stone-900">{member.name}</td>
                              <td className="px-6 py-4.5 font-mono text-stone-500">{member.email}</td>
                              <td className="px-6 py-4.5 font-mono text-stone-500" dir="ltr">{member.phone}</td>
                              <td className="px-6 py-4.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  member.role === 'store_owner' 
                                    ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                                    : member.role === 'customer_support' 
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                }`}>
                                  {member.role === 'store_owner' && 'مالك المتجر (Owner)'}
                                  {member.role === 'customer_support' && 'الدعم الفني (Support)'}
                                  {member.role === 'warehouse_agent' && 'المستودع (Warehouse)'}
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  member.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : member.status === 'pending_activation'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                                      : 'bg-stone-100 text-stone-500 border border-stone-200'
                                }`}>
                                  <span>
                                    {member.status === 'active' && 'نشط'}
                                    {member.status === 'pending_activation' && 'بانتظار التفعيل'}
                                    {member.status === 'disabled' && 'معطل'}
                                  </span>
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {member.status === 'pending_activation' && (
                                    <button
                                      onClick={() => handleCopyLink(member.activationUrl || '', member.id)}
                                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition flex items-center gap-1 ${
                                        copiedLink === member.id 
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                      }`}
                                    >
                                      {copiedLink === member.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedLink === member.id ? 'تم النسخ!' : 'رابط التفعيل'}</span>
                                    </button>
                                  )}

                                  {member.role !== 'store_owner' && (
                                    <button
                                      onClick={() => handleToggleMemberStatus(member.id)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                        member.status === 'active' 
                                          ? 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100' 
                                          : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                                      }`}
                                    >
                                      {member.status === 'active' ? 'تعطيل' : 'تنشيط'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. CUSTOMER SUPPORT WORKSPACE VIEW */}
            {role === 'customer_support' && (
              <>
                {supportTab === 'dashboard' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
                        <span className="text-stone-400 text-xs font-semibold">حالات جارية بانتظار تدقيق الدعم</span>
                        <p className="text-4xl font-bold font-mono text-amber-500 mt-2">{pendingSupportCount}</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">الوقت المستهدف للمعالجة: ساعتان كحد أقصى</p>
                      </div>

                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
                        <span className="text-stone-400 text-xs font-semibold">حالات تم شحنها ومقبولة مبدئياً</span>
                        <p className="text-4xl font-bold font-mono text-indigo-500 mt-2">{approvedWarehouseCount}</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">بانتظار تأكيد استلام المستودع الفعلي</p>
                      </div>

                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
                        <span className="text-stone-400 text-xs font-semibold">تذاكر مستلمة بانتظار تسوية المالك</span>
                        <p className="text-4xl font-bold font-mono text-stone-900 mt-2">{receivedWarehouseCount}</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">تقارير تفتيش المستودع مدفوعة بنجاح</p>
                      </div>
                    </div>

                    <div className="bg-teal-50/20 border border-teal-200/50 p-6 rounded-2xl flex items-start gap-4">
                      <span className="p-3 bg-white rounded-xl text-teal-600 border border-teal-100"><MessageSquare className="w-6 h-6" /></span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-teal-900 uppercase">مسطرة وتوجيهات الدعم الفني</h4>
                        <p className="text-xs text-teal-800/80 leading-relaxed pt-1 font-medium">
                          يرجى فحص صور المرفقات المرفقة بعناية قبل الموافقة وتوجيه المشتري للمستودع. الحالات التي بها مشاكل تالفة أو غير متطابقة يتم الموافقة عليها فوراً، والحالات المشبوهة أو فوق الميزانية يتم تصعيدها مباشرة لمكتب المالك.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {supportTab === 'requests' && (
                  <div className="space-y-4">
                    {/* Support list */}
                    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
                      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/40">
                        <h3 className="text-xs font-bold text-stone-900">طابور تدقيق الطلبات الجارية للدعم الفني</h3>
                        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200/50 font-bold">{pendingSupportCount} تذكرة نشطة</span>
                      </div>

                      {requests.filter(r => ['new', 'under_review', 'waiting_customer_info'].includes(r.status)).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-stone-50 border-b border-stone-200/50 text-stone-400 font-semibold">
                              <tr>
                                <th className="px-6 py-4">رقم تتبع حلّها</th>
                                <th className="px-6 py-4">المشتري والعميل</th>
                                <th className="px-6 py-4">رقم طلب الشراء</th>
                                <th className="px-6 py-4">النوع وتصنيف المشكلة</th>
                                <th className="px-6 py-4">تاريخ التقديم</th>
                                <th className="px-6 py-4 text-center">الإجراء</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                              {requests.filter(r => ['new', 'under_review', 'waiting_customer_info'].includes(r.status)).map((req) => (
                                <tr key={req.id} className="hover:bg-stone-50/50 transition">
                                  <td className="px-6 py-4.5 font-bold text-stone-900 font-mono">{req.id}</td>
                                  <td className="px-6 py-4.5">
                                    <p className="font-bold text-stone-900">{req.customerName}</p>
                                    <p className="text-[10px] text-stone-400 font-mono mt-0.5" dir="ltr">{req.customerPhone}</p>
                                  </td>
                                  <td className="px-6 py-4.5 font-mono text-stone-800 font-bold">{req.orderNumber}</td>
                                  <td className="px-6 py-4.5">
                                    <div className="flex flex-col gap-1 items-start">
                                      {getTypeBadge(req.type)}
                                      <span className="text-[10px] text-stone-500 line-clamp-1 max-w-xs">{req.items[0]?.reason}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4.5 font-mono text-stone-500">{req.createdAt}</td>
                                  <td className="px-6 py-4.5 text-center">
                                    <button
                                      onClick={() => setSelectedRequest(req)}
                                      className="px-3 py-1.5 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-lg font-bold cursor-pointer transition"
                                    >
                                      تدقيق واتخاذ قرار
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-16 text-center text-stone-400 space-y-3">
                          <span className="text-5xl">🎉</span>
                          <h4 className="text-sm font-bold text-stone-800">طابور الدعم الفني فارغ كلياً!</h4>
                          <p className="text-xs text-stone-500">تم الانتهاء تماماً من معالجة جميع المراجعات الجارية.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 3. WAREHOUSE WORKSPACE VIEW */}
            {role === 'warehouse_agent' && (
              <>
                {warehouseTab === 'dashboard' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
                        <span className="text-stone-400 text-xs font-semibold">مرتجع مقبول بانتظار استلامه فعلياً</span>
                        <p className="text-4xl font-bold font-mono text-indigo-600 mt-2">{approvedWarehouseCount}</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">مندوب شركة الشحن في طريقه إليك بالأطردة</p>
                      </div>

                      <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
                        <span className="text-stone-400 text-xs font-semibold">مرتجعات بالمستودع بانتظار الفحص الفعلي</span>
                        <p className="text-4xl font-bold font-mono text-amber-500 mt-2">{receivedWarehouseCount}</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">يرجى تسجيل استمارات الفحص فور فتح الصناديق</p>
                      </div>
                    </div>

                    <div className="bg-indigo-50/20 border border-indigo-200/50 p-6 rounded-2xl flex items-start gap-4">
                      <span className="p-3 bg-white rounded-xl text-indigo-600 border border-indigo-100"><PackageCheck className="w-6 h-6" /></span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-indigo-950 uppercase">تعليمات استلام السلع وفحصها بالمخزن</h4>
                        <p className="text-xs text-indigo-900 leading-relaxed pt-1 font-medium">
                          تطابق كامل لـ SKU السلع والرمز الشريطي مع تفاصيل طلب حلّها المرفق. في حال فتح الغلاف أو استخدام المنتجات يتم تدوين ذلك بدقة، حيث ستقوم الإدارة العليا بالمعالجة بناء على مدخلات تفتيشك.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {warehouseTab === 'requests' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
                      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/40">
                        <h3 className="text-xs font-bold text-stone-900">طابور استلام وتفتيش المرتجعات الفعلي</h3>
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200/50 font-bold">
                          {approvedWarehouseCount + receivedWarehouseCount} تذكرة مرتجع
                        </span>
                      </div>

                      {(approvedWarehouseCount + receivedWarehouseCount) > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-stone-50 border-b border-stone-200/50 text-stone-400 font-semibold">
                              <tr>
                                <th className="px-6 py-4">رقم تتبع حلّها</th>
                                <th className="px-6 py-4">العميل والمشتري</th>
                                <th className="px-6 py-4">المنتج والكمية</th>
                                <th className="px-6 py-4">الرمز الشريطي (SKU)</th>
                                <th className="px-6 py-4">الحالة اللوجستية</th>
                                <th className="px-6 py-4 text-center">الإجراء</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                              {requests.filter(r => ['approved', 'received'].includes(r.status)).map((req) => (
                                <tr key={req.id} className="hover:bg-stone-50/50 transition animate-fade-in">
                                  <td className="px-6 py-4.5 font-bold text-stone-900 font-mono">{req.id}</td>
                                  <td className="px-6 py-4.5 font-bold text-stone-900">{req.customerName}</td>
                                  <td className="px-6 py-4.5">
                                    <p className="font-bold text-stone-900">{req.items[0]?.name}</p>
                                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">الكمية: {req.items[0]?.quantity}</p>
                                  </td>
                                  <td className="px-6 py-4.5 font-mono font-semibold text-stone-700">{req.items[0]?.sku}</td>
                                  <td className="px-6 py-4.5">
                                    {req.status === 'approved' ? (
                                      <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded text-[10px] font-bold">
                                        بانتظار استلام الطرد
                                      </span>
                                    ) : (
                                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded text-[10px] font-bold">
                                        مستلم - بانتظار الفحص
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4.5 text-center">
                                    <button
                                      onClick={() => setSelectedRequest(req)}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition ${
                                        req.status === 'approved' 
                                          ? 'text-amber-700 bg-amber-50 border-amber-100 hover:bg-amber-100' 
                                          : 'text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
                                      }`}
                                    >
                                      {req.status === 'approved' ? 'تأكيد الاستلام' : 'افتح نموذج الفحص'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-16 text-center text-stone-400 space-y-3">
                          <span className="text-5xl">📦</span>
                          <h4 className="text-sm font-bold text-stone-800">مستودعك خالٍ من العمليات الجارية</h4>
                          <p className="text-xs text-stone-500">كل السلع المرتجعة المستلمة تم فحصها وتدوينها بالنظام!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ========================================================================= */
      /* MODALS & PORTAL PREVIEWS */
      /* ========================================================================= */}

      {/* ESCALATION TO OWNER MODAL */}
      {showEscalationModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>تصعيد الطلب لمكتب المالك مباشرة</span>
              </h4>
              <button onClick={() => setShowEscalationModal(false)} className="text-stone-400 hover:text-stone-900 text-lg cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handlePerformEscalation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">سبب التصعيد والتوصية الإدارية</label>
                <textarea
                  required
                  value={escalationReasonInput}
                  onChange={(e) => setEscalationReasonInput(e.target.value)}
                  placeholder="مثال: يطالب العميل بمعالجة لسلعة تم تسليمها بشكل سليم ولكنها تضررت بسبب عيب فني بالهيكل الأصلي. نوصي بالموافقة الاستثنائية..."
                  className="w-full p-2.5 border border-stone-200 rounded-xl text-xs h-24 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-[#fbfaf8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ملاحظة داخلية إضافية (اختياري)</label>
                <input
                  type="text"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="مثال: تم التواصل هاتفياً وتأكيد المشكلة..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-[#fbfaf8]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalationModal(false)}
                  className="flex-1 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer transition hover:bg-stone-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  تأكيد تصعيد الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INFORMATION REQUEST MODAL */}
      {showInfoRequestModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-500" />
                <span>توجيه طلب معلومات للمشتري</span>
              </h4>
              <button onClick={() => setShowInfoRequestModal(false)} className="text-stone-400 hover:text-stone-900 text-lg cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handlePerformInfoRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">البيانات أو التوضيحات المطلوبة من العميل</label>
                <textarea
                  required
                  value={infoRequestInput}
                  onChange={(e) => setInfoRequestInput(e.target.value)}
                  placeholder="مثال: يرجى تزويدنا بصورة واضحة للرقم التسلسلي المسجل أسفل العبوة لمطابقتها مع مخزون المتجر..."
                  className="w-full p-2.5 border border-stone-200 rounded-xl text-xs h-24 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#fbfaf8]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInfoRequestModal(false)}
                  className="flex-1 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer transition hover:bg-stone-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  توجيه الطلب للعميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEAM MEMBER ADD MODAL */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl border border-stone-200 shadow-2xl p-6 space-y-4" dir="rtl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h4 className="text-sm font-bold text-stone-900">إضافة موظف جديد للمتجر (MVP)</h4>
              <button onClick={() => setShowAddMemberModal(false)} className="text-stone-400 hover:text-stone-900 text-lg cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleAddTeamMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">الاسم الكامل للموظف</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="مثال: فواز العتيبي"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني المهني</label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="مثال: fawaz@najdcoffee.com"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8] text-right"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">رقم جوال الموظف</label>
                <input
                  type="text"
                  required
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="0501234567"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8] text-right"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">الدور والصلاحيات الوظيفية</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as 'customer_support' | 'warehouse_agent')}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 bg-[#fbfaf8]"
                >
                  <option value="customer_support">الدعم الفني والخدمة (Customer Support)</option>
                  <option value="warehouse_agent">أخصائي فحص المستودعات (Warehouse Agent)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer transition hover:bg-stone-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  تأجيل وإصدار رابط التفعيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PORTAL PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#faf8f5] w-full max-w-2xl rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="bg-white p-4 border-b border-stone-200 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-stone-900">معاينة تفاعلية لبوابة دعم متجرك الإلكتروني</h4>
                <p className="text-[10px] text-stone-400 mt-0.5">محاكاة فورية لمظهر وشعور بوابة العميل النهائية.</p>
              </div>
              <button 
                onClick={() => setShowPreviewModal(false)} 
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>

            {/* Simulated Mobile screen wrapper */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start">
              <div className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl shadow-lg overflow-hidden min-h-[500px] flex flex-col font-sans">
                
                {/* Logo and header with store theme color */}
                <div className="p-6 text-white text-center space-y-2 relative" style={{ backgroundColor: storeColor }}>
                  <span className="text-4xl block">{storeLogo}</span>
                  <h3 className="text-base font-bold">بوابة طلبات العملاء الذكية</h3>
                  <p className="text-[10px] text-white/80">معالجة فورية بالتعاون مع منصة حلّها</p>
                </div>

                <div className="p-4 space-y-4 flex-1">
                  {/* welcome message preview */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-right space-y-1">
                    <span className="text-[9px] text-stone-400 block">رسالة الترحيب:</span>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">{welcomeMessage}</p>
                  </div>

                  {/* policies preview */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-right space-y-1">
                    <span className="text-[9px] text-stone-400 block">شروط وسياسة المتجر:</span>
                    <p className="text-xs text-stone-600 leading-relaxed">{returnPolicy}</p>
                  </div>

                  {/* Window duration and stats */}
                  <div className="grid grid-cols-2 gap-3 text-center text-[10px] font-bold">
                    <div className="p-2 border border-stone-200 rounded-lg bg-white">
                      <p className="text-stone-400">مدة التقديم الفعالة</p>
                      <p className="text-stone-800 text-xs mt-0.5 font-mono">{settingsWindow} يوماً</p>
                    </div>
                    <div className="p-2 border border-stone-200 rounded-lg bg-white">
                      <p className="text-stone-400">طريقة الفحص</p>
                      <p className="text-stone-800 text-xs mt-0.5">مستودع متكامل</p>
                    </div>
                  </div>

                  {/* Action preview */}
                  <div className="space-y-2 pt-2">
                    <button className="w-full text-white py-2.5 rounded-xl text-xs font-bold text-center block shadow-xs" style={{ backgroundColor: storeColor }}>
                      البدء في رفع طلب جديد
                    </button>
                    <p className="text-[9px] text-stone-400 text-center leading-relaxed">بموجب أنظمة حماية المستهلك الموحدة لغرفة التجارة الإلكترونية.</p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border-t border-stone-100 text-center text-[9px] text-stone-400">
                  مدعوم تقنياً بواسطة منصة حلّها (Hal'ha SaaS)
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
