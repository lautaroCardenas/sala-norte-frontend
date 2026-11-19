import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { LogOut, Ticket } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { initials } from "../utils/format";

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Sala Norte, ir a la cartelera">
      Sala Norte<span className="brand-dot">.</span>
    </Link>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cierra el menú del usuario al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => {
      if (event.type === "keydown" ? event.key === "Escape" : !menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Brand />

        <nav className="topnav" aria-label="Principal">
          <NavLink to="/" end>
            Cartelera
          </NavLink>
          <NavLink to="/proximamente">Próximamente</NavLink>
          <NavLink to="/mis-entradas">Mis entradas</NavLink>
        </nav>

        <div className="topbar-right">
          {user ? (
            <div className="user-menu" ref={menuRef}>
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
                  <div className="user-dropdown-head">
                    <strong>{user.name}</strong>
                    <span>{user.email_address}</span>
                  </div>
                  <Link to="/mis-entradas" className="menu-item" onClick={() => setMenuOpen(false)}>
                    <Ticket aria-hidden="true" /> Mis entradas
                  </Link>
                  <button type="button" className="menu-item" onClick={handleLogout}>
                    <LogOut aria-hidden="true" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-small">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
