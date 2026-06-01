export enum UserRole {
  ADMIN = "admin",
  STUDENT = "student",
  OPERATOR = "operator",
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
  shelfCode?: string;
  udc?: string;
  uploadedBy?: {
    id: number;
    full_name?: string;
    email?: string;
    login?: string;
  } | null;

  createdAt: string;
  updatedAt: string;
}

export interface IOperatorListItem {
  id: number;
  full_name?: string;
  email?: string;
  login?: string;
  phone?: string;
  image?: string;
  is_active: boolean;
  is_blocked: boolean;
  createdAt: string;
  uploadedTotal: number;
  uploaded7Days: number;
  uploaded30Days: number;
  lastLoginAt: string | null;
}

export interface IOperatorDetail {
  operator: {
    id: number;
    full_name?: string;
    email?: string;
    login?: string;
    phone?: string;
    image?: string;
    is_active: boolean;
    is_blocked: boolean;
    createdAt: string;
  };
  stats: {
    uploadedTotal: number;
    uploaded7Days: number;
    uploaded30Days: number;
    loginCount: number;
    lastLoginAt: string | null;
  };
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

export type LoanStatus = "active" | "returned" | "lost";

export interface ILoanUser {
  id: number;
  full_name?: string;
  first_name?: string;
  second_name?: string;
  login?: string;
  student_id_number?: string;
  group?: string;
  faculty?: string;
  level?: string;
  image?: string;
}

export interface IActiveLoanShort {
  id: number;
  borrowedAt: string;
  dueAt: string;
  user: { id: number; full_name?: string; login?: string } | null;
}

export interface ICatalogProduct extends IProduct<ICategory> {
  isAvailable: boolean;
  activeLoan: IActiveLoanShort | null;
}

export type BookRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "fulfilled";

export interface IBookRequest {
  id: number;
  requestedBy: {
    id: number;
    full_name?: string;
    login?: string;
    email?: string;
    group?: string;
    student_id_number?: string;
    image?: string;
  } | null;
  title: string;
  author: string | null;
  description: string | null;
  reason: string | null;
  status: BookRequestStatus;
  adminNote: string | null;
  reviewedBy: {
    id: number;
    full_name?: string;
    email?: string;
  } | null;
  reviewedAt: string | null;
  fulfilledProduct: {
    id: number;
    name: string;
    poster?: string;
    author?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface IBookRequestStats {
  since: string;
  byStatus: Record<BookRequestStatus, number>;
  total: number;
  recentCount: number;
  topRequested: {
    titleKey: string;
    title: string;
    author: string | null;
    count: number;
    lastRequestedAt: string;
  }[];
  topRequesters: {
    userId: number;
    full_name: string | null;
    login: string | null;
    group: string | null;
    count: number;
  }[];
}

export type LoginEventStatus = "success" | "failed";
export type LoginEventMethod = "admin_password" | "hemis" | "google" | "refresh";
export type LoginEventReason =
  | "wrong_password"
  | "user_not_found"
  | "blocked"
  | "inactive"
  | "hemis_error"
  | "google_error"
  | "refresh_invalid"
  | "unknown";

export interface ILoginEvent {
  id: number;
  user: {
    id: number;
    full_name?: string;
    login?: string;
    email?: string;
    role?: string;
  } | null;
  attemptedLogin: string | null;
  method: LoginEventMethod;
  status: LoginEventStatus;
  reason: LoginEventReason | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export type AdminActionType =
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "product_status_changed"
  | "user_created"
  | "user_updated"
  | "user_deleted"
  | "user_blocked"
  | "user_unblocked"
  | "category_created"
  | "category_updated"
  | "category_deleted"
  | "loan_created"
  | "loan_returned"
  | "hemis_sync_started";

export type AdminTargetType =
  | "product"
  | "user"
  | "category"
  | "loan"
  | "system";

export interface IAdminAction {
  id: number;
  actor: {
    id: number;
    full_name?: string;
    login?: string;
    email?: string;
  } | null;
  action: AdminActionType;
  targetType: AdminTargetType | null;
  targetId: number | null;
  summary: string | null;
  payload: any;
  ip: string | null;
  createdAt: string;
}

export interface IReadingSessionAdmin {
  id: number;
  user: ILoanUser;
  user_id: number;
  product: IProduct<ICategory>;
  product_id: number;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  startPage: number;
  endPage: number;
  createdAt: string;
}

export type HemisSyncStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface IHemisSyncJob {
  id: number;
  status: HemisSyncStatus;
  startedAt: string | null;
  finishedAt: string | null;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  processedRecords: number;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  error: string | null;
  triggeredBy: { id: number; full_name?: string; login?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ILoan {
  id: number;
  product: IProduct<ICategory>;
  user: ILoanUser;
  librarian: ILoanUser | null;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  status: LoanStatus;
  notes: string | null;
  createdAt: string;
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
