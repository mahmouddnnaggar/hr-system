import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    <motion.article
      layout
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <StatusBadge status={exam.difficulty} />
        <span className="text-[10px] font-bold uppercase text-slate-400">{exam.questions_count || exam.questions?.length || 0} Metrics</span>
      </div>
      <h3 className="text-base font-bold leading-snug text-slate-900">{exam.title}</h3>

      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-5 border-t border-slate-100 pt-4">
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
          </motion.div>
        ) : (
          <motion.div
            key="action"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="mt-auto pt-5"
          >
            <Button className="w-full text-[10px] uppercase" onClick={() => setOpen(true)}>
              <PlusCircle size={14} />
              Assign Exam
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
