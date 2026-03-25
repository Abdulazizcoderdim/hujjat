import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Book, CheckCircle, BookOpen, Clock, ArrowLeft } from "lucide-react";
import { studentService } from "@/service/student.service";
import { PageHeader } from "@/components/admin/PageHeader";

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 mt-10">
        Ma'lumotlarni yuklashda xatolik yuz berdi!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talaba Statistikasi"
        description={`${studentName} - talabaning o'qish ko'rsatkichlari`}
        actions={
          <button
            onClick={() => navigate(-1)}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Book className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Jami o'qilgan kitoblar
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.totalBooks}
            </h3>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tugatilgan kitoblar
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.finishedBooks}
            </h3>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              O'qilayotgan kitoblar
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.inProgressBooks}
            </h3>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Mutolaa vaqti
            </p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.totalReadingHours}
              </h3>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                soat
              </span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white ml-1">
                {data.totalReadingMinutes % 60}
              </h3>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                daq.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStats;
