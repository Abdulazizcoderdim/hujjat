export type ProductStatus = "active" | "inactive" | "pending";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  pages: number;
  size: string;
  ext: "pdf" | "docx" | "pptx" | "xlsx" | "txt";
  poster: string;
  file_url: string;
  view_count: number;
  sold_count: number;
  status: ProductStatus;
  category_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  joined_at: string;
  purchased_products: string[];
}
