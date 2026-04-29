import api from "./api";

export const employeeApi = {
  getEmployeeExams(employeeId) {
    return api.get(`/employee/${employeeId}/exams`);
  },
  startAssignment(assignmentId) {
    return api.get(`/employee/assignment/${assignmentId}/start`);
  },
  submitAnswer({ assignment_id, question_id, selected_answer, image }) {
    const formData = new FormData();
    formData.append("assignment_id", assignment_id);
    formData.append("question_id", question_id);
    formData.append("selected_answer", selected_answer);
    formData.append("image", image);

    return api.post("/employee/submit-answer", formData);
  },
  finishExam(assignment_id) {
    return api.post("/employee/finish-exam", { assignment_id });
  },
  getEmployeeResults(employeeId) {
    return api.get(`/employee/${employeeId}/results`);
  },
};
