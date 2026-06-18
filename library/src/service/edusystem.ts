import $edu from "@/http/edusystem";
import { ICurriculum, ISemester, IStudentContext, ISubject } from "@/interface";

const CURRICULUMS_PATH = "/api/v1/library-integration/curriculums";
const SUBJECTS_PATH = "/api/v1/library-integration/subjects";
const SEMESTERS_PATH = "/api/v1/library-integration/semesters";
const CONTEXT_PATH = "/api/v1/student/library/context-by-hemis";

export const fetchStudentLibraryContext =
  async (): Promise<IStudentContext> => {
    const token = localStorage.getItem("hemis_token");
    if (!token) {
      throw new Error("HEMIS token topilmadi — qaytadan login qiling");
    }
    const { data } = await $edu.get(CONTEXT_PATH, {
      headers: { "X-Hemis-Token": token },
    });
    if (data?.data && typeof data.data === "object") return data.data;
    if (data && typeof data === "object") return data;
    throw new Error("Invalid API response structure for student context");
  };

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

export const fetchSubjects = async (onlyCurriculum = false): Promise<ISubject[]> => {
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
    const fromOrder = typeof s.orderNumber === "number" ? s.orderNumber : NaN;
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
