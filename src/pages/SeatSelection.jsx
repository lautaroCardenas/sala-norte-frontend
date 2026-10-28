import { Link, useParams } from "react-router";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import Header from "../components/Header";
import { ErrorState, Loading } from "../components/States";
import { formatDateTime } from "../utils/format";

// Checkpoint: muestra la función elegida con datos reales de la API.
// El mapa de asientos y el pago se implementan en la siguiente etapa.
export default function SeatSelection() {
  const { id } = useParams();
  const { data: screening, loading, error, reload } = useApi(() => api.screening(id), [id]);

  return (
    <>
      <Header />
      <main className="page">
        {loading && <Loading label="Cargando función…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {screening && (
          <div className="panel">
            <Link to={`/peliculas/${screening.movie.id}`} className="back-link">
              ← Cambiar función
            </Link>
            <h1>{screening.movie.title}</h1>
            <p className="muted">
              {formatDateTime(screening.starts_at)} · {screening.format_label} · {screening.cinema.name} ·{" "}
              {screening.hall.name}
            </p>
            <p>
              {screening.available_seats} de {screening.seats.length} asientos disponibles.
            </p>
            <div className="alert">La selección de asientos y el pago están en desarrollo para la entrega final.</div>
          </div>
        )}
      </main>
    </>
  );
}
