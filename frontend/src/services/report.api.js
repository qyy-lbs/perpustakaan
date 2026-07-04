import api from "./api";

export function getReportSummary() {
  return api.get("/reports/summary");
}

export function getLoanReport(params = {}) {
  return api.get("/reports/loans", { params });
}

export function getReturnReport(params = {}) {
  return api.get("/reports/returns", { params });
}

export function getFineReport(params = {}) {
  return api.get("/reports/fines", { params });
}

export function getSuggestionReport(params = {}) {
  return api.get("/reports/suggestions", { params });
}