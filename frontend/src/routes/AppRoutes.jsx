import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath, USER_ROLES } from "../lib/auth";
import AdminAuditLogs from "../pages/AdminAuditLogs";
import AdminDashboard from "../pages/AdminDashboard";
import AdminExams from "../pages/AdminExams";
import AdminReports from "../pages/AdminReports";
import AdminUsers from "../pages/AdminUsers";
import AssignExam from "../pages/AssignExam";
import Assignments from "../pages/Assignments";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import EmployeeResults from "../pages/EmployeeResults";
import Employees from "../pages/Employees";
import ExamIntro from "../pages/ExamIntro";
import ExamSlides from "../pages/ExamSlides";
import Exams from "../pages/Exams";
import HRDashboard from "../pages/HRDashboard";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login";
import MyExams from "../pages/MyExams";
import Register from "../pages/Register";
import ResultDetails from "../pages/ResultDetails";
import Results from "../pages/Results";
import ProtectedRoute from "./ProtectedRoute";

function RoleRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(currentUser)} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RoleRedirect />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/exams" element={<AdminExams />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.HR]} />}>
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/employees" element={<Employees />} />
            <Route path="/hr/exams" element={<Exams />} />
            <Route path="/hr/assignments" element={<Assignments />} />
            <Route path="/hr/assigned-exams" element={<Assignments />} />
            <Route path="/hr/assign-exam" element={<AssignExam />} />
            <Route path="/hr/results" element={<Results />} />
            <Route path="/hr/results/:employeeId/:resultId" element={<ResultDetails />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYEE]} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/exams" element={<MyExams />} />
            <Route path="/employee/exams/:assignmentId/intro" element={<ExamIntro />} />
            <Route path="/employee/exams/:assignmentId/slides" element={<ExamSlides />} />
            <Route path="/employee/results" element={<EmployeeResults />} />
            <Route path="/employee/results/:employeeId/:resultId" element={<ResultDetails />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}
