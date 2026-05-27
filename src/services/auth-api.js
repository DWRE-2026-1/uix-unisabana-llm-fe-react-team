import { apiRequest } from "../lib/api-client";

export async function login(payload) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function register(payload) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getCurrentUser() {
  return apiRequest("/api/auth/me");
}

export async function logout() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}

export async function updateMe(payload) {
  return apiRequest("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}