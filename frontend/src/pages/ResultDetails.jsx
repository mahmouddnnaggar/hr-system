import { ChevronRight } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import StatusBadge from "../components/common/StatusBadge";
import ResultEvidenceList from "../components/results/ResultEvidenceList";
import { useAuth } from "../context/AuthContext";
import useAsyncData from "../hooks/useAsyncData";
import { formatDate, formatScore } from "../lib/utils";
import { employeeApi } from "../services/employeeApi";
import { hrApi } from "../services/hrApi";

function sortAnswersByQuestions(questions = [], answers = []) {
  const answersByQuestion = new Map(answers.map((answer) => [answer.question_id, answer]));
  return questions.map((question) => answersByQuestion.get(question.id)).filter(Boolean);
}

export default function ResultDetails() {
  const { currentUser, isHR } = useAuth();
  const { employeeId, resultId } = useParams();
  const location = useLocation();
  const inHrArea = location.pathname.startsWith("/hr");
  const targetEmployeeId = employeeId || currentUser.id;

  const { data, loading, error } = useAsyncData(async () => {
    const results = inHrArea
      ? await hrApi.getResultsByEmployee(targetEmployeeId)
      : await employeeApi.getEmployeeResults(targetEmployeeId);
    const result = results.find((item) => String(item.id) === String(resultId));

    if (!result) {
      throw new Error("Result not found");
    }

    const assignment = await employeeApi.startAssignment(result.assignment_id);
    return { result, assignment };
  }, [targetEmployeeId, resultId, inHrArea]);

  if (loading) return <LoadingState label="Loading result details" />;
  if (error) return <ErrorMessage message={error} />;

  const result = data.result;
  const assignment = data.assignment;
  const exam = assignment.exam || result.assignment?.exam;
  const employee = result.assignment?.employee || (isHR ? assignment.employee : currentUser);
  const answers = sortAnswersByQuestions(exam?.questions, assignment.answers);
  const backTo = inHrArea ? "/hr/results" : "/employee/results";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Button as={Link} to={backTo} variant="ghost" className="px-0 text-[10px] uppercase text-slate-400 hover:text-blue-600">
        <ChevronRight size={14} className="rotate-180" />
        Return to Audit Logs
      </Button>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-slate-100 bg-slate-50/50 px-6 py-8 sm:px-10 sm:py-10 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status="COMPLETED" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Logged: {formatDate(result.createdAt)}</span>
            </div>
            <h3 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{exam?.title}</h3>
            <p className="mt-1 font-medium text-slate-500">
              Personnel Record for <span className="font-bold text-slate-900">{employee?.name}</span>
            </p>
          </div>
          <div className="min-w-32 rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
            <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Index Score</p>
            <p className="text-4xl font-black text-blue-600">
              {formatScore(result.final_score)}
              <span className="ml-0.5 text-lg text-slate-300">/5.0</span>
            </p>
          </div>
        </div>

        <ResultEvidenceList questions={exam?.questions || []} answers={answers} />
      </div>
    </div>
  );
}
