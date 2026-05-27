import { notImplemented } from "../lib/not-implemented";

export async function listUsers() {
  return notImplemented("usersApi", "listUsers()");
}

export async function createUser(_payload) {
  return notImplemented("usersApi", "createUser(payload)");
}

export async function updateUser(_userId, _payload) {
  return notImplemented("usersApi", "updateUser(userId, payload)");
}

export async function deleteUser(_userId) {
  return notImplemented("usersApi", "deleteUser(userId)");
}
