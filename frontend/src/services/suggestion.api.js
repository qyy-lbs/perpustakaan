import api from "./api";

export function createSuggestion(data) {
  return api.post("/suggestions", data);
}

export function getMySuggestions() {
  return api.get("/suggestions/me");
}

export function getSuggestionById(id) {
  return api.get(`/suggestions/${id}`);
}

// Untuk pustakawan
export function getAllSuggestions(params = {}) {
  return api.get("/suggestions", { params });
}

export function approveSuggestion(id, data = {}) {
  return api.post(`/suggestions/${id}/approve`, data);
}

export function rejectSuggestion(id, data = {}) {
  return api.post(`/suggestions/${id}/reject`, data);
}

export function updateSuggestionStatus(id, data) {
  return api.patch(`/suggestions/${id}/status`, data);
}