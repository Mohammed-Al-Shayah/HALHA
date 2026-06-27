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
  DollarSign,
  PackageCheck,
  Search,
  MessageSquare,
  ShieldCheck,
  Plus,
  BarChart4,
  RefreshCw,
  Sparkles,
  Info,
  XCircle,
  Download,
  Printer,
  Calendar
} from 'lucide-react';

interface MerchantDashboardProps {
  role: 'owner' | 'support' | 'warehouse';
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
}

export default function MerchantDashboard({
  role,
  requests,
  teamMembers,
  onUpdateRequestStatus,
}: MerchantDashboardProps) {
  // Navigation tabs
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

  // Warehouse Inspection Form States
  const [inspectionCondition, setInspectionCondition] = useState<InspectionCondition>('clean_restock');
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Settings mock states
  const [returnWindow, setReturnWindow] = useState(15);
  const [autoApproval, setAutoApproval] = useState(true);
  const [shippingProvider, setShippingProvider] = useState('smsa');

  // Report Filter states
  const [reportStoreFilter, setReportStoreFilter] = useState<string>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [reportDateFilter, setReportDateFilter] = useState<string>('30days');
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');

  // Filter requests for reporting
  const reportingFilteredRequests = requests.filter((req) => {
    // Store filter
    const matchesStore = reportStoreFilter === 'all' || req.storeName === reportStoreFilter;
    
    // Type filter
    const matchesType = reportTypeFilter === 'all' || req.type === reportTypeFilter;
    
    // Status filter
    const matchesStatus = reportStatusFilter === 'all' || req.status === reportStatusFilter;
    
    // Date filter
    let matchesDate = true;
    const reqDate = new Date(req.createdAt);
    const now = new Date();
    
    if (reportDateFilter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchesDate = reqDate >= sevenDaysAgo;
    } else if (reportDateFilter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchesDate = reqDate >= thirtyDaysAgo;
    } else if (reportDateFilter === '90days') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      matchesDate = reqDate >= ninetyDaysAgo;
    } else if (reportDateFilter === 'custom') {
      const start = reportStartDate ? new Date(reportStartDate) : null;
      const end = reportEndDate ? new Date(reportEndDate) : null;
      if (start) {
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && reqDate >= start;
      }
      if (end) {
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && reqDate <= end;
      }
    }
    
    return matchesStore && matchesType && matchesStatus && matchesDate;
  });

  // Calculate reports stats
  const reportsCount = reportingFilteredRequests.length;
  const reportsApprovedCount = reportingFilteredRequests.filter(r => r.status === 'resolved_approved').length;
  const reportsApprovedRate = reportsCount > 0 ? Math.round((reportsApprovedCount / reportsCount) * 100) : 0;
  
  const reportsTotalValue = reportingFilteredRequests.reduce((acc, r) => {
    return acc + r.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, 0);
  
  const reportsApprovedValue = reportingFilteredRequests
    .filter(r => r.status === 'resolved_approved')
    .reduce((acc, r) => {
      return acc + r.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, 0);

  // Get unique store names from requests
  const uniqueStoreNames = Array.from(new Set(requests.map(r => r.storeName)));

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'رقم الطلب',
      'المتجر',
      'رقم الطلب الأصلي',
      'اسم العميل',
      'البريد الإلكتروني',
      'الهاتف',
      'نوع الطلب',
      'الحالة',
      'القيمة الإجمالية (ر.س)',
      'تاريخ الإنشاء',
      'تفاصيل السلع وأسباب الطلب'
    ];

    const rows = reportingFilteredRequests.map(req => {
      const typeAr = req.type === 'return' ? 'إرجاع' : req.type === 'exchange' ? 'استبدال' : 'شكوى';
      
      let statusAr = 'قيد الانتظار';
      if (req.status === 'pending_support') statusAr = 'قيد المراجعة - الدعم الفني';
      else if (req.status === 'escalated_owner') statusAr = 'مرفوع لصاحب المتجر';
      else if (req.status === 'pending_warehouse') statusAr = 'بانتظار الشحن/المستودع';
      else if (req.status === 'warehouse_inspected') statusAr = 'تم التفتيش في المستودع';
      else if (req.status === 'resolved_approved') statusAr = 'مقبول ومكتمل';
      else if (req.status === 'resolved_rejected') statusAr = 'مرفوض ومغلق';

      const totalValue = req.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemsReason = req.items.map(item => `${item.name} (${item.sku}) [الكمية: ${item.quantity}، السعر: ${item.price} ر.س] - السبب: ${item.reason}`).join(' | ');

      return [
        req.id,
        req.storeName,
        req.orderNumber,
        req.customerName,
        req.customerEmail,
        req.customerPhone,
        typeAr,
        statusAr,
        totalValue,
        new Date(req.createdAt).toLocaleDateString('ar-SA'),
        itemsReason
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const valStr = String(val ?? '');
        if (valStr.includes(',') || valStr.includes('"') || valStr.includes('\n')) {
          return `"${valStr.replace(/"/g, '""')}"`;
        }
        return valStr;
      }).join(','))
    ].join('\n');

    // Add UTF-8 BOM so Excel opens Arabic correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_طلبات_حلها_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export handler
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('الرجاء السماح بالنوافذ المنبثقة لتوليد وتصدير تقارير الـ PDF بنجاح.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timeStr = new Date().toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const tableRowsHtml = reportingFilteredRequests.map((req) => {
      const typeAr = req.type === 'return' ? 'إرجاع' : req.type === 'exchange' ? 'استبدال' : 'شكوى';
      
      let statusAr = 'قيد الانتظار';
      let statusColor = 'text-stone-700';
      if (req.status === 'pending_support') {
        statusAr = 'قيد المراجعة - الدعم';
        statusColor = 'text-amber-600 font-semibold';
      } else if (req.status === 'escalated_owner') {
        statusAr = 'مرفوع للمالك';
        statusColor = 'text-purple-600 font-bold';
      } else if (req.status === 'pending_warehouse') {
        statusAr = 'بانتظار الشحن';
        statusColor = 'text-blue-600';
      } else if (req.status === 'warehouse_inspected') {
        statusAr = 'تم فحص المستودع';
        statusColor = 'text-indigo-600';
      } else if (req.status === 'resolved_approved') {
        statusAr = 'مقبول وتمت التسوية';
        statusColor = 'text-teal-600 font-semibold';
      } else if (req.status === 'resolved_rejected') {
        statusAr = 'مرفوض ومغلق';
        statusColor = 'text-rose-600';
      }

      const totalValue = req.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return `
        <tr class="border-b border-stone-200 hover:bg-stone-50/50 transition">
          <td class="px-4 py-3 text-xs font-bold text-stone-900 font-mono">${req.id}</td>
          <td class="px-4 py-3 text-xs text-stone-700 font-semibold">${req.customerName}</td>
          <td class="px-4 py-3 text-xs text-stone-600">${req.storeName}</td>
          <td class="px-4 py-3 text-xs text-stone-600 font-medium">${typeAr}</td>
          <td class="px-4 py-3 text-xs ${statusColor}">${statusAr}</td>
          <td class="px-4 py-3 text-xs font-mono font-bold text-stone-900 text-left">${totalValue.toLocaleString('en-US')} ر.س</td>
          <td class="px-4 py-3 text-xs text-stone-500 font-mono text-left">${new Date(req.createdAt).toLocaleDateString('ar-SA')}</td>
        </tr>
      `;
    }).join('');

    const storeLabel = reportStoreFilter === 'all' ? 'جميع المتاجر المتصلة' : reportStoreFilter;
    const typeLabel = reportTypeFilter === 'all' ? 'جميع الأنواع' : (reportTypeFilter === 'return' ? 'إرجاع السلع' : reportTypeFilter === 'exchange' ? 'استبدال السلع' : 'الشكاوى والبلاغات');
    const statusLabel = reportStatusFilter === 'all' ? 'جميع الحالات التشغيلية' : (reportStatusFilter === 'pending_support' ? 'تحت التدقيق الفني' : reportStatusFilter === 'escalated_owner' ? 'مرفوع لصاحب العمل' : 'مكتمل ومغلق');
    
    let dateRangeLabel = 'كامل الفترة الزمنية';
    if (reportDateFilter === '7days') dateRangeLabel = 'آخر ٧ أيام للعمليات';
    else if (reportDateFilter === '30days') dateRangeLabel = 'آخر ٣٠ يوم للعمليات';
    else if (reportDateFilter === '90days') dateRangeLabel = 'آخر ٩٠ يوم للعمليات';
    else if (reportDateFilter === 'custom') {
      dateRangeLabel = `الفترة من ${reportStartDate || 'البداية'} إلى ${reportEndDate || 'اليوم'}`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير المرتجعات الدوري والتحليلات - ${todayStr}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Cairo', 'Inter', sans-serif;
            background-color: #faf9f6;
            color: #1c1917;
          }
          .font-mono {
            font-family: 'JetBrains Mono', monospace !important;
          }
          @media print {
            body {
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
            .print-border {
              border: 1px solid #e7e5e4 !important;
              box-shadow: none !important;
              border-radius: 12px !important;
            }
            @page {
              size: A4;
              margin: 15mm;
            }
          }
        </style>
      </head>
      <body class="p-4 md:p-8 max-w-4xl mx-auto">
        
        <!-- Print Header / Controls -->
        <div class="no-print mb-8 bg-stone-900 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div class="flex items-center gap-3">
            <span class="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl font-bold text-lg">📊</span>
            <div>
              <h4 class="text-sm font-bold text-white">معاينة وتصدير التقرير الدوري الذكي كـ PDF</h4>
              <p class="text-xs text-stone-400 mt-1">تأكد من اختيار <strong>"حفظ بتنسيق PDF"</strong> كوجهة طباعة، وتفعيل خيار <strong>"رسومات الخلفية"</strong> للحصول على التصميم الكامل والملون.</p>
            </div>
          </div>
          <div class="flex gap-2 w-full md:w-auto justify-end">
            <button onclick="window.close()" class="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition cursor-pointer">إغلاق</button>
            <button onclick="window.print()" class="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-stone-950 text-xs font-extrabold rounded-xl transition shadow-lg cursor-pointer">طباعة وحفظ التقرير 📥</button>
          </div>
        </div>

        <!-- Official Report Wrapper -->
        <div class="print-border border border-stone-200 rounded-2xl p-6 md:p-8 space-y-8 bg-white shadow-sm relative overflow-hidden">
          
          <div class="absolute -top-16 -right-16 w-48 h-48 bg-teal-50 rounded-full blur-2xl opacity-40"></div>
          
          <!-- Report Title and Meta Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200 pb-6 relative gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm">ح</div>
                <span class="text-sm font-extrabold text-stone-900 tracking-tight">حلّها | <span class="text-teal-600">Hal-ha Operations</span></span>
              </div>
              <h1 class="text-xl font-bold text-stone-950 mt-4 tracking-tight">تقرير عمليات المرتجعات والشكاوى الدوري</h1>
              <p class="text-xs text-stone-500 mt-1 font-medium">وثيقة عملياتية لتدقيق مؤشرات المرتجعات وتقييم جودة سلاسل الإمداد والخدمات.</p>
            </div>
            
            <div class="text-right space-y-1 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-stone-100">
              <span class="inline-block px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 text-[10px] font-bold rounded-full mb-2">معتمد من الإدارة العليا</span>
              <p class="text-xs text-stone-600 font-medium">تاريخ التصدير: <span class="font-mono text-stone-900 font-bold">${todayStr}</span></p>
              <p class="text-xs text-stone-600 font-medium">الوقت: <span class="font-mono text-stone-900 font-bold">${timeStr}</span></p>
              <p class="text-xs text-stone-600 font-medium">معرف التقرير: <span class="font-mono text-teal-700 font-bold">REP-${Math.floor(100000 + Math.random() * 900000)}</span></p>
            </div>
          </div>

          <!-- Filter Scope Overview -->
          <div class="bg-stone-50 p-4 rounded-xl border border-stone-200/60 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span class="text-[10px] text-stone-400 font-extrabold block mb-0.5">نطاق التقرير</span>
              <span class="text-xs font-bold text-stone-800">${dateRangeLabel}</span>
            </div>
            <div>
              <span class="text-[10px] text-stone-400 font-extrabold block mb-0.5">المتاجر المشمولة</span>
              <span class="text-xs font-bold text-stone-800">${storeLabel}</span>
            </div>
            <div>
              <span class="text-[10px] text-stone-400 font-extrabold block mb-0.5">أصناف العمليات</span>
              <span class="text-xs font-bold text-stone-800">${typeLabel}</span>
            </div>
            <div>
              <span class="text-[10px] text-stone-400 font-extrabold block mb-0.5">المرشّح الإجرائي</span>
              <span class="text-xs font-bold text-stone-800">${statusLabel}</span>
            </div>
          </div>

          <!-- KPI Bento Boxes -->
          <div>
            <h3 class="text-xs font-extrabold text-stone-400 tracking-wider mb-3">مؤشرات الأداء التراكمية في الفترة</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div class="border border-stone-200 rounded-xl p-4 bg-white shadow-xs">
                <span class="text-[10px] text-stone-500 font-bold block">إجمالي الطلبات</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span class="text-lg font-bold text-stone-900 font-mono">${reportsCount}</span>
                  <span class="text-[10px] text-stone-400 font-medium">طلب مستلم</span>
                </div>
              </div>

              <div class="border border-stone-200 rounded-xl p-4 bg-white shadow-xs">
                <span class="text-[10px] text-stone-500 font-bold block">معدل التعويض والموافقة</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span class="text-lg font-bold text-teal-600 font-mono">${reportsApprovedRate}%</span>
                  <span class="text-[10px] text-stone-400 font-medium">تسوية إيجابية</span>
                </div>
              </div>

              <div class="border border-stone-200 rounded-xl p-4 bg-white shadow-xs">
                <span class="text-[10px] text-stone-500 font-bold block">القيمة الإجمالية المفحوصة</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span class="text-lg font-bold text-stone-900 font-mono">${reportsTotalValue.toLocaleString('en-US')}</span>
                  <span class="text-[10px] text-stone-400 font-medium">ر.س</span>
                </div>
              </div>

              <div class="border border-stone-200 rounded-xl p-4 bg-teal-50/40 border-teal-100 shadow-xs">
                <span class="text-[10px] text-teal-800 font-bold block">إجمالي التعويضات المستردة</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span class="text-lg font-bold text-teal-700 font-mono">${reportsApprovedValue.toLocaleString('en-US')}</span>
                  <span class="text-[10px] text-teal-600 font-medium">ر.س مستردة</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Main Table Section -->
          <div>
            <h3 class="text-xs font-extrabold text-stone-400 tracking-wider mb-3">سجل الطلبات المتضمن في التقرير الدوري (مفصّل)</h3>
            <div class="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
              <table class="w-full text-right border-collapse">
                <thead>
                  <tr class="bg-stone-50 border-b border-stone-200">
                    <th class="px-4 py-3 text-[11px] font-extrabold text-stone-800">رقم طلب حلّها</th>
                    <th class="px-4 py-3 text-[11px] font-extrabold text-stone-800">العميل</th>
                    <th class="px-4 py-3 text-[11px] font-extrabold text-stone-800">المتجر</th>
                    <th class="px-4 py-3 text-[11px] font-extrabold text-stone-800">النوع</th>
                    <th class="px-4 py-3 text-[11px] font-extrabold text-stone-800">حالة العملية</th>
                    <th class="px-4 py-3 text-[11px] font-extrabold text-stone-800 text-left">قيمة الطلب</th>
                    <th class="px-4 py-3 text-[11px] font-extrabold text-stone-800 text-left">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRowsHtml || `
                    <tr>
                      <td colspan="7" class="px-4 py-8 text-center text-xs text-stone-400 font-medium">لا توجد طلبات مطابقة لمعايير التصفية والفلترة المحددة لتوليد هذا التقرير الدوري.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <!-- AI Advice & Insights included in report -->
          <div class="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 space-y-2">
            <h4 class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span>💡</span>
              <span>تحليل وتوصيات نظام "حلّها" الاستشاري الذكي (AI-Report Recommendations)</span>
            </h4>
            <p class="text-xs text-amber-800 leading-relaxed font-medium">
              نلحظ أن نسبة المرتجعات المقبولة تمثل <span class="font-extrabold text-amber-950">${reportsApprovedRate}%</span> من إجمالي العمليات الواردة. 
              لتقليص معدل الاسترجاع والتعويض لنسبة أدنى من المتوسط العام للربع، يُنصح بمتابعة الشكاوى المصنفة تحت عيوب الصناعة مع مزودي الإمداد الخارجيين، وتطوير أدوات تفصيل المقاسات للعملاء في واجهة المتجر لتقليص ارتجاع مقاسات الملابس والأحذية بنسبة متوقعة تصل لـ ٢٣٪.
            </p>
          </div>

          <!-- Official Stamp & Signatures Area -->
          <div class="grid grid-cols-3 gap-6 pt-8 border-t border-stone-200 mt-12">
            <div class="text-center space-y-4">
              <span class="text-[10px] text-stone-400 font-bold block">إعداد وتدقيق تقني</span>
              <div class="h-16 flex items-center justify-center">
                <div class="border-2 border-dashed border-teal-300 rounded-full px-4 py-2 text-[10px] font-bold text-teal-600 bg-teal-50/40 rotate-[-3deg] inline-block">
                  مُعالج رقمياً وتلقائياً<br>أنظمة حلّها المعتمدة
                </div>
              </div>
              <span class="text-xs font-bold text-stone-800">منصة حلّها لإدارة التعويضات</span>
            </div>

            <div class="text-center space-y-4 border-r border-l border-stone-100">
              <span class="text-[10px] text-stone-400 font-bold block">التدقيق المالي والعملياتي</span>
              <div class="h-16 flex items-end justify-center">
                <div class="w-24 border-b border-stone-300"></div>
              </div>
              <span class="text-xs font-bold text-stone-800">المحاسب المسؤول</span>
            </div>

            <div class="text-center space-y-4">
              <span class="text-[10px] text-stone-400 font-bold block">اعتماد وإمضاء إدارة المتجر</span>
              <div class="h-16 flex items-end justify-center">
                <div class="w-24 border-b border-stone-300"></div>
              </div>
              <span class="text-xs font-bold text-stone-800">المالك / المدير العام</span>
            </div>
          </div>

        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const pendingSupportRequests = requests.filter(r => r.status === 'pending_support');
  const escalatedRequests = requests.filter(r => r.status === 'escalated_owner');
  const pendingWarehouseRequests = requests.filter(r => r.status === 'pending_warehouse');
  const warehouseInspectedRequests = requests.filter(r => r.status === 'warehouse_inspected');
  const resolvedRequests = requests.filter(r => r.status === 'resolved_approved' || r.status === 'resolved_rejected');

  const totalRefundedValue = requests
    .filter(r => r.status === 'resolved_approved')
    .reduce((acc, r) => acc + r.items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 0);

  // Status translator for badges
  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending_support':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200/50 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            قيد المراجعة - الدعم
          </span>
        );
      case 'escalated_owner':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
            مرفوع للإدارة
          </span>
        );
      case 'pending_warehouse':
        return (
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/50 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            بانتظار شحن المستودع
          </span>
        );
      case 'warehouse_inspected':
        return (
          <span className="bg-sky-50 text-sky-700 border border-sky-200/50 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
            تم الفحص وتأكيد السلعة
          </span>
        );
      case 'resolved_approved':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/30 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
            مكتمل ومقبول
          </span>
        );
      case 'resolved_rejected':
        return (
          <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-stone-500 rounded-full"></span>
            مرفوض ومغلق
          </span>
        );
    }
  };

  const getTypeBadge = (type: RequestType) => {
    switch (type) {
      case 'return':
        return <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">استرجاع مالي</span>;
      case 'exchange':
        return <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[10px] font-bold">استبدال منتج</span>;
      case 'complaint':
        return <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold">شكوى / تصعيد</span>;
    }
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* Role specific header navigation */}
      <div className="bg-white border-b border-stone-200/60 sticky top-[57px] z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <div>
              <h2 className="text-base font-bold text-stone-900">نجد للقهوة المختصة</h2>
              <p className="text-[11px] text-stone-400 font-medium">لوحة التحكم الفنية للمتجر &bull; مساحة عمل آمنة</p>
            </div>
          </div>

          {/* Navigation Links according to role */}
          <div className="flex flex-wrap gap-1.5 bg-stone-50 p-1 rounded-xl border border-stone-200/50">
            {role === 'owner' && (
              <>
                <button
                  onClick={() => { setOwnerTab('dashboard'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${ownerTab === 'dashboard' && !selectedRequest ? 'bg-white text-teal-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  الرئيسية
                </button>
                <button
                  onClick={() => { setOwnerTab('requests'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${ownerTab === 'requests' && !selectedRequest ? 'bg-white text-teal-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  كافة الطلبات ({requests.length})
                </button>
                <button
                  onClick={() => { setOwnerTab('escalated'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${ownerTab === 'escalated' && !selectedRequest ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  <span>مصعّدة للإدارة</span>
                  {escalatedRequests.length > 0 && (
                    <span className="bg-rose-500 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {escalatedRequests.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setOwnerTab('reports'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${ownerTab === 'reports' && !selectedRequest ? 'bg-white text-teal-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  التقارير
                </button>
                <button
                  onClick={() => { setOwnerTab('settings'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${ownerTab === 'settings' && !selectedRequest ? 'bg-white text-teal-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  الإعدادات
                </button>
                <button
                  onClick={() => { setOwnerTab('team'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${ownerTab === 'team' && !selectedRequest ? 'bg-white text-teal-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  فريق العمل
                </button>
              </>
            )}

            {role === 'support' && (
              <>
                <button
                  onClick={() => { setSupportTab('dashboard'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${supportTab === 'dashboard' && !selectedRequest ? 'bg-white text-teal-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  إحصائيات الدعم
                </button>
                <button
                  onClick={() => { setSupportTab('requests'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${supportTab === 'requests' && !selectedRequest ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  <span>طلبات العملاء الجارية</span>
                  {pendingSupportRequests.length > 0 && (
                    <span className="bg-amber-500 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                      {pendingSupportRequests.length}
                    </span>
                  )}
                </button>
              </>
            )}

            {role === 'warehouse' && (
              <>
                <button
                  onClick={() => { setWarehouseTab('dashboard'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${warehouseTab === 'dashboard' && !selectedRequest ? 'bg-white text-teal-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  حالة المستودع
                </button>
                <button
                  onClick={() => { setWarehouseTab('requests'); setSelectedRequest(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${warehouseTab === 'requests' && !selectedRequest ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  <span>تفتيش المرتجعات</span>
                  {pendingWarehouseRequests.length > 0 && (
                    <span className="bg-indigo-600 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                      {pendingWarehouseRequests.length}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {selectedRequest ? (
          /* SINGLE DETAILED REQUEST VIEW with contextual actions based on role */
          <div className="space-y-6">
            <button
              onClick={() => setSelectedRequest(null)}
              className="text-stone-500 hover:text-stone-900 text-xs font-medium flex items-center gap-1 bg-white hover:bg-stone-50 px-3 py-2 rounded-lg border border-stone-200/60 w-fit"
            >
              <span>&rarr; العودة لقائمة الطلبات</span>
            </button>

            {/* Request Card Header */}
            <div className="premium-card p-6 md:p-8 smooth-shadow grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Col 1: Customer Details */}
              <div className="space-y-4 border-l border-stone-100 pl-0 lg:pl-8">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">رقم تتبع حلّها</span>
                    <h3 className="text-lg font-bold text-stone-900">{selectedRequest.id}</h3>
                  </div>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div className="space-y-2.5 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400">العميل</span>
                    <span className="font-bold text-stone-800">{selectedRequest.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400">رقم الجوال</span>
                    <span className="font-mono text-stone-700" dir="ltr">{selectedRequest.customerPhone}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400">رقم طلب الشراء</span>
                    <span className="font-mono text-stone-800 font-semibold">{selectedRequest.orderNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400">نوع الطلب</span>
                    {getTypeBadge(selectedRequest.type)}
                  </div>
                  {selectedRequest.customerIBAN && (
                    <div className="pt-2 border-t border-stone-100">
                      <span className="block text-[10px] text-stone-400 mb-0.5">الحساب البنكي لتحويل المرتجع (IBAN)</span>
                      <span className="font-mono text-xs text-stone-700 bg-stone-50 p-1.5 rounded block text-center border border-stone-200/30 overflow-x-auto" dir="ltr">
                        {selectedRequest.customerIBAN}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Col 2: Products & Reasons */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">المنتجات المطلوب تعويضها</h4>
                  <div className="space-y-3">
                    {selectedRequest.items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200/40">
                        {item.image ? (
                          <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-14 h-14 object-cover rounded-lg border border-stone-200 shrink-0" />
                        ) : (
                          <div className="w-14 h-14 bg-stone-200 text-stone-600 rounded-lg flex items-center justify-center shrink-0 text-xl font-bold">📦</div>
                        )}
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-stone-900">{item.name}</p>
                          <p className="text-[10px] text-stone-500 font-mono">رمز السلعة: {item.sku} &bull; السعر: {item.price} ر.س &bull; الكمية: {item.quantity}</p>
                          <div className="bg-white p-2 rounded border border-stone-200/50 mt-1">
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">سبب العميل:</span>
                            <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal and External Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRequest.internalNotes && (
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/40">
                      <h5 className="text-[11px] font-bold text-stone-500 mb-1">ملاحظات فريق العمل الداخلية (سريّ)</h5>
                      <p className="text-xs text-stone-700 leading-relaxed">{selectedRequest.internalNotes}</p>
                    </div>
                  )}

                  {selectedRequest.escalationReason && (
                    <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-100">
                      <h5 className="text-[11px] font-bold text-rose-700 mb-1">مبرر الرفع للإدارة العليا</h5>
                      <p className="text-xs text-rose-800 leading-relaxed">{selectedRequest.escalationReason}</p>
                    </div>
                  )}

                  {selectedRequest.inspection && (
                    <div className="bg-teal-50/40 p-3.5 rounded-xl border border-teal-100 md:col-span-2">
                      <h5 className="text-[11px] font-bold text-teal-800 mb-1 flex items-center gap-1">
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>تقرير تفتيش المستودع</span>
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-1">
                        <p>بواسطة: <span className="font-bold">{selectedRequest.inspection.inspectedBy}</span></p>
                        <p>التاريخ: <span className="font-mono">{selectedRequest.inspection.inspectedAt.split('T')[0]}</span></p>
                        <p className="col-span-2">حالة المنتج: <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                          {selectedRequest.inspection.condition === 'clean_restock' && 'سليم - جاهز لإعادة البيع'}
                          {selectedRequest.inspection.condition === 'damaged_scrap' && 'تالف بالكامل - إتلاف فوري'}
                          {selectedRequest.inspection.condition === 'used_discount' && 'مستعمل خفيف - بيع مخفض'}
                          {selectedRequest.inspection.condition === 'wrong_item' && 'منتج خاطئ مرسل من العميل'}
                        </span></p>
                        <p className="col-span-2 pt-1 border-t border-teal-100/50">تقرير الفاحص: <span className="italic">"{selectedRequest.inspection.notes}"</span></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Request Timeline */}
            <div className="premium-card p-6 md:p-8 smooth-shadow space-y-6">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">سجل تتبع ومراحل الطلب التاريخي</h4>
              
              <div className="relative border-r border-stone-200/80 mr-4 pr-6 space-y-6">
                {selectedRequest.timeline.map((event) => (
                  <div key={event.id} className="relative">
                    {/* Circle icon placement */}
                    <span className={`absolute -right-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-4 border-white flex items-center justify-between ${
                      event.isInternal ? 'bg-amber-500' : 'bg-teal-600'
                    }`}></span>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-800">{event.titleAr}</span>
                        {event.isInternal && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">إجراء داخلي سري</span>
                        )}
                        <span className="text-[10px] text-stone-400 font-mono">{event.createdAt.split('T')[0]} &bull; {event.actorName}</span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">{event.descriptionAr}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Action Panel depending on active Role */}
            <div className="premium-card p-6 md:p-8 border-teal-500 bg-white smooth-shadow space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>إجراءات معالجة الطلب المتوفرة لصلاحيتك الحالية</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  أنت تتصفح الآن بصفتك: <span className="font-bold text-stone-800">
                    {role === 'owner' && 'مالك المتجر (إدارة عليا)'}
                    {role === 'support' && 'دعم عملاء المستوى الأول'}
                    {role === 'warehouse' && 'أخصائي المستودع والتفتيش'}
                  </span>
                </p>
              </div>

              {/* ROLE = SUPPORT ACTIONS */}
              {role === 'support' && selectedRequest.status === 'pending_support' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">ملاحظات داخلية (تضاف لسجل فريق العمل)</label>
                      <textarea
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder="اكتب ملاحظة فنية لمساعدة زملائك في المستودع أو الإدارة..."
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-xs h-20 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">مبرر رفع وتصعيد الطلب (عند اختيار تصعيد فقط)</label>
                      <textarea
                        value={escalationReasonInput}
                        onChange={(e) => setEscalationReasonInput(e.target.value)}
                        placeholder="لماذا يحتاج هذا الطلب موافقة استثنائية من مالك المتجر؟"
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-xs h-20 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {/* Action 1: Approve to send reversal label */}
                    <button
                      onClick={() => {
                        onUpdateRequestStatus(selectedRequest.id, 'pending_warehouse', {
                          internalNotes: actionNotes || undefined,
                        });
                        setSelectedRequest(null);
                        setActionNotes('');
                      }}
                      className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>الموافقة المبدئية وتوليد بوليصة الشحن</span>
                    </button>

                    {/* Action 2: Escalate */}
                    <button
                      onClick={() => {
                        if (!escalationReasonInput) {
                          alert('يرجى كتابة مبرر التصعيد أولاً');
                          return;
                        }
                        onUpdateRequestStatus(selectedRequest.id, 'escalated_owner', {
                          internalNotes: actionNotes || undefined,
                          escalationReason: escalationReasonInput,
                        });
                        setSelectedRequest(null);
                        setActionNotes('');
                        setEscalationReasonInput('');
                      }}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>تصعيد الطلب لصاحب المتجر لإصدار قرار استثنائي</span>
                    </button>

                    {/* Action 3: Reject */}
                    <button
                      onClick={() => {
                        onUpdateRequestStatus(selectedRequest.id, 'resolved_rejected', {
                          internalNotes: actionNotes || undefined,
                        });
                        setSelectedRequest(null);
                        setActionNotes('');
                      }}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                    >
                      رفض الطلب نهائياً
                    </button>
                  </div>
                </div>
              )}

              {/* ROLE = WAREHOUSE ACTIONS */}
              {role === 'warehouse' && selectedRequest.status === 'pending_warehouse' && (
                <div className="space-y-4 pt-2">
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/50">
                    <h5 className="text-xs font-bold text-stone-800 mb-3">تفاصيل التفتيش الفعلي للمرتجع الوارد</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">حالة التفتيش والسلعة الفعليّة</label>
                        <select
                          value={inspectionCondition}
                          onChange={(e) => setInspectionCondition(e.target.value as InspectionCondition)}
                          className="w-full px-2 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                          <option value="clean_restock">سليم ومغلف - إعادة للمخزن للبيع</option>
                          <option value="damaged_scrap">تالف بالكامل - إتلاف وشطب</option>
                          <option value="used_discount">مستعمل خفيف - تصنيف بيع مخفض</option>
                          <option value="wrong_item">منتج خاطئ مغاير لفاتورة الشراء</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">تقرير الفاحص المفصل للمستودع</label>
                        <input
                          type="text"
                          value={inspectionNotes}
                          onChange={(e) => setInspectionNotes(e.target.value)}
                          placeholder="اكتب تقرير الفحص الفني للسلعة بالتفصيل هنا..."
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!inspectionNotes) {
                          alert('يرجى كتابة تقرير الفحص والملحوظات الفنية.');
                          return;
                        }
                        onUpdateRequestStatus(selectedRequest.id, 'warehouse_inspected', {
                          inspection: {
                            inspectedBy: 'بندر العتيبي (أخصائي المستودع)',
                            inspectedAt: new Date().toISOString(),
                            condition: inspectionCondition,
                            notes: inspectionNotes,
                          }
                        });
                        setSelectedRequest(null);
                        setInspectionNotes('');
                      }}
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold mt-4 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>تسجيل تقرير الفحص وإرساله للإدارة للتعويض</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ROLE = OWNER ACTIONS */}
              {role === 'owner' && (selectedRequest.status === 'escalated_owner' || selectedRequest.status === 'warehouse_inspected' || selectedRequest.status === 'pending_support') && (
                <div className="space-y-4 pt-2">
                  <div className="bg-teal-50/20 border border-teal-200/50 p-4 rounded-xl">
                    <h5 className="text-xs font-bold text-teal-950 mb-1">صلاحيات القرار النهائي للمالك</h5>
                    <p className="text-[11px] text-teal-800/80 mb-3">كصاحب متجر، يمكنك الموافقة فوراً على التعويض المالي أو الاستبدال، وسيتولى حلّها إصدار إيصال تحويل الحساب وتحديث كمية السلع المخزنية بشكل متزامن.</p>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">ملاحظة القرار النهائي (تظهر للعميل في بوابة التتبع للشفافية)</label>
                      <input
                        type="text"
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder="مثال: يسعدنا تعويضك، تمت مراجعة طلبك وإصدار الحوالة فوراً لرضاك."
                        className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* Accept and process */}
                      <button
                        onClick={() => {
                          onUpdateRequestStatus(selectedRequest.id, 'resolved_approved', {
                            internalNotes: actionNotes ? `موافقة نهائية من المالك: ${actionNotes}` : 'موافقة نهائية من الإدارة العليا وتفعيل التسوية',
                          });
                          setSelectedRequest(null);
                          setActionNotes('');
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>قبول طلب التعويض وتحويل المبلغ بنكياً فوراً</span>
                      </button>

                      {/* Reject */}
                      <button
                        onClick={() => {
                          onUpdateRequestStatus(selectedRequest.id, 'resolved_rejected', {
                            internalNotes: actionNotes ? `رفض نهائي من المالك: ${actionNotes}` : 'مرفوض ومغلق بقرار الإدارة',
                          });
                          setSelectedRequest(null);
                          setActionNotes('');
                        }}
                        className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض طلب التعويض بشكل نهائي ومبرر</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* No actions required */}
              {((role === 'support' && selectedRequest.status !== 'pending_support') ||
                (role === 'warehouse' && selectedRequest.status !== 'pending_warehouse') ||
                (selectedRequest.status === 'resolved_approved' || selectedRequest.status === 'resolved_rejected')) && (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-stone-500 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span>الطلب مغلق حالياً أو يحتاج لإجراء من دور مستخدم آخر (أنت تشاهد تتبع السجل فقط).</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* MULTI-TAB PORTFOLIO VIEWS depending on active Role */
          <>
            {/* OWNER ROLE PAGES */}
            {role === 'owner' && (
              <>
                {ownerTab === 'dashboard' && (
                  <div className="space-y-8">
                    {/* Analytics Dashboard Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div className="premium-card p-5 smooth-shadow">
                        <div className="flex items-center justify-between text-stone-400">
                          <span className="text-xs font-semibold">معدل استرجاع السلع الكلي</span>
                          <span className="p-2 bg-stone-50 rounded-lg text-teal-600"><TrendingUp className="w-4 h-4" /></span>
                        </div>
                        <p className="text-3xl font-bold font-mono text-stone-900 mt-2">٣.٤%</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                          <span>&darr; أقل بنسبة ٠.٦% عن الشهر الماضي</span>
                        </p>
                      </div>

                      <div className="premium-card p-5 smooth-shadow">
                        <div className="flex items-center justify-between text-stone-400">
                          <span className="text-xs font-semibold">قيمة التعويضات المستردة</span>
                          <span className="p-2 bg-stone-50 rounded-lg text-teal-600"><DollarSign className="w-4 h-4" /></span>
                        </div>
                        <p className="text-3xl font-bold font-mono text-teal-600 mt-2">
                          {totalRefundedValue.toLocaleString()} <span className="text-xs">ر.س</span>
                        </p>
                        <p className="text-[10px] text-stone-400 font-bold mt-1.5">
                          تم تعويضها عبر بوابة حلّها البنكية المباشرة
                        </p>
                      </div>

                      <div className="premium-card p-5 smooth-shadow">
                        <div className="flex items-center justify-between text-stone-400">
                          <span className="text-xs font-semibold">متوسط ساعات تلبية طلب العميل</span>
                          <span className="p-2 bg-stone-50 rounded-lg text-teal-600"><Clock className="w-4 h-4" /></span>
                        </div>
                        <p className="text-3xl font-bold font-mono text-stone-900 mt-2">١٦.٥ <span className="text-xs">ساعة</span></p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                          <span>&darr; أسرع بـ ٤ ساعات من متوسط القطاع</span>
                        </p>
                      </div>

                      <div className="premium-card p-5 smooth-shadow">
                        <div className="flex items-center justify-between text-stone-400">
                          <span className="text-xs font-semibold">الرضا النهائي عن الخدمة</span>
                          <span className="p-2 bg-stone-50 rounded-lg text-teal-600"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></span>
                        </div>
                        <p className="text-3xl font-bold font-mono text-emerald-600 mt-2">٩٦.٢%</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1.5">
                          تقييمات ممتازة من المشترين عبر الرسائل النصية
                        </p>
                      </div>
                    </div>

                    {/* Chart & Alerts panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="premium-card p-6 smooth-shadow lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-stone-950">معدل استقبال المرتجعات الأسبوعي</h3>
                          <span className="text-[11px] text-stone-400">آخر ٥ أسابيع جارية</span>
                        </div>

                        {/* Custom visual SVG bar chart representing return rates premiumly */}
                        <div className="h-44 flex items-end justify-between gap-6 pt-4 px-4 border-b border-stone-100">
                          {[
                            { label: 'أسبوع ١', val: 30, count: 12 },
                            { label: 'أسبوع ٢', val: 55, count: 24 },
                            { label: 'أسبوع ٣', val: 80, count: 32 },
                            { label: 'أسبوع ٤', val: 45, count: 18 },
                            { label: 'أسبوع ٥ (الآن)', val: 95, count: 41 },
                          ].map((bar, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                              <span className="text-[10px] font-mono font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity bg-teal-50 px-1 rounded">
                                {bar.count} طلب
                              </span>
                              <div className="w-full bg-stone-100 rounded-t-lg h-32 relative flex items-end">
                                <div className="bg-teal-600 hover:bg-teal-700 rounded-t-lg w-full transition-all duration-500" style={{ height: `${bar.val}%` }}></div>
                              </div>
                              <span className="text-[10px] text-stone-400 font-semibold">{bar.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Escalation Alerts */}
                      <div className="premium-card p-6 smooth-shadow space-y-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-stone-950">إجراءات تتطلب تدخلك فوراً</h3>
                            <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px] animate-pulse">
                              حالة عاجلة
                            </span>
                          </div>

                          <div className="space-y-3.5 pt-4">
                            {escalatedRequests.length > 0 ? (
                              escalatedRequests.map((req) => (
                                <div key={req.id} className="p-3 bg-[#fffaf9] border border-rose-100 rounded-xl space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-stone-900">{req.id} &bull; {req.customerName}</span>
                                    <span className="text-[10px] text-stone-400 font-mono">{req.createdAt.split('T')[0]}</span>
                                  </div>
                                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">"{req.escalationReason}"</p>
                                  <button
                                    onClick={() => setSelectedRequest(req)}
                                    className="text-[11px] font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1.5 pt-1.5"
                                  >
                                    <span>اتخاذ القرار والاستثناء الفوري</span>
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-6 text-stone-400 space-y-2">
                                <span className="text-3xl">🎉</span>
                                <p className="text-xs">رائع! لا توجد طلبات معلقة مصعدة لمالك المتجر حالياً.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-stone-100 text-xs flex items-center gap-2 text-stone-500">
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>حلّها يقوم بتنبيهك عبر البريد فور تصعيد حالات استثنائية من الدعم.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Requests table and filters */}
                {ownerTab === 'requests' && (
                  <div className="space-y-6">
                    {/* Search and Filters panel */}
                    <div className="premium-card p-4 smooth-shadow flex flex-col md:flex-row items-center gap-4">
                      {/* Search */}
                      <div className="relative w-full md:w-80">
                        <span className="absolute right-3 top-2.5 text-stone-400"><Search className="w-4 h-4" /></span>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="ابحث برقم التتبع، العميل، الطلب..."
                          className="w-full pr-9 pl-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8]"
                        />
                      </div>

                      {/* Filter by Status */}
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs text-stone-400 shrink-0"><Filter className="w-3.5 h-3.5 inline ml-1" />حالة الطلب:</span>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-2 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                          <option value="all">كل الحالات الجارية والمكتملة</option>
                          <option value="pending_support">قيد المراجعة - الدعم</option>
                          <option value="escalated_owner">مرفوع لصاحب المتجر</option>
                          <option value="pending_warehouse">بانتظار شحن المستودع</option>
                          <option value="warehouse_inspected">تم الفحص والتأكيد</option>
                          <option value="resolved_approved">مقبول ومكتمل</option>
                          <option value="resolved_rejected">مرفوض ومغلق</option>
                        </select>
                      </div>

                      {/* Filter by Type */}
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs text-stone-400 shrink-0">نوع الحركة:</span>
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="px-2 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                          <option value="all">كل الأنواع</option>
                          <option value="return">استرجاع مالي</option>
                          <option value="exchange">استبدال مقاس/منتج</option>
                          <option value="complaint">شكاوى وتصعيد مباشر</option>
                        </select>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="premium-card smooth-shadow overflow-hidden">
                      <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-stone-900">سجل طلبات التعويض</h3>
                        <span className="text-xs text-stone-500">تم العثور على {filteredRequests.length} طلب</span>
                      </div>

                      {filteredRequests.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-stone-50 border-b border-stone-200/50 text-stone-400 font-semibold">
                              <tr>
                                <th className="px-6 py-4">معرف تتبع حلّها</th>
                                <th className="px-6 py-4">العميل ومعلومات المشتري</th>
                                <th className="px-6 py-4">رقم الفاتورة الأصلية</th>
                                <th className="px-6 py-4">نوع الطلب</th>
                                <th className="px-6 py-4">تاريخ التقديم</th>
                                <th className="px-6 py-4">مرحلة الطلب الحالية</th>
                                <th className="px-6 py-4 text-center">الإجراءات</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                              {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-stone-50/50 transition-all">
                                  <td className="px-6 py-4.5 font-bold text-stone-900">{req.id}</td>
                                  <td className="px-6 py-4.5">
                                    <p className="font-bold text-stone-950">{req.customerName}</p>
                                    <p className="text-[10px] text-stone-400 font-mono mt-0.5" dir="ltr">{req.customerPhone}</p>
                                  </td>
                                  <td className="px-6 py-4.5 font-mono text-stone-800 font-semibold">{req.orderNumber}</td>
                                  <td className="px-6 py-4.5">{getTypeBadge(req.type)}</td>
                                  <td className="px-6 py-4.5 font-mono text-stone-500">{req.createdAt.split('T')[0]}</td>
                                  <td className="px-6 py-4.5">{getStatusBadge(req.status)}</td>
                                  <td className="px-6 py-4.5 text-center">
                                    <button
                                      onClick={() => setSelectedRequest(req)}
                                      className="px-3 py-1.5 text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg hover:bg-teal-100 font-bold"
                                    >
                                      معالجة الطلب
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-16 text-stone-400 space-y-3">
                          <span className="text-4xl">🔍</span>
                          <h4 className="text-sm font-bold text-stone-800">لا توجد نتائج مطابقة لبحثك</h4>
                          <p className="text-xs text-stone-500 max-w-xs mx-auto">حاول مراجعة خيارات التصفية أو إدخال رقم تتبع طلب صحيح.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Escalated tab (shortcut) */}
                {ownerTab === 'escalated' && (
                  <div className="space-y-6">
                    <div className="premium-card p-6 smooth-shadow">
                      <div className="border-b border-stone-100 pb-4 mb-4">
                        <h3 className="text-sm font-bold text-stone-900">الحالات المعلقة التي جرى تصعيدها لإشراف المالك</h3>
                        <p className="text-xs text-stone-500 mt-1">طلبات استثنائية تجاوزت فترة الصلاحية المسموحة أو رُفعت من ممثلي الدعم الفني لإصدار قرار تحويل مالي تعويضي بشكل مباشر.</p>
                      </div>

                      {escalatedRequests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {escalatedRequests.map((req) => (
                            <div key={req.id} className="border border-rose-100 bg-[#fffdfd] p-5 rounded-2xl smooth-shadow flex flex-col justify-between space-y-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold font-mono text-stone-900">{req.id}</span>
                                  {getStatusBadge(req.status)}
                                </div>
                                <div className="text-xs text-stone-600">
                                  <p>العميل: <span className="font-bold text-stone-800">{req.customerName}</span></p>
                                  <p>الطلب الأصلي: <span className="font-bold font-mono">{req.orderNumber}</span></p>
                                </div>
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">سبب التصعيد:</span>
                                  <p className="text-xs text-rose-900 mt-1.5 leading-relaxed font-medium">"{req.escalationReason}"</p>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
                              >
                                اتخاذ القرار الحاسم
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 text-stone-400 space-y-3">
                          <span className="text-5xl">🎉</span>
                          <h4 className="text-sm font-bold text-stone-800">لوحتك خالية من التصعيدات</h4>
                          <p className="text-xs text-stone-500 max-w-sm mx-auto">لم يقم الدعم الفني بتصعيد أي قضايا اليوم. جميع العمليات تجري ضمن الحدود التنظيمية المسموحة تلقائياً.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reports tab */}
                {ownerTab === 'reports' && (
                  <div className="space-y-6">
                    {/* Filter Panel */}
                    <div className="premium-card p-6 smooth-shadow">
                      <div className="flex items-center gap-2 border-b border-stone-100 pb-4 mb-6">
                        <Filter className="w-5 h-5 text-teal-600" />
                        <div>
                          <h3 className="text-sm font-bold text-stone-900">تصفية وضبط التقارير الدورية</h3>
                          <p className="text-xs text-stone-500 mt-1">حدد النطاق التشغيلي، الفئة الإجرائية، والمدة الزمنية للبيانات المراد استخراجها.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Store filter */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">المتجر المتأثر</label>
                          <select 
                            value={reportStoreFilter}
                            onChange={(e) => setReportStoreFilter(e.target.value)}
                            className="w-full text-xs border border-stone-200 rounded-lg p-2.5 bg-stone-50 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                          >
                            <option value="all">جميع المتاجر المتصلة</option>
                            {uniqueStoreNames.map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Request type filter */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">نوع الطلب</label>
                          <select 
                            value={reportTypeFilter}
                            onChange={(e) => setReportTypeFilter(e.target.value)}
                            className="w-full text-xs border border-stone-200 rounded-lg p-2.5 bg-stone-50 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                          >
                            <option value="all">جميع الأنواع</option>
                            <option value="return">إرجاع نقدي</option>
                            <option value="exchange">استبدال منتجات</option>
                            <option value="complaint">شكاوى وبلاغات</option>
                          </select>
                        </div>

                        {/* Status filter */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">الحالة الإجرائية</label>
                          <select 
                            value={reportStatusFilter}
                            onChange={(e) => setReportStatusFilter(e.target.value)}
                            className="w-full text-xs border border-stone-200 rounded-lg p-2.5 bg-stone-50 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                          >
                            <option value="all">جميع الحالات التشغيلية</option>
                            <option value="pending_support">قيد المراجعة - الدعم الفني</option>
                            <option value="escalated_owner">مرفوع للإدارة العليا</option>
                            <option value="pending_warehouse">بانتظار وصول الشحنة للمستودع</option>
                            <option value="warehouse_inspected">تم فحص وجودة السلعة</option>
                            <option value="resolved_approved">مقبول وتسوّى بالكامل</option>
                            <option value="resolved_rejected">مرفوض ومغلق</option>
                          </select>
                        </div>

                        {/* Date filter */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">النطاق الزمني للعمليات</label>
                          <select 
                            value={reportDateFilter}
                            onChange={(e) => setReportDateFilter(e.target.value)}
                            className="w-full text-xs border border-stone-200 rounded-lg p-2.5 bg-stone-50 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                          >
                            <option value="7days">آخر ٧ أيام</option>
                            <option value="30days">آخر ٣٠ يوم</option>
                            <option value="90days">آخر ٩٠ يوم</option>
                            <option value="custom">تاريخ مخصص...</option>
                          </select>
                        </div>
                      </div>

                      {/* Custom Date inputs if Custom is selected */}
                      {reportDateFilter === 'custom' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed border-stone-200/60 max-w-xl">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 mb-1.5">تاريخ البداية</label>
                            <div className="relative">
                              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                              <input 
                                type="date"
                                value={reportStartDate}
                                onChange={(e) => setReportStartDate(e.target.value)}
                                className="w-full text-xs border border-stone-200 rounded-lg p-2.5 pl-3 pr-10 bg-stone-50 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 mb-1.5">تاريخ النهاية</label>
                            <div className="relative">
                              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                              <input 
                                type="date"
                                value={reportEndDate}
                                onChange={(e) => setReportEndDate(e.target.value)}
                                className="w-full text-xs border border-stone-200 rounded-lg p-2.5 pl-3 pr-10 bg-stone-50 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Operational Summary Bento Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Metric 1 */}
                      <div className="premium-card p-5 smooth-shadow flex flex-col justify-between bg-white border border-stone-200/60">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">الطلبات المستخرجة</span>
                        <div className="mt-4">
                          <h3 className="text-2xl font-extrabold text-stone-900 font-mono leading-none">{reportsCount}</h3>
                          <p className="text-[10px] text-stone-500 mt-1.5 flex items-center gap-1">
                            <span className="text-teal-600 font-bold">↑ ١٢٪</span>
                            <span>عن الربع الماضي</span>
                          </p>
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div className="premium-card p-5 smooth-shadow flex flex-col justify-between bg-white border border-stone-200/60">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">معدل التسوية والموافقة</span>
                        <div className="mt-4">
                          <h3 className="text-2xl font-extrabold text-teal-600 font-mono leading-none">{reportsApprovedRate}%</h3>
                          <p className="text-[10px] text-stone-500 mt-1.5 flex items-center gap-1">
                            <span>متوافق مع مستهدف السياسة</span>
                          </p>
                        </div>
                      </div>

                      {/* Metric 3 */}
                      <div className="premium-card p-5 smooth-shadow flex flex-col justify-between bg-white border border-stone-200/60">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">القيمة الإجمالية المفحوصة</span>
                        <div className="mt-4">
                          <h3 className="text-2xl font-extrabold text-stone-900 font-mono leading-none">{reportsTotalValue.toLocaleString('en-US')} <span className="text-xs font-bold text-stone-400">ر.س</span></h3>
                          <p className="text-[10px] text-stone-500 mt-1.5 flex items-center gap-1">
                            <span>تشمل جميع الطلبات المصفاة</span>
                          </p>
                        </div>
                      </div>

                      {/* Metric 4 */}
                      <div className="premium-card p-5 smooth-shadow flex flex-col justify-between bg-teal-50/20 border-teal-100">
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">المبالغ المستردة للعملاء</span>
                        <div className="mt-4">
                          <h3 className="text-2xl font-extrabold text-teal-700 font-mono leading-none">{reportsApprovedValue.toLocaleString('en-US')} <span className="text-xs font-bold text-teal-600">ر.س</span></h3>
                          <p className="text-[10px] text-teal-600 mt-1.5 flex items-center gap-1">
                            <span>موافقات مكتملة ومحوّلة</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights & Export Actions Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* AI Advisor Panel */}
                      <div className="lg:col-span-7 premium-card p-6 smooth-shadow flex flex-col justify-between bg-stone-50/50 border-stone-200">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                            <span>تحليل وتوصيات حلّها الذكيّ (AI-Advisor)</span>
                          </h4>
                          <p className="text-xs text-stone-600 leading-relaxed pt-1">
                            نلاحظ ارتفاع نسبة التعويضات لتصل لـ <span className="text-teal-700 font-bold">{reportsApprovedRate}%</span>، وتتركز معظمها في المنتجات المصنفة تحت مسبب "عيب مصنعي". ننصح بمراجعة جودة الشحنات قبل تفريغها بالمستودعات لتقليل الارتجاع والتعويض بمعدل تقديري يصل لـ ١٨٪.
                          </p>
                        </div>
                        <div className="text-[11px] text-teal-700 bg-teal-50/70 border border-teal-100/50 p-3 rounded-xl flex items-center gap-2 mt-4 font-bold">
                          <span>💡</span>
                          <span>توفير مالي محتمل: حوالي ٤,٢٠٠ ر.س شهرياً عند معالجة جودة شحنات المتجر المتأثر الرئيسي.</span>
                        </div>
                      </div>

                      {/* Export Action Controls */}
                      <div className="lg:col-span-5 premium-card p-6 smooth-shadow flex flex-col justify-between bg-white border border-stone-200">
                        <div>
                          <h4 className="text-xs font-bold text-stone-900">تصدير وتحميل التقارير الدورية</h4>
                          <p className="text-xs text-stone-500 mt-1 leading-relaxed">بإمكانك استخراج تقرير دوري للعمليات المصفاة لمشاركته ماليّاً أو إداريّاً.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                          {/* Export CSV Button */}
                          <button 
                            onClick={handleExportCSV}
                            disabled={reportsCount === 0}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                              reportsCount === 0 
                              ? 'bg-stone-100 text-stone-400 border border-stone-200/40 cursor-not-allowed'
                              : 'bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-300 text-stone-700 hover:shadow-xs active:scale-[0.98]'
                            }`}
                          >
                            <Download className="w-4 h-4 shrink-0" />
                            <span>جدول CSV</span>
                          </button>

                          {/* Export PDF Button */}
                          <button 
                            onClick={handleExportPDF}
                            disabled={reportsCount === 0}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                              reportsCount === 0 
                              ? 'bg-stone-100 text-stone-400 border border-stone-200/40 cursor-not-allowed'
                              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 hover:shadow-lg active:scale-[0.98]'
                            }`}
                          >
                            <Printer className="w-4 h-4 shrink-0" />
                            <span>تقرير PDF رسمي</span>
                          </button>
                        </div>

                        {reportsCount === 0 && (
                          <p className="text-[10px] text-rose-600 font-medium text-center mt-3">⚠️ لا توجد طلبات في الفلتر الحالي لتصديرها.</p>
                        )}
                      </div>
                    </div>

                    {/* Report Live Preview Table */}
                    <div className="premium-card p-6 smooth-shadow">
                      <div className="border-b border-stone-100 pb-4 mb-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-stone-900">معاينة مباشرة لسجلات التقرير ({reportsCount} طلب)</h4>
                          <p className="text-[11px] text-stone-400 mt-0.5">مراجعة سريعة للبيانات التي سيتم تضمينها في الملفات المصدرة.</p>
                        </div>
                        <span className="text-[11px] bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md font-mono">UTF-8 / A4 Printable</span>
                      </div>

                      {reportingFilteredRequests.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse">
                            <thead>
                              <tr className="border-b border-stone-100 bg-stone-50/50">
                                <th className="px-4 py-3 text-[10px] font-bold text-stone-400 uppercase">رقم طلب حلّها</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-stone-400 uppercase">العميل</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-stone-400 uppercase">المتجر</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-stone-400 uppercase">النوع</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-stone-400 uppercase">حالة العملية</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-stone-400 uppercase text-left">قيمة الطلب</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-stone-400 uppercase text-left">تاريخ الإنشاء</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportingFilteredRequests.map((req) => {
                                const totalValue = req.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                const typeAr = req.type === 'return' ? 'إرجاع' : req.type === 'exchange' ? 'استبدال' : 'شكوى';
                                
                                return (
                                  <tr key={req.id} className="border-b border-stone-100/50 hover:bg-stone-50/30 transition">
                                    <td className="px-4 py-3 text-xs font-bold text-stone-900 font-mono">{req.id}</td>
                                    <td className="px-4 py-3 text-xs text-stone-700 font-medium">{req.customerName}</td>
                                    <td className="px-4 py-3 text-xs text-stone-600">{req.storeName}</td>
                                    <td className="px-4 py-3 text-xs text-stone-500 font-medium">{typeAr}</td>
                                    <td className="px-4 py-3 text-xs">
                                      {req.status === 'resolved_approved' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">مقبول ومسوى</span>
                                      )}
                                      {req.status === 'resolved_rejected' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">مرفوض ومغلق</span>
                                      )}
                                      {req.status === 'pending_support' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">مع الدعم الفني</span>
                                      )}
                                      {req.status === 'escalated_owner' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">مرفوع للإدارة</span>
                                      )}
                                      {req.status === 'pending_warehouse' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">بانتظار المستودع</span>
                                      )}
                                      {req.status === 'warehouse_inspected' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">تم الفحص</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-stone-900 font-mono text-left">{totalValue.toLocaleString('en-US')} ر.س</td>
                                    <td className="px-4 py-3 text-xs text-stone-500 font-mono text-left">{new Date(req.createdAt).toLocaleDateString('ar-SA')}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-10 text-stone-400 space-y-2">
                          <span className="text-3xl">📭</span>
                          <h5 className="text-xs font-bold text-stone-800">لا توجد سجلات مطابقة</h5>
                          <p className="text-[11px] text-stone-500 max-w-xs mx-auto">عدّل مرشحات التصفية بالأعلى لرؤية السجلات المشمولة بالتقرير الدوري.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Settings tab */}
                {ownerTab === 'settings' && (
                  <div className="max-w-2xl mx-auto premium-card p-6 md:p-8 smooth-shadow space-y-6">
                    <div className="border-b border-stone-100 pb-4">
                      <h3 className="text-sm font-bold text-stone-900">إعدادات سياسة الاسترجاع والتعويض</h3>
                      <p className="text-xs text-stone-500 mt-1">تعديل نوافذ القبول وضوابط الموافقة التلقائية لعملاء متجرك.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Window setting */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">نافذة استلام الطلبات الفعّالة (بالأيام)</label>
                        <select
                          value={returnWindow}
                          onChange={(e) => setReturnWindow(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8]"
                        >
                          <option value={7}>٧ أيام (الحد القانوني الأدنى)</option>
                          <option value={15}>١٥ يوماً (السياسة القياسية الموصى بها)</option>
                          <option value={30}>٣٠ يوماً (أعلى رضا للمشتري)</option>
                        </select>
                        <p className="text-[10px] text-stone-400 mt-1">لا يسمح النظام للعميل بطلب استرجاع من بوابة الخدمة بعد تخطي هذه الفترة تلقائياً.</p>
                      </div>

                      {/* Auto approval toggle */}
                      <div className="pt-3 border-t border-stone-100 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-stone-700">الموافقة التلقائية لطلبات الاسترجاع (Auto-Approval)</label>
                          <p className="text-[10px] text-stone-400 leading-relaxed max-w-md">توليد بوليصة الشحن العكسي للعميل مباشرة فور تقديم الطلب لتقليل العبء الإداري، باستثناء الحالات الخاصة.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoApproval}
                          onChange={(e) => setAutoApproval(e.target.checked)}
                          className="w-4 h-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500 mt-1 cursor-pointer"
                        />
                      </div>

                      {/* Logistics provider */}
                      <div className="pt-3 border-t border-stone-100">
                        <label className="block text-xs font-bold text-stone-700 mb-1">شريك الشحن اللوجستي العكسي الافتراضي</label>
                        <select
                          value={shippingProvider}
                          onChange={(e) => setShippingProvider(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-[#fbfaf8]"
                        >
                          <option value="smsa">سمسا اكسبريس (SMSA Express) - بوليصة مرتجع مخفضة</option>
                          <option value="aramex">أرامكس للشحن (Aramex) - تسليم فرع أو استلام منزل</option>
                          <option value="spl">البريد السعودي سبل (SPL)</option>
                        </select>
                      </div>

                      <button
                        onClick={() => alert('تم حفظ الإعدادات الفنية لسياسة المرتجعات بنجاح!')}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs mt-4"
                      >
                        حفظ إعدادات السياسة الفنيّة للمتجر
                      </button>
                    </div>
                  </div>
                )}

                {/* Team tab */}
                {ownerTab === 'team' && (
                  <div className="space-y-6">
                    <div className="premium-card p-6 smooth-shadow">
                      <div className="border-b border-stone-100 pb-4 mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-stone-900">سجل تراخيص وصلاحيات الموظفين</h3>
                          <p className="text-xs text-stone-500 mt-1">تحديد المسؤوليات بين ممثلي الدعم الفني وأخصائيي فحص المستودعات.</p>
                        </div>
                        <button
                          onClick={() => alert('إضافة موظف جديد متاحة لملاك المتاجر في باقة برو فما فوق.')}
                          className="px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-stone-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة موظف</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="border border-stone-200/50 p-4 rounded-xl flex items-center gap-3">
                            <span className="text-3xl bg-stone-100 p-2.5 rounded-xl">{member.avatar}</span>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-stone-900">{member.name}</h4>
                              <p className="text-[10px] text-stone-500 font-mono">{member.email}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  member.role === 'owner' ? 'bg-purple-100 text-purple-700' : member.role === 'support' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {member.role === 'owner' && 'المالك'}
                                  {member.role === 'support' && 'دعم عملاء'}
                                  {member.role === 'warehouse' && 'فني فحص'}
                                </span>
                                <span className="text-[10px] text-stone-400 font-medium">نشط: {member.lastActive}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SUPPORT ROLE PAGES */}
            {role === 'support' && (
              <>
                {supportTab === 'dashboard' && (
                  <div className="space-y-8">
                    {/* Support queue cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="premium-card p-5 smooth-shadow">
                        <span className="text-xs font-semibold text-stone-400">حالات جارية بانتظار تفتيش الدعم الفني</span>
                        <p className="text-4xl font-bold font-mono text-amber-500 mt-2">{pendingSupportRequests.length}</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">الوقت المستهدف للتصفية: ساعة واحدة</p>
                      </div>

                      <div className="premium-card p-5 smooth-shadow">
                        <span className="text-xs font-semibold text-stone-400">حالات بانتظار شحن المستودع من المشتري</span>
                        <p className="text-4xl font-bold font-mono text-indigo-500 mt-2">{pendingWarehouseRequests.length}</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">يتم تتبع بوليصات سمسا بشكل مباشر</p>
                      </div>

                      <div className="premium-card p-5 smooth-shadow">
                        <span className="text-xs font-semibold text-stone-400">إجمالي التعويضات الجارية المعالجة</span>
                        <p className="text-4xl font-bold font-mono text-stone-900 mt-2">{requests.length}</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">منذ انضمام المتجر لحلّها</p>
                      </div>
                    </div>

                    <div className="bg-teal-50/20 border border-teal-200/50 p-6 rounded-2xl flex items-start gap-4">
                      <span className="p-3 bg-white rounded-xl text-teal-600 border border-teal-100"><MessageSquare className="w-6 h-6" /></span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-teal-900 uppercase">تعليمات ومسطرة الدعم الفني المعتمدة من التاجر</h4>
                        <p className="text-xs text-teal-800/80 leading-relaxed pt-1">
                          يُرجى مراجعة وتدقيق جودة صور المرتجعات المرفقة من المشتري. الحالات التي تقل قيمتها عن ٢٠٠ ر.س والكرتون مغلق يتم <span className="font-bold underline">الموافقة التلقائية الفورية</span> لتوفير بوليصة إرجاع سريعة. الحالات المعقدة أو المطالبات فوق الـ ٣٠٠ ر.س يتم تصعيدها للإشراف والمالك بالضغط على "تصعيد الطلب".
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {supportTab === 'requests' && (
                  <div className="space-y-6">
                    <div className="premium-card smooth-shadow overflow-hidden">
                      <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-stone-900">طابور مراجعة الطلبات الجارية للدعم الفني</h3>
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded font-bold">{pendingSupportRequests.length} طلب بحاجة لمراجعة وتوجيه</span>
                      </div>

                      {pendingSupportRequests.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-stone-50 border-b border-stone-200/50 text-stone-400 font-semibold">
                              <tr>
                                <th className="px-6 py-4">رقم تتبع حلّها</th>
                                <th className="px-6 py-4">العميل والمشتري</th>
                                <th className="px-6 py-4">رقم طلب المتجر</th>
                                <th className="px-6 py-4">نوع الطلب والمشكلة</th>
                                <th className="px-6 py-4">تاريخ التقديم</th>
                                <th className="px-6 py-4 text-center">الإجراء الفوري</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                              {pendingSupportRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-stone-50/50 transition-all">
                                  <td className="px-6 py-4.5 font-bold text-stone-900">{req.id}</td>
                                  <td className="px-6 py-4.5">
                                    <p className="font-bold text-stone-900">{req.customerName}</p>
                                    <p className="text-[10px] text-stone-400 font-mono mt-0.5" dir="ltr">{req.customerPhone}</p>
                                  </td>
                                  <td className="px-6 py-4.5 font-mono text-stone-800 font-semibold">{req.orderNumber}</td>
                                  <td className="px-6 py-4.5">
                                    <div className="flex flex-col gap-1 items-start">
                                      {getTypeBadge(req.type)}
                                      <span className="text-[10px] text-stone-500 line-clamp-1 max-w-xs">{req.items[0]?.reason}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4.5 font-mono text-stone-500">{req.createdAt.split('T')[0]}</td>
                                  <td className="px-6 py-4.5 text-center">
                                    <button
                                      onClick={() => setSelectedRequest(req)}
                                      className="px-3 py-1.5 text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg hover:bg-teal-100 font-bold"
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
                        <div className="text-center py-16 text-stone-400 space-y-3">
                          <span className="text-5xl">🎉</span>
                          <h4 className="text-sm font-bold text-stone-800">طابور الدعم الفني فارغ تماماً!</h4>
                          <p className="text-xs text-stone-500 max-w-sm mx-auto">تم الانتهاء من معالجة جميع المراجعات الواردة من العملاء لليوم ومطابقتها مع سياسات المتجر.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* WAREHOUSE ROLE PAGES */}
            {role === 'warehouse' && (
              <>
                {warehouseTab === 'dashboard' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="premium-card p-5 smooth-shadow">
                        <span className="text-xs font-semibold text-stone-400">شحنات مرتجعة واردة بانتظار الفحص الفعلي</span>
                        <p className="text-4xl font-bold font-mono text-indigo-600 mt-2">{pendingWarehouseRequests.length}</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">أوشكت بوليصات سمسا على الوصول للمستودع</p>
                      </div>

                      <div className="premium-card p-5 smooth-shadow">
                        <span className="text-xs font-semibold text-stone-400">مرتجعات تم فحصها وإغلاقها</span>
                        <p className="text-4xl font-bold font-mono text-stone-900 mt-2">{warehouseInspectedRequests.length + resolvedRequests.length}</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">تحديث فوري لكميات خطوط الإمداد بزد/سلة</p>
                      </div>

                      <div className="premium-card p-5 smooth-shadow">
                        <span className="text-xs font-semibold text-stone-400">نسبة إعادة المنتجات للمخزون (Restocked)</span>
                        <p className="text-4xl font-bold font-mono text-emerald-600 mt-2">٧٦%</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium">سلع بحالة ممتازة أُعيدت للرفوف كمنتجات جديدة</p>
                      </div>
                    </div>

                    <div className="bg-indigo-50/30 border border-indigo-200/50 p-6 rounded-2xl flex items-start gap-4">
                      <span className="p-3 bg-white rounded-xl text-indigo-600 border border-indigo-100"><PackageCheck className="w-6 h-6" /></span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-indigo-950 uppercase">إرشاد فني لسلامة وسير عمل المستودع</h4>
                        <p className="text-xs text-indigo-900/80 leading-relaxed pt-1">
                          تأكد من مطابقة السريال (Serial Number / SKU) للمنتج المرتجع الفعلي مع الفاتورة المرفقة. يجب وضع ملصق الفحص الفني فور الفراغ وتسجيل ملحوظاتك على نظام حلّها، فبمجرد الضغط على "إرسال التقرير"، يتم دفع إشعار تلقائي للإدارة للموافقة الفورية على تسوية حساب العميل البنكي.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {warehouseTab === 'requests' && (
                  <div className="space-y-6">
                    <div className="premium-card smooth-shadow overflow-hidden">
                      <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-stone-900">شحنات مرتجعة وصلت للمستودع وتنتظر التفتيش</h3>
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold">{pendingWarehouseRequests.length} شحنة بحاجة للتفتيش</span>
                      </div>

                      {pendingWarehouseRequests.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-stone-50 border-b border-stone-200/50 text-stone-400 font-semibold">
                              <tr>
                                <th className="px-6 py-4">رقم تتبع حلّها</th>
                                <th className="px-6 py-4">المشتري الأصلي</th>
                                <th className="px-6 py-4">المنتج والكمية</th>
                                <th className="px-6 py-4">رمز السلعة (SKU)</th>
                                <th className="px-6 py-4">حالة الشحن الحالية</th>
                                <th className="px-6 py-4 text-center">الإجراء</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                              {pendingWarehouseRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-stone-50/50 transition-all">
                                  <td className="px-6 py-4.5 font-bold text-stone-900">{req.id}</td>
                                  <td className="px-6 py-4.5 font-bold text-stone-950">{req.customerName}</td>
                                  <td className="px-6 py-4.5">
                                    <p className="font-semibold text-stone-900">{req.items[0]?.name}</p>
                                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">الكمية: {req.items[0]?.quantity} &bull; السعر: {req.items[0]?.price} ر.س</p>
                                  </td>
                                  <td className="px-6 py-4.5 font-mono text-stone-700 font-semibold">{req.items[0]?.sku}</td>
                                  <td className="px-6 py-4.5">
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded text-[10px] font-bold">
                                      وصل المستودع - انتظار الفحص
                                    </span>
                                  </td>
                                  <td className="px-6 py-4.5 text-center">
                                    <button
                                      onClick={() => setSelectedRequest(req)}
                                      className="px-3 py-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 font-bold"
                                    >
                                      افتح استمارة التفتيش
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-16 text-stone-400 space-y-3">
                          <span className="text-5xl">📦</span>
                          <h4 className="text-sm font-bold text-stone-800">مستودعك خالٍ من الشحنات المرتجعة بانتظار الفحص</h4>
                          <p className="text-xs text-stone-500 max-w-sm mx-auto">رائع! جميع الشحنات العكسية التي تم استلامها خضعت للتفتيش وتسجيل تقارير الفحص المالي.</p>
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
    </div>
  );
}
