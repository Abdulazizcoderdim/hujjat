import {
  EntButton,
  EntGrid,
  EntPage,
  EntStatCard,
  EntToolbar,
} from "@/components/enterprise";
import { studentService } from "@/service/student.service";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const StudentStats = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const studentName = location.state?.studentName || "Noma'lum talaba";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-stats", id],
    queryFn: () => studentService.getStudentStats(id!),
    enabled: !!id,
  });

  return (
    <EntPage>
      <EntToolbar
        title={`Talaba statistikasi · ${studentName}`}
        actions={
          <EntButton onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Orqaga
          </EntButton>
        }
      />

      <div style={{ padding: 6 }}>
        {isLoading ? (
          <div className="ent-empty" style={{ border: 0 }}>
            Yuklanmoqda...
          </div>
        ) : isError || !data ? (
          <div
            className="ent-empty"
            style={{
              border: "1px solid var(--ent-danger)",
              background: "var(--ent-danger-bg)",
              color: "var(--ent-danger)",
            }}
          >
            Ma'lumotlarni yuklashda xato yuz berdi
          </div>
        ) : (
          <EntGrid cols={4}>
            <EntStatCard
              label="Jami o'qilgan kitoblar"
              value={data.totalBooks ?? 0}
            />
            <EntStatCard
              label="Tugatilgan kitoblar"
              value={data.finishedBooks ?? 0}
            />
            <EntStatCard
              label="O'qilayotgan"
              value={data.inProgressBooks ?? 0}
            />
            <EntStatCard
              label="Mutolaa vaqti"
              value={
                <span>
                  {data.totalReadingHours ?? 0}
                  <span
                    className="ent-muted"
                    style={{ fontSize: 12, fontWeight: 400 }}
                  >
                    {" "}
                    soat{" "}
                  </span>
                  {(data.totalReadingMinutes ?? 0) % 60}
                  <span
                    className="ent-muted"
                    style={{ fontSize: 12, fontWeight: 400 }}
                  >
                    {" "}
                    daq.
                  </span>
                </span>
              }
            />
          </EntGrid>
        )}
      </div>
    </EntPage>
  );
};

export default StudentStats;
