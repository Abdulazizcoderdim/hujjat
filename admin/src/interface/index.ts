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
  id: number;
  first_name?: string;
  second_name?: string;
  third_name?: string;
  full_name?: string;
  short_name?: string;
  email?: string;
  login?: string;
  password?: string;
  student_id_number?: string;
  university?: string;
  faculty?: string;
  group?: string;
  specialty?: string;
  semester?: string;
  level?: string;
  role: UserRole;
  phone?: string;
  image?: string;
  birth_date?: number;
  address?: string;
  is_active: boolean;
  is_blocked: boolean;
  googleId?: string;
  hash?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
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
  id: number;

  name: string;
  slug: string;
  description: string;
  price: number;

  pages?: number;
  fileSize?: number;

  fileExt: string;
  poster?: string;
  fileUrl: string;

  status: ProductStatus;

  category: C;
  tags: string[];

  viewCount: number;

  author?: string;
  year?: number;
  language?: string;

  isCurriculumBook?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ICurriculum {
  id: number;
  name: string;
}

export interface ISubject {
  id: number;
  name: string;
}

export interface ISemester {
  id: number;
  name: string;
  value?: number;
}

export interface ICurriculumLink {
  id: number;
  curriculumId: number;
  semester: number;
  subjectId: number;
  isMain: boolean;
  createdAt?: string;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
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
