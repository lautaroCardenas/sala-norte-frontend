// Cliente HTTP para la API de Rails. Centraliza la URL base, el token y el
// formato de errores para que las pantallas solo manejen datos o ApiError.

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export class ApiError extends Error {
  constructor(message, { status = 0, details = [] } = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) {
  authToken = token;
}

// Permite que AuthContext cierre la sesión cuando la API responde 401.
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export async function apiRequest(path, { method = "GET", body, params } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });

  const headers = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response;
  try {
    response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.");
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && authToken && onUnauthorized) onUnauthorized();
    throw new ApiError(data?.error || `Error inesperado (${response.status})`, {
      status: response.status,
      details: data?.details || [],
    });
  }
  return data;
}

export const api = {
  login: (email_address, password) => apiRequest("/login", { method: "POST", body: { email_address, password } }),
  logout: () => apiRequest("/logout", { method: "DELETE" }),
  register: (user) => apiRequest("/users", { method: "POST", body: { user } }),
  profile: () => apiRequest("/profile"),
  cinemas: () => apiRequest("/cinemas"),
  movies: (params) => apiRequest("/movies", { params }),
  movie: (id, params) => apiRequest(`/movies/${id}`, { params }),
  screening: (id) => apiRequest(`/screenings/${id}`),
  orders: () => apiRequest("/orders"),
};
