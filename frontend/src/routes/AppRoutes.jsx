import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import AssignExam from "../pages/AssignExam";
import Assignments from "../pages/Assignments";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import EmployeeResults from "../pages/EmployeeResults";
import Employees from "../pages/Employees";
import ExamIntro from "../pages/ExamIntro";
import ExamSlides from "../pages/ExamSlides";
import Exams from "../pages/Exams";
import HRDashboard from "../pages/HRDashboard";
import Login from "../pages/Login";
import MyExams from "../pages/MyExams";
import ResultDetails from "../pages/ResultDetails";
import Results from "../pages/Results";

function RoleRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={currentUser.role === "HR" ? "/hr/dashboard" : "/employee/dashboard"} replace />;
}

function RequireAuth() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireRole({ role }) {
  const { currentUser } = useAuth();
  if (currentUser?.role !== role) {
    return <Navigate to={currentUser?.role === "HR" ? "/hr/dashboard" : "/employee/dashboard"} replace />;
  }
  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleRedirect />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route element={<RequireRole role="HR" />}>
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/employees" element={<Employees />} />
            <Route path="/hr/exams" element={<Exams />} />
            <Route path="/hr/assignments" element={<Assignments />} />
            <Route path="/hr/assigned-exams" element={<Assignments />} />
            <Route path="/hr/assign-exam" element={<AssignExam />} />
            <Route path="/hr/results" element={<Results />} />
            <Route path="/hr/results/:employeeId/:resultId" element={<ResultDetails />} />
          </Route>

          <Route element={<RequireRole role="EMPLOYEE" />}>
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
