import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/hooks/formatDateTime";
import { useDebounce } from "@/hooks/use-debounce";
import $api from "@/http/axios";
import { IUser, UserRole } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { Eye, GraduationCap, MapPin, School } from "lucide-react";
import { useEffect, useState } from "react";

export function StudentsTable() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState<IUser | null>(null);

  const studentsQuery = useQuery({
    queryKey: ["students", { debouncedSearch, page, limit }],
    queryFn: async () => {
      const params = {
        role: UserRole.STUDENT,
        search: debouncedSearch,
        page,
        limit,
      };
      const res = await $api.get(`/users/role/${UserRole.STUDENT}`, { params });
      return res.data;
    },
  });

  const students = studentsQuery.data?.items ?? [];
  const pagination = studentsQuery.data?.pagination;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talabalar"
        description="Tizimdagi barcha talabalar ro'yxati va ularning ma'lumotlari"
      />

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Ism, login yoki talaba ID bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">№</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  F.I.SH
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Talaba ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Universitet / Fakultet
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Guruh
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Holati
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Sana
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((user: IUser, index: number) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    {(page - 1) * limit + (index + 1)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {user.full_name?.charAt(0) ||
                          user.first_name?.charAt(0) ||
                          "?"}
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.full_name ||
                            `${user.first_name} ${user.second_name}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email || user.login}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    {user.student_id_number || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="max-w-[200px] truncate">
                      {user.university}
                      <div className="text-xs text-muted-foreground truncate">
                        {user.faculty}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.group || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge
                      status={user.is_active ? "active" : "blocked"}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedStudent(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* Talaba batafsil ma'lumotlari */}
      <Dialog
        open={!!selectedStudent}
        onOpenChange={() => setSelectedStudent(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Talaba ma'lumotlari kartasi</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                    {selectedStudent.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{selectedStudent.full_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ID: {selectedStudent.student_id_number}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <School className="h-4 w-4" /> {selectedStudent.university}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />{" "}
                    {selectedStudent.faculty} ({selectedStudent.specialty})
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />{" "}
                    {selectedStudent.address || "Manzil kiritilmagan"}
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-l pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground italic">
                      Guruh
                    </p>
                    <p className="font-medium">{selectedStudent.group}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground italic">
                      Bosqich/Semestr
                    </p>
                    <p className="font-medium">
                      {selectedStudent.level}-kurs / {selectedStudent.semester}
                      -semestr
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground italic">
                      Telefon
                    </p>
                    <p className="font-medium">
                      {selectedStudent.phone || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground italic">
                      Tug'ilgan sana
                    </p>
                    <p className="font-medium">
                      {selectedStudent.birth_date
                        ? new Date(
                            Number(selectedStudent.birth_date),
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Tizimdagi holati:
                    </span>
                    <StatusBadge
                      status={selectedStudent.is_active ? "active" : "blocked"}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
