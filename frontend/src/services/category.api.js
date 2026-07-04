import api from "./api";

export function getCategories() {
  return api.get("/categories");
}

export function createCategory(data) {
  return api.post("/categories", data);
}