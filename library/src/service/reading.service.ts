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
    $api.post<IReadingSession>("/reading-sessions/start", dto),

  /** Kitob yopilganda chaqiriladi */
  end: (sessionId: number, dto: EndSessionDto) =>
    $api.post<IReadingSession>(`/reading-sessions/${sessionId}/end`, dto),

  /** Foydalanuvchi statistikasi */
  getMyStats: () => $api.get<IStudentStats>("/reading-sessions/my-stats"),

  /** Biror kitob bo'yicha barcha sessiyalar */
  getByProduct: (productId: number) =>
    $api.get<IReadingSession[]>(`/reading-sessions/product/${productId}`),
};
