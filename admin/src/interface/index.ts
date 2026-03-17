export enum UserRole {
  ADMIN = "admin",
  STUDENT = "student",
}

export enum OrderRefundStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IUser {
  id?: string;
  full_name?: string;
  products_count?: number;
  email?: string;
  password?: string;
  login?: string;
  is_blocked?: boolean;
  role: UserRole;
  avatar?: string;
  balance: number;
  is_active: boolean;
  telegramId?: string;
  phone?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  CANCELED = "canceled",
}

export interface IOrder<T, U> {
  id: string;

  buyerId: U;
  sellerId: U;
  productId: T;

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

export interface IProduct<C> {
  id: string;

  name: string;
  slug: string;
  description: string;
  price: number;

  pages?: number;
  fileSize?: number;
  images?: string[];

  fileExt: string;
  poster?: string;
  fileKey: string;

  status: ProductStatus;

  categoryId: C;
  tags: string[];

  viewCount: number;
  soldCount: number;
  isLegal?: boolean;
  illegalReason?: string;

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
  createdAt: string;
  updatedAt: string;
  productsCount?: number;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export enum TransactionType {
  DEBIT = "debit",
  CREDIT = "credit",
}

export enum TransactionStatus {
  SUCCESS = "success",
  FAILED = "failed",
}

export interface Transaction<U> {
  id: string;
  userId: U;
  orderId?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  provider?: string;
  createdAt: string;
  updatedAt: string;
}

export enum WithdrawalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface Withdrawal<U> {
  id: string;
  sellerId: U;
  amount: number;
  paymentProofKey: string;
  cardNumber: string;
  status: WithdrawalStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOffer<U> {
  id: string;
  userId: U;
  text: string;
  response: string | null;
  createdAt: string;
  respondedAt?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  platformCommission: number;
  pendingProducts: number;
  pendingWithdrawals: number;
}

// Settings
export interface PlatformSettings {
  buyerCommissionRate: number;
  minWithdrawalAmount: number;
  sellerCommissionRate: number;
  maxDownloadLimit: number;
  repairMode: boolean;
}
