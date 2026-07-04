import api from "./api";

export function createReservation(data) {
  return api.post("/reservations", data);
}

export function getMyReservations() {
  return api.get("/reservations/me");
}

export function getMyReservationById(id) {
  return api.get(`/reservations/me/${id}`);
}

export function getReservationByCode(kodeBooking) {
  return api.get(`/reservations/${kodeBooking}`);
}

export function validateReservation(kodeBooking) {
  return api.post(`/reservations/${kodeBooking}/validate`);
}

export function rejectReservation(kodeBooking) {
  return api.post(`/reservations/${kodeBooking}/reject`);
}