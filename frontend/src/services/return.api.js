import api from "./api";

export function checkReturn(data) {
  return api.post("/returns/check", data);
}

export function confirmReturn(loanId) {
  return api.post(`/returns/${loanId}/confirm`);
}