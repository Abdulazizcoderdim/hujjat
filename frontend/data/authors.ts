import { User } from "@/types";

export const authors: User[] = [
  {
    id: "1",
    name: "Aziz Karimov",
    email: "aziz@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    bio: "Biznes va moliya sohasida 5 yillik tajribaga ega mutaxassis. Professional hujjatlar yaratish bo'yicha ekspert.",
    joined_at: "2023-06-15",
    purchased_products: [],
  },
  {
    id: "2",
    name: "Malika Rahimova",
    email: "malika@example.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    bio: "Ta'lim sohasida 8 yillik tajriba. O'quv materiallari va taqdimotlar yaratish bo'yicha mutaxassis.",
    joined_at: "2023-08-20",
    purchased_products: [],
  },
  {
    id: "3",
    name: "Sardor Aliyev",
    email: "sardor@example.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    bio: "Yuridik hujjatlar va davlat xaridlari bo'yicha 10 yillik tajribaga ega advokat.",
    joined_at: "2023-04-10",
    purchased_products: [],
  },
];

export const getAuthorById = (id: string): User | undefined => {
  return authors.find((author) => author.id === id);
};
