import { AlertCircle, ClipboardList } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import StatusBadge from "../components/common/StatusBadge";
import useAsyncData from "../hooks/useAsyncData";
import { employeeApi } from "../services/employeeApi";

export default function ExamIntro() {
  const { assignmentId } = useParams();
  const { data: assignment, loading, error } = useAsyncData(() => employeeApi.startAssignment(assignmentId), [assignmentId]);

  if (loading) return <LoadingState label="Loading evaluation" />;
  if (error) return <ErrorMessage message={error} />;

  const exam = assignment.exam;

  return (
    <div className="mx-auto max-w-xl py-8 sm:py-12">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
            <ClipboardList size={32} />
          </div>
          <StatusBadge status={exam?.difficulty} />
          <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-900">{exam?.title}</h2>
          <p className="mt-1 text-sm text-slate-500">Verification session required</p>
        </div>

        <div className="space-y-8 p-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Metrics</p>
              <p className="text-2xl font-bold text-slate-900">{exam?.questions?.length || exam?.questions_count}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Evidence</p>
              <p className="text-2xl font-bold italic text-slate-900">Mandatory</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900">
              <AlertCircle size={14} className="text-blue-600" />
              Protocols
            </h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>Choose outcome for each listed operational metric.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>Upload photographic evidence for every selection.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>Submission is final and logged in audit history.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-6 sm:flex-row">
            <Button as={Link} to="/employee/dashboard" variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button as={Link} to={`/employee/exams/${assignment.id}/slides`} className="flex-[2] uppercase">
              Authorize & Begin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
