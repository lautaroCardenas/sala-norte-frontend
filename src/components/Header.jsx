import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { initials } from "../utils/format";

export default function Header({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Sala Norte
      </Link>

      <nav className="topnav" aria-label="Principal">
        <NavLink to="/" end>
          Cartelera
        </NavLink>
        <NavLink to="/proximamente">Próximamente</NavLink>
        <NavLink to="/mis-entradas">Mis entradas</NavLink>
      </nav>

      <div className="topbar-right">
        {children}
        {user ? (
          <div className="user-menu">
            <button
              type="button"
              className="avatar"
              aria-label={`Menú de ${user.name}`}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {initials(user.name)}
            </button>
            {menuOpen && (
              <div className="user-dropdown">
                <p>
                  <strong>{user.name}</strong>
                  <br />
                  <span className="muted">{user.email_address}</span>
                </p>
                <button type="button" className="btn btn-outline btn-block" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-small">
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}
