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
  | 'good_condition'       // سليم وبحالة ممتازة
  | 'damaged'              // تالف
  | 'used'                 // مستعمل
  | 'wrong_item'           // منتج خاطئ
  | 'missing_accessories'; // نقص ملحقات / إكسسوارات

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
  sizeDesired?: string;
  colorDesired?: string;
  additionalNotes?: string;
  complaintType?: string;
  problemDetails?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  status: 'pending' | 'active' | 'disabled';
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  customerPortalUrl: string;
  activationUrl: string;
  createdAt: string;
  requestsCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'store_owner' | 'customer_support' | 'warehouse_agent';
  status: 'pending_activation' | 'active' | 'disabled';
  activationUrl: string;
  createdAt: string;
}
