/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RequestType = 'return' | 'exchange' | 'complaint';

export type RequestStatus =
  | 'pending_support'      // قيد المراجعة - الدعم الفني
  | 'escalated_owner'      // مرفوع لصاحب المتجر (داخلي، العميل يرى: قيد المراجعة من إدارة المتجر)
  | 'pending_warehouse'    // بانتظار الشحن/وصول المنتج للمستودع
  | 'warehouse_inspected'  // تم التفتيش في المستودع
  | 'resolved_approved'    // مقبول وتم تسوية الطلب (مكتمل)
  | 'resolved_rejected';   // مرفوض ومغلق

export type InspectionCondition =
  | 'clean_restock'   // سليم - إعادة للمخزون
  | 'damaged_scrap'   // تالف - إتلاف
  | 'used_discount'   // مستعمل - بيع مخفض
  | 'wrong_item';     // منتج خاطئ - إرجاع للعميل

export interface WarehouseInspection {
  inspectedBy: string;
  inspectedAt: string;
  condition: InspectionCondition;
  notes: string;
  photoUrl?: string;
}

export interface TimelineEvent {
  id: string;
  status: RequestStatus | 'created' | 'info_requested' | 'inspected';
  titleAr: string;
  descriptionAr: string;
  createdAt: string;
  actorName: string;
  isInternal: boolean; // إذا كان داخلياً لا يظهر للعميل (مثل الرفع لصاحب المتجر بالتفاصيل)
}

export interface RequestItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  reason: string;
  image?: string;
}

export interface CustomerRequest {
  id: string; // مثال: HAL-3904
  storeId: string;
  storeName: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerIBAN?: string;
  type: RequestType;
  items: RequestItem[];
  status: RequestStatus;
  internalNotes?: string;
  escalationReason?: string;
  infoRequestedDetails?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  inspection?: WarehouseInspection;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  domain: string;
  ownerName: string;
  ownerEmail: string;
  status: 'active' | 'suspended';
  plan: 'basic' | 'pro' | 'enterprise';
  createdAt: string;
  stats: {
    totalRequests: number;
    pendingCount: number;
    escalatedCount: number;
    avgResolutionHours: number;
    customerSatisfaction: number; // نسبة مئوية مثل 94%
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'support' | 'warehouse';
  avatar: string;
  status: 'online' | 'offline';
  lastActive: string;
}
