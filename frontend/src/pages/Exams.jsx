import { useState } from "react";
import { toast } from "sonner";
import ExamCard from "../components/exams/ExamCard";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTitle from "../components/common/PageTitle";
import { useAuth } from "../context/AuthContext";
import useAsyncData from "../hooks/useAsyncData";
import { getErrorMessage } from "../lib/utils";
import { hrApi } from "../services/hrApi";

export default function Exams() {
  const { currentUser } = useAuth();
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  const { data, loading, error } = useAsyncData(async () => {
    const [employees, exams] = await Promise.all([hrApi.getEmployees(), hrApi.getExams()]);
    return { employees, exams };
  }, []);

  const handleAssign = async (values) => {
    try {
      setAssigning(true);
      setAssignError("");
      await hrApi.assignExam({ ...values, assigned_by: currentUser.id });
      toast.success("Exam assigned successfully");
    } catch (err) {
      const message = getErrorMessage(err);
      setAssignError(message);
      toast.error(message);
      throw err;
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingState label="Loading exams" />;

  const employees = data?.employees || [];
  const exams = data?.exams || [];

  return (
    <div className="space-y-6">
      <PageTitle title="Evaluation Library" />
      <ErrorMessage message={error} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            employees={employees}
            onAssign={handleAssign}
            assigning={assigning}
            error={assignError}
          />
        ))}
      </div>
    </div>
  );
}
