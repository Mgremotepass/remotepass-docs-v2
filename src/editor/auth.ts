const TOKEN_KEY = "gh_token";

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function readTokenFromFragment(): string | null {
  const hash = window.location.hash;
  if (!hash.startsWith("#token=")) return null;
  const token = hash.slice("#token=".length);
  window.history.replaceState(null, "", window.location.pathname);
  return token || null;
}
