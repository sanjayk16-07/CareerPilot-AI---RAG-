const AUTH_TOKEN_KEY = "careerpilot_access_token";

let inMemoryToken: string | null = sessionStorage.getItem(AUTH_TOKEN_KEY);

export function getAuthToken() {
  return inMemoryToken;
}

export function setAuthToken(token: string) {
  inMemoryToken = token;
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  inMemoryToken = null;
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

