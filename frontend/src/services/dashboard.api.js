import api from "./api";

export function getDashboardSummary() {
  return api.get("/dashboard/summary");
}

export function getLoanChart() {
  return api.get("/dashboard/loan-chart");
}

export function getCategoryChart() {
  return api.get("/dashboard/category-chart");
}