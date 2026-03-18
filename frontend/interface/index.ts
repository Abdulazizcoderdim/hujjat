export enum UserRole {
  ADMIN = "admin",
  STUDENT = "student",
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
  hemis_id?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  CANCELED = "canceled",
}

export enum ProductStatus {
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
