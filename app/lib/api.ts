export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return { "Content-Type": "application/json" };
  }
  const token = localStorage.getItem("token") || localStorage.getItem("inventory_token");
  return {
    "Content-Type": "application/json",
    ...(token && token !== "auth-session-active" ? { Authorization: `Bearer ${token}` } : {}),
  };
}
