import { readingSessionsApi } from "@/service/reading.service";
import { EndSessionDto, StartSessionDto } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const readingKeys = {
  sessions: (productId: number) => ["reading", "sessions", productId] as const,
};

export function useStartSession() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (dto: StartSessionDto) => readingSessionsApi.start(dto),
  });

  return {
    startSession: (dto: StartSessionDto) => mutateAsync(dto),
    isStarting: isPending,
  };
}

export function useEndSession() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      sessionId,
      dto,
    }: {
      sessionId: number;
      dto: EndSessionDto;
    }) => readingSessionsApi.end(sessionId, dto),
  });

  return {
    endSession: (sessionId: number, dto: EndSessionDto) =>
      mutateAsync({ sessionId, dto }),
    isEnding: isPending,
  };
}
