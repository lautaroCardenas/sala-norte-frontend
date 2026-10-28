// Estados comunes de las pantallas: cargando, error (con reintento) y sin resultados.

export function Loading({ label = "Cargando…" }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <p>{error?.message || "Ocurrió un error inesperado."}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="state">
      <p className="state-title">{title}</p>
      {children}
    </div>
  );
}
