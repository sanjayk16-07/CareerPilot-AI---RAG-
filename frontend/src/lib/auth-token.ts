const AUTH_TOKEN_KEY = "careerpilot_access_token";

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
}

let inMemoryToken: string | null = readStoredToken();

export function getAuthToken() {
  return inMemoryToken;
}

export function setAuthToken(token: string) {
  inMemoryToken = token;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  inMemoryToken = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

