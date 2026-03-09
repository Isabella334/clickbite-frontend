import { apiFetch } from "./api"

export function getRestaurants() {
  return apiFetch("/restaurants")
}
