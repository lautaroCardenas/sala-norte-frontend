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

// Cartelera: todas las películas en cartelera; primero las que tienen funciones
// el día (y sede) elegidos y después las que no, marcadas "Sin funciones".
async function loadBillboard(date, cinemaId) {
  const [all, withScreenings] = await Promise.all([api.movies(), api.movies({ date, cinema_id: cinemaId })]);
  const available = new Set(withScreenings.map((movie) => movie.id));
  return all
    .map((movie) => ({ ...movie, hasScreenings: available.has(movie.id) }))
    .sort((a, b) => Number(b.hasScreenings) - Number(a.hasScreenings));
}

export default function Billboard({ comingSoon = false }) {
  const { date, cinemaId } = useFilters();
  const { data: movies, loading, error, reload } = useApi(
    () => (comingSoon ? api.movies({ status: "coming_soon" }) : loadBillboard(date, cinemaId)),
    [comingSoon, date, cinemaId],
  );

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
          <Empty title={comingSoon ? "No hay estrenos anunciados." : "No hay películas en cartelera."} />
        )}
        {!loading && !error && !comingSoon && movies.length > 0 && !movies.some((movie) => movie.hasScreenings) && (
          <p className="alert" role="status">
            No hay funciones para {dayLabel(date).toLowerCase()}
            {cinemaId ? " en esta sede" : ""}. Probá con otro día{cinemaId ? " u otra sede" : ""}.
          </p>
        )}

        {!loading && !error && movies.length > 0 && (
          <ul className="movie-grid">
            {movies.map((movie) => (
              <li key={movie.id}>
                <Link
                  to={`/peliculas/${movie.id}`}
                  className={`movie-card ${comingSoon || movie.hasScreenings ? "" : "movie-card-unavailable"}`}
                >
                  <Poster movie={movie} tag={movie.rating} />
                  <span className="movie-card-title">{movie.title}</span>
                  <span className="muted small">
                    {movie.genre} · {movie.duration}
                  </span>
                  {!comingSoon && !movie.hasScreenings && <span className="no-screenings">Sin funciones este día</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
