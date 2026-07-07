import apiClient from "./client";

export const authApi = {
  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }).then((r) => r.data),
  register: (name, email, password) =>
    apiClient.post("/auth/register", { name, email, password }).then((r) => r.data),
};

export const taskApi = {
  list: (params) => apiClient.get("/tasks", { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/tasks/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post("/tasks", payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/tasks/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/tasks/${id}`),
  reorder: (targetStatus, orderedTaskIds) =>
    apiClient.patch("/tasks/reorder", { targetStatus, orderedTaskIds }),
  aiSuggest: (title) => apiClient.post("/tasks/ai-suggest", { title }).then((r) => r.data),
};
