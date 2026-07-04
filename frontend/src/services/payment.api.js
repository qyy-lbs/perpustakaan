import api from "./api";

export function createPayment(data) {
  return api.post("/payments", data);
}