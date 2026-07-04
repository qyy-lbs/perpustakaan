import api from "./api";

export function getMyLoans() {
  return api.get("/loans/me");
}