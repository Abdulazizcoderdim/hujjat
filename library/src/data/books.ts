import bookAlgorithms from "@/assets/book-algorithms.jpg";
import bookDatabase from "@/assets/book-database.jpg";
import bookEconomics from "@/assets/book-economics.jpg";
import bookPhysics from "@/assets/book-physics.jpg";
import bookProgramming from "@/assets/book-programming.jpg";
import bookMath from "@/assets/book-math.jpg";

export interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  year?: number;
  pages?: number;
  language?: string;
  category?: string;
  description?: string;
}

export const allBooks: Book[] = [
  {
    id: 1,
    title: "Algoritmlar asoslari",
    author: "A. Xolmatov",
    cover: bookAlgorithms,
    year: 2023,
    pages: 342,
    language: "O'zbek",
    category: "Axborot texnologiyalari",
    description:
      "Ushbu kitobda algoritmlar va ma'lumotlar tuzilmalari haqida keng qamrovli ma'lumot berilgan. Saralash, qidirish, graflar va dinamik dasturlash usullari batafsil tushuntirilgan. Har bir mavzu amaliy misollar va mashqlar bilan boyitilgan.",
  },
  {
    id: 2,
    title: "Ma'lumotlar bazasi",
    author: "D. Karimov",
    cover: bookDatabase,
    year: 2022,
    pages: 278,
    language: "O'zbek",
    category: "Axborot texnologiyalari",
    description:
      "Relyatsion ma'lumotlar bazalari, SQL so'rovlari, normalizatsiya va indekslash haqida amaliy qo'llanma. PostgreSQL va MySQL misollarida tushuntirilgan.",
  },
  {
    id: 3,
    title: "Iqtisodiyot nazariyasi",
    author: "S. Raximova",
    cover: bookEconomics,
    year: 2023,
    pages: 410,
    language: "O'zbek",
    category: "Iqtisodiyot",
    description:
      "Mikro va makroiqtisodiyot asoslarini o'z ichiga olgan darslik. Talab va taklif, bozor muvozanati, inflyatsiya va iqtisodiy o'sish nazariyalari batafsil yoritilgan.",
  },
  {
    id: 4,
    title: "Fizika asoslari",
    author: "N. Toshpulatov",
    cover: bookPhysics,
    year: 2021,
    pages: 520,
    language: "O'zbek",
    category: "Muhandislik",
    description:
      "Mexanika, termodinamika, elektromagnetizm va optika bo'limlarini qamrab olgan fundamental fizika darsligi. Laboratoriya ishlari va masalalar to'plami kiritilgan.",
  },
  {
    id: 5,
    title: "Dasturlash tillari",
    author: "B. Abdullayev",
    cover: bookProgramming,
    year: 2024,
    pages: 298,
    language: "O'zbek",
    category: "Axborot texnologiyalari",
    description:
      "Python, JavaScript va C++ dasturlash tillari asoslari. Har bir til uchun amaliy loyihalar va mashqlar berilgan. Boshlang'ich va o'rta darajadagi dasturchilar uchun.",
  },
  {
    id: 6,
    title: "Matematika",
    author: "F. Mirzayev",
    cover: bookMath,
    year: 2022,
    pages: 456,
    language: "O'zbek",
    category: "Gumanitar fanlar",
    description:
      "Oliy matematika kursi: chiziqli algebra, matematik analiz, differentsial tenglamalar va ehtimollar nazariyasi. Universitetning barcha yo'nalishlari uchun mo'ljallangan.",
  },
  {
    id: 7,
    title: "Sun'iy intellekt",
    author: "R. Yusupov",
    cover: bookAlgorithms,
    year: 2024,
    pages: 312,
    language: "O'zbek",
    category: "Axborot texnologiyalari",
    description:
      "Mashinali o'rganish, neyron tarmoqlar va tabiiy tilni qayta ishlash asoslari. TensorFlow va PyTorch kutubxonalari bilan amaliy misollar.",
  },
  {
    id: 8,
    title: "Kiberxavfsizlik",
    author: "T. Ergashev",
    cover: bookProgramming,
    year: 2023,
    pages: 268,
    language: "O'zbek",
    category: "Axborot texnologiyalari",
    description:
      "Tarmoq xavfsizligi, kriptografiya, zararli dasturlar tahlili va axborot xavfsizligi standartlari. Amaliy laboratoriya ishlari bilan.",
  },
  {
    id: 9,
    title: "Statistika",
    author: "O. Nazarova",
    cover: bookMath,
    year: 2022,
    pages: 234,
    language: "O'zbek",
    category: "Iqtisodiyot",
    description:
      "Statistik tahlil usullari, regressiya, korrelyatsiya va gipotezalarni tekshirish. SPSS va Excel dasturlarida amaliy misollar.",
  },
  {
    id: 10,
    title: "Elektrotexnika",
    author: "H. Ismoilov",
    cover: bookPhysics,
    year: 2021,
    pages: 380,
    language: "O'zbek",
    category: "Muhandislik",
    description:
      "Elektr zanjirlari, o'zgaruvchan tok, transformatorlar va elektr mashinalari haqida to'liq qo'llanma.",
  },
];

export const getBookById = (id: number): Book | undefined =>
  allBooks.find((b) => b.id === id);

export const getRelatedBooks = (book: Book, limit = 4): Book[] =>
  allBooks.filter((b) => b.id !== book.id && b.category === book.category).slice(0, limit);
