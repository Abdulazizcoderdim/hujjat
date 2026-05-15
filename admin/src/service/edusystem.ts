import $api from "@/http/axios";
import $edu from "@/http/edusystem";
import { ICurriculum, ICurriculumLink, ISemester, ISubject } from "@/interface";

const CURRICULUMS_PATH = "/api/v1/library-integration/curriculums";
const SUBJECTS_PATH = "/api/v1/library-integration/subjects";
const SEMESTERS_PATH = "/api/v1/library-integration/semesters";

const unwrap = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

export const fetchCurriculums = async (): Promise<ICurriculum[]> => {
  const { data } = await $edu.get(CURRICULUMS_PATH);
  return unwrap<ICurriculum>(data);
};

export const fetchSubjects = async (
  onlyCurriculum = true,
): Promise<ISubject[]> => {
  const { data } = await $edu.get(SUBJECTS_PATH, {
    params: { onlyCurriculum },
  });
  return unwrap<ISubject>(data);
};

interface RawSemester {
  id: number;
  name: string;
  orderNumber: number | null;
}

export const fetchSemesters = async (): Promise<ISemester[]> => {
  const { data } = await $edu.get(SEMESTERS_PATH);
  const raw = unwrap<RawSemester>(data);

  const seen = new Map<number, ISemester>();
  for (const s of raw) {
    const fromOrder =
      typeof s.orderNumber === "number" ? s.orderNumber : NaN;
    const fromName = s.name?.match(/(\d+)/)?.[1];
    const parsed = !isNaN(fromOrder)
      ? fromOrder
      : fromName
        ? parseInt(fromName, 10)
        : NaN;
    if (isNaN(parsed) || parsed < 1 || parsed > 12) continue;
    if (!seen.has(parsed)) {
      seen.set(parsed, {
        id: parsed,
        name: `${parsed}-semestr`,
        value: parsed,
      });
    }
  }

  return Array.from(seen.values()).sort(
    (a, b) => (a.value ?? 0) - (b.value ?? 0),
  );
};

export const fetchCurriculumLinks = async (
  productId: number,
): Promise<ICurriculumLink[]> => {
  const { data } = await $api.get(`/products/${productId}/curriculum-links`);
  return data;
};
