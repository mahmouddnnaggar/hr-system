import { useState } from "react";
import { PlusCircle } from "lucide-react";
import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";
import AssignExamForm from "../forms/AssignExamForm";

export default function ExamCard({ exam, employees, onAssign, assigning, error }) {
  const [open, setOpen] = useState(false);

  const handleAssign = async (values) => {
    await onAssign(values);
    setOpen(false);
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <StatusBadge status={exam.difficulty} />
        <span className="text-[10px] font-bold uppercase text-slate-400">{exam.questions_count || exam.questions?.length || 0} Metrics</span>
      </div>
      <h3 className="mb-6 text-lg font-bold text-slate-900">{exam.title}</h3>

      {open ? (
        <div className="mt-auto border-t border-slate-100 pt-4">
          <AssignExamForm
            compact
            defaultExamId={exam.id}
            employees={employees}
            exams={[exam]}
            onSubmit={handleAssign}
            loading={assigning}
            error={error}
            onCancel={() => setOpen(false)}
          />
        </div>
      ) : (
        <Button className="mt-auto w-full text-[10px] uppercase" onClick={() => setOpen(true)}>
          <PlusCircle size={14} />
          Assign Exam
        </Button>
      )}
    </div>
  );
}
