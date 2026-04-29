import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DataTable from "../components/common/DataTable";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTitle from "../components/common/PageTitle";
import StatusBadge from "../components/common/StatusBadge";
import { formatScore, getErrorMessage } from "../lib/utils";
import { liveQueryOptions } from "../lib/queryClient";
import { hrApi } from "../services/hrApi";

export default function Results() {
  const [params] = useSearchParams();
  const employeeFilter = params.get("employee");
  const {
    data: results = [],
    isPending: loading,
    error,
  } = useQuery({
    queryKey: ["hr", "results"],
    queryFn: () => hrApi.getResults(),
    ...liveQueryOptions,
  });

  const filteredResults = useMemo(() => {
    const list = results || [];
    if (!employeeFilter) return list;
    return list.filter((result) => String(result.assignment?.employee?.id) === employeeFilter);
  }, [results, employeeFilter]);

  if (loading) return <LoadingState label="Loading results" />;

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (result) => (
        <div>
          <p className="text-sm font-bold text-slate-900">{result.assignment?.employee?.name}</p>
          <p className="text-xs text-slate-500">{result.assignment?.employee?.email}</p>
        </div>
      ),
    },
    {
      key: "exam",
      header: "Exam Title",
      render: (result) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600">{result.assignment?.exam?.title}</p>
          <StatusBadge status={result.assignment?.exam?.difficulty} />
        </div>
      ),
    },
    {
      key: "score",
      header: "Final Score",
      cellClassName: "text-center text-lg font-black text-blue-600",
      render: (result) => (
        <>
          {formatScore(result.final_score)}
          <span className="text-xs font-normal text-slate-300">/5</span>
        </>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cellClassName: "text-right",
      render: (result) => (
        <Link
          to={`/hr/results/${result.assignment?.employee?.id}/${result.id}`}
          className="text-xs font-bold uppercase text-blue-600 hover:underline"
        >
          View Evidence
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Evaluation Records"
        description={`${filteredResults.length} total submissions`}
      />
      <ErrorMessage message={error ? getErrorMessage(error) : ""} />
      <DataTable columns={columns} data={filteredResults} emptyMessage="No evaluation records found in system." />
    </div>
  );
}
