import api from "./api";

export function getBooks(params = {}) {
  return api.get("/books", { params });
}

export function getBookById(id) {
  return api.get(`/books/${id}`);
}

export function createBook(data) {
  return api.post("/books", data);
}

export function updateBook(id, data) {
  return api.put(`/books/${id}`, data);
}

export function deleteBook(id) {
  return api.delete(`/books/${id}`);
}