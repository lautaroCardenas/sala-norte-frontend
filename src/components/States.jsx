import { AlertTriangle, Film, RotateCw } from "lucide-react";

// Estados comunes de las pantallas: cargando, error (con reintento) y sin resultados.

export function Loading({ label = "Cargando…" }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

// Grilla de pósters "fantasma" mientras carga la cartelera.
export function SkeletonGrid({ count = 10, label = "Cargando…" }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <ul className="movie-grid" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="skeleton-card">
            <div className="skeleton" />
            <div className="skeleton skeleton-line" style={{ width: "80%" }} />
            <div className="skeleton skeleton-line" style={{ width: "50%" }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <span className="state-icon">
        <AlertTriangle aria-hidden="true" />
      </span>
      <p>{error?.message || "Ocurrió un error inesperado."}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Empty({ title, icon: Icon = Film, children }) {
  return (
    <div className="state">
      <span className="state-icon">
        <Icon aria-hidden="true" />
      </span>
      <p className="state-title">{title}</p>
      {children}
    </div>
  );
}
