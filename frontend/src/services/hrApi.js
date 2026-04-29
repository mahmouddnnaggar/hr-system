import api from "./api";

export const hrApi = {
  getEmployees() {
    return api.get("/hr/employees");
  },
  getExams() {
    return api.get("/hr/exams");
  },
  assignExam(payload) {
    return api.post("/hr/assign-exam", payload);
  },
  getAssignments() {
    return api.get("/hr/assignments");
  },
  unassignExam(assignmentId, assignedBy) {
    return api.delete(`/hr/assignments/${assignmentId}`, { data: { assigned_by: assignedBy } });
  },
  getResults() {
    return api.get("/hr/results");
  },
  getResultsByEmployee(employeeId) {
    return api.get(`/hr/results/${employeeId}`);
  },
};
