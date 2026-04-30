import { notImplemented } from "../lib/not-implemented";

export async function login(_payload) {
  return notImplemented("authApi", "login(payload)");
}

export async function register(_payload) {
  return notImplemented("authApi", "register(payload)");
}

export async function getCurrentUser() {
  return notImplemented("authApi", "getCurrentUser()");
}

export async function logout() {
  return notImplemented("authApi", "logout()");
}
