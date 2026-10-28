import { Link } from "react-router";

// Contenedor simple para login y registro: marca arriba y el formulario en una caja.
export default function AuthLayout({ children }) {
  return (
    <main className="auth">
      <Link to="/" className="brand">
        Sala Norte
      </Link>
      {children}
    </main>
  );
}
