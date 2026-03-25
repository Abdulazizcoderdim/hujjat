import { IProduct, IUser } from "@/interface";

export interface UserBookProgress {
  id: number;
  lastPage: number;
  progress: number;
  isFinished: boolean;
}

export type Theme = "light" | "sepia" | "dark";

export interface ThemeConfig {
  bg: string;
  fg: string;
  overlay: string;
  accent: string;
  label: string;
  icon: React.ReactNode;
}

export interface PageProps {
  pageImage: string | undefined;
  pageNum: number;
  totalPages: number;
  theme: Theme;
}

export type StartSessionDto = {
  productId: number;
  startPage: number;
};

export type EndSessionDto = {
  endPage: number;
};

export interface IReadingSession {
  id: number;

  user: IUser;
  user_id: number;

  product: IProduct<string>;
  product_id: number;

  startedAt: number;
  endedAt?: number | null;

  durationSeconds: number;

  startPage: number;
  endPage: number;

  createdAt: Date;
}

export interface IStudentStats {
  totalBooks: number;
  finishedBooks: number;
  inProgressBooks: number;
  totalReadingMinutes: number;
  totalReadingHours: number;
}
