import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AssignExamForm from "../components/forms/AssignExamForm";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTitle from "../components/common/PageTitle";
import { useAuth } from "../context/AuthContext";
import useAsyncData from "../hooks/useAsyncData";
import { getErrorMessage } from "../lib/utils";
import { hrApi } from "../services/hrApi";

export default function AssignExam() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { data, loading, error } = useAsyncData(async () => {
    const [employees, exams] = await Promise.all([hrApi.getEmployees(), hrApi.getExams()]);
    return { employees, exams };
  }, []);

  const handleAssign = async (values) => {
    try {
      setSubmitting(true);
      setSubmitError("");
      await hrApi.assignExam({ ...values, assigned_by: currentUser.id });
      navigate("/hr/exams");
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading assignment form" />;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageTitle title="Assign Exam" description="Choose an employee and target evaluation" />
      <ErrorMessage message={error} />
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <AssignExamForm
          employees={data?.employees || []}
          exams={data?.exams || []}
          onSubmit={handleAssign}
          loading={submitting}
          error={submitError}
        />
      </div>
    </div>
  );
}
