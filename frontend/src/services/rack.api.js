import api from "./api";

export function getRacks() {
  return api.get("/racks");
}

export function createRack(data) {
  return api.post("/racks", data);
}