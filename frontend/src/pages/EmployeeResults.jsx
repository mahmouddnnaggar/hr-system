import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTitle from "../components/common/PageTitle";
import ResultCard from "../components/results/ResultCard";
import { useAuth } from "../context/AuthContext";
import useAsyncData from "../hooks/useAsyncData";
import { employeeApi } from "../services/employeeApi";

export default function EmployeeResults() {
  const { currentUser } = useAuth();
  const { data: results, loading, error } = useAsyncData(() => employeeApi.getEmployeeResults(currentUser.id), [currentUser.id]);

  if (loading) return <LoadingState label="Loading performance history" />;

  return (
    <div className="space-y-6">
      <PageTitle title="My Performance History" />
      <ErrorMessage message={error} />
      {!results?.length ? (
        <EmptyState title="No completed evaluations found." />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} basePath="/employee/results" />
          ))}
        </div>
      )}
    </div>
  );
}
