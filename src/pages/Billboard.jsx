import { Link } from "react-router";
import { CalendarClock, Clock, Ticket } from "lucide-react";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useFilters } from "../filters/FiltersContext";
import Layout from "../components/Layout";
import CinemaSelect from "../components/CinemaSelect";
import DayPicker from "../components/DayPicker";
import Poster from "../components/Poster";
import { Empty, ErrorState, SkeletonGrid } from "../components/States";
import { dayLabel, formatTime, relativeShowtime } from "../utils/format";

// Cartelera: primero las películas con funciones el día y la sede elegidos (ordenadas
// por su próxima función, como las devuelve la API) y después las demás, marcadas.
async function loadBillboard(date, cinemaId) {
  const [all, withScreenings] = await Promise.all([api.movies(), api.movies({ date, cinema_id: cinemaId })]);
  const available = new Set(withScreenings.map((movie) => movie.id));
  return [
    ...withScreenings.map((movie) => ({ ...movie, hasScreenings: true })),
    ...all.filter((movie) => !available.has(movie.id)).map((movie) => ({ ...movie, hasScreenings: false })),
  ];
}

function FeaturedMovie({ movie }) {
  return (
    <section className="hero" aria-labelledby="featured-title">
      <Poster movie={movie} tag={movie.rating} size="large" />
      <div className="hero-body">
        <span className="eyebrow">Próxima función</span>
        <h2 id="featured-title" className="hero-title">
          {movie.title}
        </h2>
        <div className="meta">
          <span>{movie.genre}</span>
          <span className="meta-item">
            <Clock aria-hidden="true" />
            {movie.duration}
          </span>
          <span className="rating">{movie.rating}</span>
        </div>
        {movie.synopsis && <p className="hero-synopsis">{movie.synopsis}</p>}
        {movie.next_screening && (
          <span className="hero-next">
            <CalendarClock aria-hidden="true" />
            {relativeShowtime(movie.next_screening.starts_at)}
          </span>
        )}
        <div className="hero-actions">
          {movie.next_screening && (
            <Link to={`/funciones/${movie.next_screening.id}`} className="btn btn-primary btn-large">
              <Ticket aria-hidden="true" />
              Comprar entradas
            </Link>
          )}
          <Link to={`/peliculas/${movie.id}`} className="btn btn-outline btn-large">
            Ver todos los horarios
          </Link>
        </div>
      </div>
    </section>
  );
}

function MovieCard({ movie, comingSoon }) {
  const unavailable = !comingSoon && !movie.hasScreenings;
  return (
    <Link to={`/peliculas/${movie.id}`} className={`movie-card ${unavailable ? "movie-card-unavailable" : ""}`}>
      <Poster movie={movie} tag={movie.rating} />
      <span className="movie-card-title">{movie.title}</span>
      <span className="movie-card-meta">
        {movie.genre} · {movie.duration}
      </span>
      {!comingSoon && movie.hasScreenings && movie.next_screening && (
        <span className="movie-card-next">
          <Clock aria-hidden="true" />
          Desde las {formatTime(movie.next_screening.starts_at)}
        </span>
      )}
      {unavailable && <span className="no-screenings">Sin funciones este día</span>}
    </Link>
  );
}

export default function Billboard({ comingSoon = false }) {
  const { date, cinemaId } = useFilters();
  const { data: movies, loading, error, reload } = useApi(
    () => (comingSoon ? api.movies({ status: "coming_soon" }) : loadBillboard(date, cinemaId)),
    [comingSoon, date, cinemaId],
  );

  const ready = !loading && !error && movies;
  const featured = ready && !comingSoon ? movies.find((movie) => movie.hasScreenings) : null;
  const anyScreening = ready && movies.some((movie) => movie.hasScreenings);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <p className="eyebrow">{comingSoon ? "Estrenos" : "Sala Norte · Mendoza"}</p>
          <h1 className="display">
            {comingSoon ? (
              "Próximamente"
            ) : (
              <>
                En <em>cartelera</em>
              </>
            )}
          </h1>
        </div>
      </div>

      {!comingSoon && (
        <div className="toolbar">
          <DayPicker />
          <CinemaSelect />
        </div>
      )}

      {loading && <SkeletonGrid label="Cargando películas…" />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {ready && movies.length === 0 && (
        <Empty title={comingSoon ? "No hay estrenos anunciados." : "No hay películas en cartelera."} />
      )}

      {ready && !comingSoon && movies.length > 0 && !anyScreening && (
        <p className="alert" role="status">
          No hay funciones para {dayLabel(date).toLowerCase()}
          {cinemaId ? " en esta sede" : ""}. Probá con otro día{cinemaId ? " u otra sede" : ""}.
        </p>
      )}

      {featured && <FeaturedMovie movie={featured} />}

      {ready && movies.length > 0 && (
        <>
          {!comingSoon && (
            <div className="section-title">
              <h2>{anyScreening ? `Funciones de ${dayLabel(date).toLowerCase()}` : "Todas las películas"}</h2>
              <span className="muted small">{movies.length} películas</span>
            </div>
          )}
          <ul className="movie-grid">
            {movies.map((movie) => (
              <li key={movie.id}>
                <MovieCard movie={movie} comingSoon={comingSoon} />
              </li>
            ))}
          </ul>
        </>
      )}
    </Layout>
  );
}
