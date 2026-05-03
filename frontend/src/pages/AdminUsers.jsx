import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Trash2, XCircle } from "lucide-react";
import Button from "../components/common/Button";
import ConfirmModal from "../components/common/ConfirmModal";
import DataTable from "../components/common/DataTable";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTitle from "../components/common/PageTitle";
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
  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.getUsers(),
  });

  const refreshUsers = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

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

  const users = useMemo(() => usersQuery.data || [], [usersQuery.data]);
  const pendingUsers = useMemo(
    () => users.filter((user) => user.status === "PENDING" && user.role !== "ADMIN"),
    [users],
  );
  const error = usersQuery.error || approveMutation.error || rejectMutation.error || deleteMutation.error;
  const actionPending = approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending;

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
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "verified",
      header: "Email",
      render: (user) => (
        <span className="text-xs font-bold uppercase text-slate-500">
          {user.isEmailVerified ? "Verified" : "Not Verified"}
        </span>
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
              disabled={actionPending || Number(user.id) === Number(currentUser.id)}
            >
              <Trash2 size={14} />
              Remove
            </Button>
          </div>
        ),
    },
  ];

  if (usersQuery.isPending) return <LoadingState label="Loading users" />;

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
        <DataTable columns={columns} data={users} emptyMessage="No users found" />
      </section>

      <ConfirmModal
        open={Boolean(userToRemove)}
        title="Remove User"
        description={userToRemove ? `Remove ${userToRemove.name} and related records?` : ""}
        confirmLabel={deleteMutation.isPending ? "Removing..." : "Remove"}
        onCancel={() => setUserToRemove(null)}
        onConfirm={() => deleteMutation.mutate(userToRemove.id)}
      />
    </div>
  );
}
