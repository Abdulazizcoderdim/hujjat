import $api from "@/http/axios";

export interface StudentStatsResponse {
  totalBooks: number;
  finishedBooks: number;
  inProgressBooks: number;
  totalReadingMinutes: number;
  totalReadingHours: number;
}

export const studentService = {
  getStudentStats: async (
    id: string | number,
  ): Promise<StudentStatsResponse> => {
    const { data } = await $api.get(`/reading-sessions/my-stats/${id}`);
    return data;
  },
};
