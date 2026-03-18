import { IUser } from "@/interface";
import { create } from "zustand";

type AuthStoreType = {
  isLoading: boolean;
  isAuth: boolean;
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  setLoading: (bool: boolean) => void;
  setIsAuth: (bool: boolean) => void;
};

export const authStore = create<AuthStoreType>((set) => ({
  isLoading: true,
  isAuth: false,
  user: {} as IUser,
  setUser: (user) => set({ user }),
  setLoading: (bool) => set({ isLoading: bool }),
  setIsAuth: (bool) => set({ isAuth: bool }),
}));
