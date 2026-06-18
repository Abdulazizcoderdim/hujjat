import $api from "@/http/axios";
import {
  EndSessionDto,
  IReadingSession,
  IStudentStats,
  StartSessionDto,
} from "@/types";

export const readingSessionsApi = {
  /** Kitob ochilganda chaqiriladi */
  start: (dto: StartSessionDto) =>
    $api.post<IReadingSession>("/reading-sessions/start", dto).catch((error) => {
      console.error("Failed to start reading session:", error);
      throw error;
    }),

  /** Kitob yopilganda chaqiriladi */
  end: (sessionId: number, dto: EndSessionDto) =>
    $api.post<IReadingSession>(`/reading-sessions/${sessionId}/end`, dto).catch((error) => {
      console.error("Failed to end reading session:", error);
      throw error;
    }),

  /** Foydalanuvchi statistikasi */
  getMyStats: () => $api.get<IStudentStats>("/reading-sessions/my-stats").catch((error) => {
    console.error("Failed to fetch reading stats:", error);
    throw error;
  }),

  /** Biror kitob bo'yicha barcha sessiyalar */
  getByProduct: (productId: number) =>
    $api.get<IReadingSession[]>(`/reading-sessions/product/${productId}`).catch((error) => {
      console.error("Failed to fetch reading sessions by product:", error);
      throw error;
    }),
};
