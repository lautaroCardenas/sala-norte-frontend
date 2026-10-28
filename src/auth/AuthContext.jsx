import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken, setUnauthorizedHandler } from "../api/client";

const TOKEN_KEY = "salanorte.token";
const AuthContext = createContext(null);

// "Mantener sesión iniciada" guarda el token en localStorage (sobrevive al cierre
// del navegador); si no, en sessionStorage (se borra al cerrar la pestaña).
function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token, remember) {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    if (token) (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // Almacenamiento bloqueado: la sesión dura solo mientras la página esté abierta.
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | guest

  const clearSession = useCallback(() => {
    storeToken(null);
    setAuthToken(null);
    setUser(null);
    setStatus("guest");
  }, []);

  // Al abrir la app, si hay un token guardado se valida pidiendo el perfil.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    const token = readStoredToken();
    if (!token) {
      setStatus("guest");
      return;
    }
    setAuthToken(token);
    api
      .profile()
      .then((profile) => {
        setUser(profile);
        setStatus("authenticated");
      })
      .catch(clearSession);
  }, [clearSession]);

  const startSession = useCallback((token, profile, remember) => {
    storeToken(token, remember);
    setAuthToken(token);
    setUser(profile);
    setStatus("authenticated");
  }, []);

  const login = useCallback(
    async (email, password, remember) => {
      const { token, user: profile } = await api.login(email, password);
      startSession(token, profile, remember);
    },
    [startSession],
  );

  const register = useCallback(
    async (data) => {
      const { token, ...profile } = await api.register(data);
      startSession(token, profile, true);
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(() => ({ user, status, login, register, logout }), [user, status, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
