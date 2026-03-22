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
