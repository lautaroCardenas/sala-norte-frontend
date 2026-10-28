import { Link } from "react-router";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useFilters } from "../filters/FiltersContext";
import Header from "../components/Header";
import CinemaSelect from "../components/CinemaSelect";
import DayPicker from "../components/DayPicker";
import Poster from "../components/Poster";
import { Empty, ErrorState, Loading } from "../components/States";
import { dayLabel } from "../utils/format";

// Cartelera (películas con funciones el día/sede elegidos) y Próximamente.
export default function Billboard({ comingSoon = false }) {
  const { date, cinemaId, setCinemaId } = useFilters();
  const params = comingSoon ? { status: "coming_soon" } : { date, cinema_id: cinemaId };
  const { data: movies, loading, error, reload } = useApi(() => api.movies(params), [comingSoon, date, cinemaId]);

  return (
    <>
      <Header>{!comingSoon && <CinemaSelect />}</Header>
      <main className="page">
        <div className="page-header">
          <h1 className="display">{comingSoon ? "Próximamente" : "En cartelera"}</h1>
          {!comingSoon && <DayPicker />}
        </div>

        {loading && <Loading label="Cargando películas…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {!loading && !error && movies.length === 0 && (
          <Empty title={comingSoon ? "No hay estrenos anunciados." : `No hay funciones para ${dayLabel(date).toLowerCase()}.`}>
            {!comingSoon && cinemaId && (
              <button type="button" className="btn btn-outline" onClick={() => setCinemaId("")}>
                Ver todas las sedes
              </button>
            )}
          </Empty>
        )}

        {!loading && !error && movies.length > 0 && (
          <ul className="movie-grid">
            {movies.map((movie) => (
              <li key={movie.id}>
                <Link to={`/peliculas/${movie.id}`} className="movie-card">
                  <Poster movie={movie} tag={movie.rating} />
                  <span className="movie-card-title">{movie.title}</span>
                  <span className="muted small">
                    {movie.genre} · {movie.duration}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
