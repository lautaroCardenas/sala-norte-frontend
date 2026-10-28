import { Navigate, useLocation } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { Loading } from "./States";

// Protege las rutas que necesitan sesión: si no hay usuario, manda al login
// y después de entrar vuelve a la página que se quería ver.
export default function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Loading label="Verificando sesión…" />;
  if (status === "guest") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
