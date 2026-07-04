import api from "./api";

export function loginUser(data) {
  return api.post("/auth/login", data);
}

export function registerUser(data) {
  return api.post("/auth/register", data);
}

export function getMe() {
  return api.get("/auth/me");
}