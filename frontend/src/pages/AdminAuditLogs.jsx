import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "../components/common/DataTable";
import ErrorMessage from "../components/common/ErrorMessage";
import Input from "../components/common/Input";
import LoadingState from "../components/common/LoadingState";
import PaginationControls from "../components/common/PaginationControls";
import PageTitle from "../components/common/PageTitle";
import Select from "../components/common/Select";
import StatusBadge from "../components/common/StatusBadge";
import { formatDate, getErrorMessage } from "../lib/utils";
import { adminApi } from "../services/adminApi";

export default function AdminAuditLogs() {
  const [filters, setFilters] = useState({
    search: "",
    entityType: "",
    page: 1,
  });
  const params = useMemo(
    () => ({
      page: filters.page,
      limit: 10,
      search: filters.search || undefined,
      entityType: filters.entityType || undefined,
    }),
    [filters],
  );

  const logsQuery = useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => adminApi.getAuditLogs(params),
  });

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  };

  const logs = logsQuery.data?.data || [];
  const pagination = logsQuery.data?.pagination;

  const columns = [
    {
      key: "action",
      header: "Action",
      render: (log) => <StatusBadge status={log.action} />,
    },
    {
      key: "message",
      header: "Message",
      render: (log) => (
        <div>
          <p className="text-sm font-bold text-slate-900">{log.message}</p>
          <p className="text-xs font-medium text-slate-500">
            {log.entity_type} #{log.entity_id || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      render: (log) => (
        <span className="text-xs font-bold uppercase text-slate-500">
          {log.actor?.email || "System"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Date",
      render: (log) => <span className="text-sm font-medium text-slate-600">{formatDate(log.created_at)}</span>,
    },
  ];

  if (logsQuery.isPending) return <LoadingState label="Loading audit logs" />;

  return (
    <div className="space-y-6">
      <PageTitle title="Audit Logs" description="Track important actions inside the system." />
      <ErrorMessage message={logsQuery.error ? getErrorMessage(logsQuery.error) : ""} />

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <Input
          placeholder="Search log messages"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
        />
        <Select value={filters.entityType} onChange={(event) => updateFilter("entityType", event.target.value)}>
          <option value="">All entities</option>
          <option value="User">User</option>
          <option value="Exam">Exam</option>
          <option value="Assignment">Assignment</option>
        </Select>
      </div>

      <DataTable columns={columns} data={logs} emptyMessage="No audit logs found" />
      <PaginationControls
        pagination={pagination}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      />
    </div>
  );
}
