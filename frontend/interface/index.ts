export enum UserRole {
  BUYER = "buyer",
  SELLER = "seller",
  ADMIN = "admin",
  GHOST = "ghost",
  MODERATOR = "moderator",
}

export interface IUser {
  id?: string;
  full_name?: string;
  email?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  balance: number;
  is_active: boolean;
  telegramId?: number;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  CANCELED = "canceled",
}

export enum OrderRefundStatus {
  PENDING = "pending", // So'rov yuborilgan, admin kutyapti
  APPROVED = "approved", // Pul qaytarilgan
  REJECTED = "rejected", // Rad etilgan
}

export interface IRefund {
  id: string;

  orderId: string;
  buyerId: string;
  sellerId: string;

  productPrice: number;
  buyerCommission: number;
  refundAmount: number;

  reason: string;
  status: RefundStatus;

  moderatorId?: string;
  adminId?: string;
  adminNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder<T> {
  id: string;

  buyerId: string;
  sellerId: string;
  productId: T;

  refundStatus: RefundStatus;

  productPrice: number;

  buyerCommissionRate: number;
  sellerCommissionRate: number;

  buyerCommission: number;
  sellerCommission: number;

  totalAmount: number;
  sellerPayout: number;

  status: OrderStatus;

  createdAt: string;
  updatedAt: string;
}

export enum ProductStatus {
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum RefundStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IProduct<C, A> {
  id: string;

  name: string;
  slug: string;
  description: string;
  price: number;
  images?: string[];

  pages?: number;
  fileSize?: number;

  fileExt: string;
  poster?: string;
  fileKey: string;

  status: ProductStatus;

  previewPdf?: string;

  categoryId: C;
  tags: string[];

  authorId: A;

  viewCount: number;
  soldCount: number;

  rejectionReason?: string;

  approvedAt?: string;
  rejectedAt?: string;

  moderatedBy?: string;
  moderatorNote?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
  updated_at: string;
  productsCount?: number;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
