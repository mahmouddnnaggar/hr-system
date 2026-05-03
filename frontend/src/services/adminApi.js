import api from "./api";

export const adminApi = {
  getPendingUsers() {
    return api.get("/admin/pending-users");
  },
  getUsers() {
    return api.get("/admin/users");
  },
  approveUser(userId) {
    return api.patch(`/admin/users/${userId}/approve`);
  },
  rejectUser(userId) {
    return api.patch(`/admin/users/${userId}/reject`);
  },
  deleteUser(userId) {
    return api.delete(`/admin/users/${userId}`);
  },
  getExams() {
    return api.get("/admin/exams");
  },
  createExam(payload) {
    return api.post("/admin/exams", payload);
  },
  uploadExamExcel(file) {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/admin/exams/upload-excel", formData);
  },
  deleteExam(examId) {
    return api.delete(`/admin/exams/${examId}`);
  },
};
