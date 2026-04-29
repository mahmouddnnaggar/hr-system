import { Award, ClipboardList, FileText, History, LayoutDashboard, LogOut, Users, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import Button from "../common/Button";
import { getInitials, cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const hrMenu = [
  { to: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hr/employees", label: "Employees", icon: Users },
  { to: "/hr/exams", label: "Exams Library", icon: ClipboardList },
  { to: "/hr/assigned-exams", label: "Assigned Exams", icon: FileText },
  { to: "/hr/results", label: "Recent Results", icon: History },
];

const employeeMenu = [
  { to: "/employee/dashboard", label: "My Portal", icon: LayoutDashboard },
  { to: "/employee/exams", label: "Evaluations", icon: FileText },
  { to: "/employee/results", label: "Audit History", icon: History },
];

export default function Sidebar({ open, onClose }) {
  const { currentUser, logout, isHR } = useAuth();
  const menu = isHR ? hrMenu : employeeMenu;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/30 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:w-64 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6 lg:p-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-100">
              <Award size={18} />
            </div>
            <span className="text-xl font-bold text-slate-900">EvalSystem</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Close navigation">
            <X size={18} />
          </Button>
        </div>

        <nav className="flex-grow space-y-1 px-4">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50",
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-500">
              {getInitials(currentUser?.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{currentUser?.name}</p>
              <p className="truncate text-xs font-medium text-slate-500">{currentUser?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full text-slate-500 hover:bg-rose-50 hover:text-rose-600" onClick={logout}>
            <LogOut size={14} />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
