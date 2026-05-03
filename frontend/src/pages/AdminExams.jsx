import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileUp, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "../components/common/Button";
import ConfirmModal from "../components/common/ConfirmModal";
import DataTable from "../components/common/DataTable";
import ErrorMessage from "../components/common/ErrorMessage";
import Input from "../components/common/Input";
import LoadingState from "../components/common/LoadingState";
import PaginationControls from "../components/common/PaginationControls";
import PageTitle from "../components/common/PageTitle";
import Select from "../components/common/Select";
import StatusBadge from "../components/common/StatusBadge";
import { getErrorMessage } from "../lib/utils";
import { adminApi } from "../services/adminApi";

const initialManualForm = {
  title: "",
  difficulty: "EASY",
  questions: "",
};

export default function AdminExams() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("manual");
  const [manualForm, setManualForm] = useState(initialManualForm);
  const [excelFile, setExcelFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [examToRemove, setExamToRemove] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    includeDeleted: false,
    page: 1,
  });
  const examParams = useMemo(
    () => ({
      page: filters.page,
      limit: 10,
      search: filters.search || undefined,
      difficulty: filters.difficulty || undefined,
      includeDeleted: filters.includeDeleted ? "true" : undefined,
    }),
    [filters],
  );

  const examsQuery = useQuery({
    queryKey: ["admin", "exams", examParams],
    queryFn: () => adminApi.getExams(examParams),
  });

  const refreshExams = () => queryClient.invalidateQueries({ queryKey: ["admin", "exams"] });

  const createMutation = useMutation({
    mutationFn: (payload) => adminApi.createExam(payload),
    onSuccess: () => {
      setManualForm(initialManualForm);
      setFormError("");
      toast.success("Exam created successfully");
      refreshExams();
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => adminApi.uploadExamExcel(file),
    onSuccess: () => {
      setExcelFile(null);
      setFormError("");
      toast.success("Exam uploaded successfully");
      refreshExams();
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (examId) => adminApi.deleteExam(examId),
    onSuccess: () => {
      setExamToRemove(null);
      toast.success("Exam removed successfully");
      refreshExams();
    },
  });

  const updateManualForm = (event) => {
    const { name, value } = event.target;
    setManualForm((current) => ({ ...current, [name]: value }));
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    createMutation.mutate(manualForm);
  };

  const handleUploadSubmit = (event) => {
    event.preventDefault();

    if (!excelFile) {
      setFormError("Choose an Excel file first");
      return;
    }

    uploadMutation.mutate(excelFile);
  };

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  };

  const exams = examsQuery.data?.data || [];
  const pagination = examsQuery.data?.pagination;
  const error = examsQuery.error || deleteMutation.error;
  const actionPending = createMutation.isPending || uploadMutation.isPending || deleteMutation.isPending;

  const columns = [
    {
      key: "title",
      header: "Exam",
      render: (exam) => (
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900">{exam.title}</p>
          <p className="text-xs font-medium text-slate-500">{exam.creator?.name || "Admin"}</p>
          {exam.deleted_at ? <StatusBadge status="REMOVED" /> : null}
        </div>
      ),
    },
    {
      key: "difficulty",
      header: "Difficulty",
      render: (exam) => <StatusBadge status={exam.difficulty} />,
    },
    {
      key: "questions",
      header: "Questions",
      cellClassName: "text-center text-sm font-bold text-slate-600",
      render: (exam) => exam.questions_count || exam.questions?.length || 0,
    },
    {
      key: "actions",
      header: "Actions",
      cellClassName: "text-right",
      render: (exam) => (
        <Button size="sm" variant="danger" onClick={() => setExamToRemove(exam)} disabled={actionPending || Boolean(exam.deleted_at)}>
          <Trash2 size={14} />
          Remove
        </Button>
      ),
    },
  ];

  if (examsQuery.isPending) return <LoadingState label="Loading exams" />;

  return (
    <div className="space-y-8">
      <PageTitle title="Exam Library" description="Create exams manually or upload an Excel file." />
      <ErrorMessage message={error ? getErrorMessage(error) : ""} />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex gap-2">
          <Button variant={mode === "manual" ? "primary" : "outline"} onClick={() => setMode("manual")}>
            <PlusCircle size={16} />
            Form Inputs
          </Button>
          <Button variant={mode === "upload" ? "primary" : "outline"} onClick={() => setMode("upload")}>
            <FileUp size={16} />
            Upload Excel
          </Button>
        </div>

        {mode === "manual" ? (
          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Exam Title
                </label>
                <Input id="title" name="title" value={manualForm.title} onChange={updateManualForm} />
              </div>
              <div>
                <label htmlFor="difficulty" className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Difficulty
                </label>
                <Select id="difficulty" name="difficulty" value={manualForm.difficulty} onChange={updateManualForm}>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="questions" className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Questions
              </label>
              <textarea
                id="questions"
                name="questions"
                value={manualForm.questions}
                onChange={updateManualForm}
                rows={7}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <ErrorMessage message={formError} />

            <Button type="submit" disabled={actionPending}>
              <PlusCircle size={16} />
              {createMutation.isPending ? "Creating..." : "Create Exam"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-5">
            <div>
              <label htmlFor="excelFile" className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Excel File
              </label>
              <Input
                id="excelFile"
                type="file"
                accept=".xlsx,.xls"
                onChange={(event) => setExcelFile(event.target.files?.[0] || null)}
              />
            </div>

            <ErrorMessage message={formError} />

            <Button type="submit" disabled={actionPending}>
              <FileUp size={16} />
              {uploadMutation.isPending ? "Uploading..." : "Upload Excel"}
            </Button>
          </form>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase text-slate-500">All Exams</h2>
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
          <Input
            placeholder="Search exams"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
          <Select value={filters.difficulty} onChange={(event) => updateFilter("difficulty", event.target.value)}>
            <option value="">All difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </Select>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
            <input
              type="checkbox"
              checked={filters.includeDeleted}
              onChange={(event) => updateFilter("includeDeleted", event.target.checked)}
            />
            Show removed
          </label>
        </div>
        <DataTable columns={columns} data={exams} emptyMessage="No exams found" />
        <PaginationControls
          pagination={pagination}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </section>

      <ConfirmModal
        open={Boolean(examToRemove)}
        title="Remove Exam"
        description={examToRemove ? `Soft delete ${examToRemove.title} and hide it from active lists?` : ""}
        confirmLabel={deleteMutation.isPending ? "Removing..." : "Remove"}
        onCancel={() => setExamToRemove(null)}
        onConfirm={() => examToRemove && deleteMutation.mutate(examToRemove.id)}
      />
    </div>
  );
}
