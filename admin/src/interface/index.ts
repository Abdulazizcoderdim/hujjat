export enum UserRole {
  BUYER = "buyer",
  SELLER = "seller",
  ADMIN = "admin",
  GHOST = "ghost",
  MODERATOR = "moderator",
}

export enum OrderRefundStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IUser {
  _id?: string;
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
  _id: string;

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
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  DISABLED = "disabled",
  REGENERATE = "regenerate",
  PREVIEW = "preview",
}

export interface IProduct<C, A> {
  _id: string;

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

  authorId: A;

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
  _id: string;
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
  _id: string;
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
  _id: string;
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
  _id: string;
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
