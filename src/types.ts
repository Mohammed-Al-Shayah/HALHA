/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RequestType = 'return' | 'exchange' | 'complaint';

export type RequestStatus =
  | 'new'                     // جديد
  | 'under_review'            // قيد المراجعة
  | 'waiting_customer_info'   // بانتظار معلومات العميل
  | 'escalated_to_owner'      // مرفوع لصاحب المتجر
  | 'approved'                // مقبول
  | 'rejected'                // مرفوض
  | 'received'                // تم الاستلام بالمستودع
  | 'completed'               // مكتمل
  | 'cancelled';              // ملغي

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

export interface RequestMessage {
  id: string;
  sender: 'merchant' | 'customer';
  senderName: string;
  text: string;
  createdAt: string;
  photoUrl?: string;
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
  messages?: RequestMessage[];
}

export interface Store {
  id: string;
  name: string;
  slug?: string;
  logo: string;
  domain: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  status: 'pending' | 'active' | 'disabled';
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
  status: 'pending_activation' | 'active' | 'disabled';
  lastActive: string;
}
