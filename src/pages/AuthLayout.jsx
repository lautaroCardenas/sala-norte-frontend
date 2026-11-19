import { Brand } from "../components/Header";

// Pantalla partida para login y registro: panel con el mensaje a la izquierda
// y el formulario a la derecha (en mobile, uno arriba del otro).
export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <section className="auth-hero">
        <Brand />
        <div>
          <p className="auth-hero-title">
            Tu butaca
            <br />
            te está <em>esperando.</em>
          </p>
          <p className="auth-hero-text">Elegí la función, marcá tus asientos en el mapa de la sala y entrá con tu código.</p>
        </div>
        <div className="auth-hero-foot">
          <span>2 sedes · 4 salas</span>
          <span>2D · 3D · IMAX</span>
        </div>
      </section>
      <main className="auth-panel">{children}</main>
    </div>
  );
}
