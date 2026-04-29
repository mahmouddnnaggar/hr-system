import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import Select from "../common/Select";
import { assignExamSchema } from "../../lib/validations/assignment";

export default function AssignExamForm({
  employees,
  exams,
  defaultExamId = "",
  onSubmit,
  loading,
  error,
  compact = false,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assignExamSchema),
    defaultValues: {
      employee_id: "",
      exam_id: defaultExamId ? String(defaultExamId) : "",
    },
  });

  const submit = async (values) => {
    await onSubmit({
      employee_id: Number(values.employee_id),
      exam_id: Number(values.exam_id),
    });
    reset({ employee_id: "", exam_id: defaultExamId ? String(defaultExamId) : "" });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className={compact ? "space-y-3" : "space-y-5"}>
      <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase text-slate-400">Select Candidate</label>
        <Select error={errors.employee_id} {...register("employee_id")}>
          <option value="">Search employee...</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </Select>
        {errors.employee_id ? <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.employee_id.message}</p> : null}
      </div>

      {!defaultExamId ? (
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase text-slate-400">Target Evaluation</label>
          <Select error={errors.exam_id} {...register("exam_id")}>
            <option value="">Select from library...</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </Select>
          {errors.exam_id ? <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.exam_id.message}</p> : null}
        </div>
      ) : (
        <input type="hidden" value={defaultExamId} {...register("exam_id")} />
      )}

      <ErrorMessage message={error} />

      <div className={compact ? "flex gap-2" : "flex flex-col gap-3 sm:flex-row"}>
        {onCancel ? (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" className="flex-1" disabled={loading}>
          <PlusCircle size={14} />
          {loading ? "Assigning..." : "Assign Exam"}
        </Button>
      </div>
    </form>
  );
}
