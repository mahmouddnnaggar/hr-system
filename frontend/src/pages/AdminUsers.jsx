import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Trash2, XCircle } from "lucide-react";
import Button from "../components/common/Button";
import ConfirmModal from "../components/common/ConfirmModal";
import DataTable from "../components/common/DataTable";
import ErrorMessage from "../components/common/ErrorMessage";
import Input from "../components/common/Input";
import LoadingState from "../components/common/LoadingState";
import PaginationControls from "../components/common/PaginationControls";
import PageTitle from "../components/common/PageTitle";
import Select from "../components/common/Select";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, getInitials } from "../lib/utils";
import { adminApi } from "../services/adminApi";

function UserIdentity({ user }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-xs font-bold text-blue-600">
        {getInitials(user.name)}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{user.name}</p>
        <p className="text-xs font-medium text-slate-500">{user.email}</p>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [userToRemove, setUserToRemove] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    includeDeleted: false,
    page: 1,
  });
  const userParams = useMemo(
    () => ({
      page: filters.page,
      limit: 10,
      search: filters.search || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
      includeDeleted: filters.includeDeleted ? "true" : undefined,
    }),
    [filters],
  );
  const usersQuery = useQuery({
    queryKey: ["admin", "users", userParams],
    queryFn: () => adminApi.getUsers(userParams),
  });
  const pendingUsersQuery = useQuery({
    queryKey: ["admin", "pending-users"],
    queryFn: () => adminApi.getPendingUsers(),
  });

  const refreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "pending-users"] });
  };

  const approveMutation = useMutation({
    mutationFn: (userId) => adminApi.approveUser(userId),
    onSuccess: refreshUsers,
  });

  const rejectMutation = useMutation({
    mutationFn: (userId) => adminApi.rejectUser(userId),
    onSuccess: refreshUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: () => {
      setUserToRemove(null);
      refreshUsers();
    },
  });

  const users = usersQuery.data?.data || [];
  const pendingUsers = pendingUsersQuery.data || [];
  const pagination = usersQuery.data?.pagination;
  const error =
    usersQuery.error || pendingUsersQuery.error || approveMutation.error || rejectMutation.error || deleteMutation.error;
  const actionPending = approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending;

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  };

  const columns = [
    {
      key: "user",
      header: "User",
      render: (user) => <UserIdentity user={user} />,
    },
    {
      key: "role",
      header: "Role",
      render: (user) => <StatusBadge status={user.role} />,
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={user.status} />
          {user.deletedAt ? <StatusBadge status="REMOVED" /> : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cellClassName: "text-right",
      render: (user) =>
        (
          <div className="flex justify-end gap-2">
            {user.status === "PENDING" && user.role !== "ADMIN" ? (
              <>
                <Button size="sm" variant="success" onClick={() => approveMutation.mutate(user.id)} disabled={actionPending}>
                  <CheckCircle size={14} />
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => rejectMutation.mutate(user.id)} disabled={actionPending}>
                  <XCircle size={14} />
                  Reject
                </Button>
              </>
            ) : null}
            <Button
              size="sm"
              variant="danger"
              onClick={() => setUserToRemove(user)}
              disabled={actionPending || Number(user.id) === Number(currentUser.id) || Boolean(user.deletedAt)}
            >
              <Trash2 size={14} />
              Remove
            </Button>
          </div>
        ),
    },
  ];

  if (usersQuery.isPending || pendingUsersQuery.isPending) return <LoadingState label="Loading users" />;

  return (
    <div className="space-y-8">
      <PageTitle title="User Approvals" description="Review pending HR and employee accounts." />
      <ErrorMessage message={error ? getErrorMessage(error) : ""} />

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase text-slate-500">Pending Accounts</h2>
        <DataTable columns={columns} data={pendingUsers} emptyMessage="No pending users" />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase text-slate-500">All Users</h2>
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <Input
            placeholder="Search users"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
          <Select value={filters.role} onChange={(event) => updateFilter("role", event.target.value)}>
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="HR">HR</option>
            <option value="EMPLOYEE">Employee</option>
          </Select>
          <Select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
            <input
              type="checkbox"
              checked={filters.includeDeleted}
              onChange={(event) => updateFilter("includeDeleted", event.target.checked)}
            />
            Show removed
          </label>
        </div>
        <DataTable columns={columns} data={users} emptyMessage="No users found" />
        <PaginationControls
          pagination={pagination}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </section>

      <ConfirmModal
        open={Boolean(userToRemove)}
        title="Remove User"
        description={userToRemove ? `Soft delete ${userToRemove.name} and hide this account from active lists?` : ""}
        confirmLabel={deleteMutation.isPending ? "Removing..." : "Remove"}
        onCancel={() => setUserToRemove(null)}
        onConfirm={() => userToRemove && deleteMutation.mutate(userToRemove.id)}
      />
    </div>
  );
}
