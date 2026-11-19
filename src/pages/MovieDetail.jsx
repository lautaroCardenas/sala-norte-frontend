import { Link, useParams } from "react-router";
import { ArrowLeft, CalendarDays, Clock, Film } from "lucide-react";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useFilters } from "../filters/FiltersContext";
import Layout from "../components/Layout";
import DayPicker from "../components/DayPicker";
import Poster, { posterHue } from "../components/Poster";
import { Empty, ErrorState, Loading } from "../components/States";
import { dayLabel, formatTime, releaseYear } from "../utils/format";

// Agrupa las funciones por formato e idioma: "IMAX · Doblada", "2D · Subtitulada"...
function groupByFormat(screenings) {
  return screenings.reduce((groups, screening) => {
    (groups[screening.format_label] ||= []).push(screening);
    return groups;
  }, {});
}

function Showtime({ screening }) {
  const time = formatTime(screening.starts_at);
  const where = `${screening.cinema.name} · ${screening.hall.name}`;

  if (screening.sold_out) {
    return (
      <span className="showtime showtime-sold" title="Agotada">
        <span className="showtime-time">{time}</span>
        <span className="showtime-hall">Agotada</span>
      </span>
    );
  }
  return (
    <Link
      to={`/funciones/${screening.id}`}
      className="showtime"
      title={`${where} · ${screening.available_seats} lugares`}
      aria-label={`${time}, ${where}`}
    >
      <span className="showtime-time">{time}</span>
      <span className="showtime-hall">{screening.hall.name}</span>
    </Link>
  );
}

export default function MovieDetail() {
  const { id } = useParams();
  const { date, cinemaId } = useFilters();
  const { data: movie, loading, error, reload } = useApi(
    () => api.movie(id, { date, cinema_id: cinemaId }),
    [id, date, cinemaId],
  );

  const groups = movie ? groupByFormat(movie.screenings) : {};
  const cinemaName = movie?.screenings[0]?.cinema.name;

  return (
    <Layout>
      {loading && !movie && <Loading label="Cargando película…" />}
      {error && error.status === 404 && (
        <Empty title="No encontramos esa película.">
          <Link to="/" className="btn btn-outline">
            Volver a la cartelera
          </Link>
        </Empty>
      )}
      {error && error.status !== 404 && <ErrorState error={error} onRetry={reload} />}

      {movie && (
        <div className="detail-wrap">
          <div className="detail-backdrop" aria-hidden="true">
            {movie.poster_url ? (
              <img src={movie.poster_url} alt="" />
            ) : (
              <div className="detail-backdrop-fallback" style={{ "--poster-hue": posterHue(movie) }} />
            )}
          </div>

          <Link to="/" className="link-button back-link">
            <ArrowLeft aria-hidden="true" /> Volver a cartelera
          </Link>

          <div className="detail">
            <div className="detail-poster">
              <Poster movie={movie} tag={movie.rating} size="large" />
            </div>

            <div className="detail-body">
              <span className="eyebrow">{movie.genre}</span>
              <h1 className="detail-title">{movie.title}</h1>
              <div className="meta">
                <span className="meta-item">
                  <Clock aria-hidden="true" />
                  {movie.duration}
                </span>
                {releaseYear(movie.release_date) && (
                  <span className="meta-item">
                    <Film aria-hidden="true" />
                    {releaseYear(movie.release_date)}
                  </span>
                )}
                <span className="rating">{movie.rating}</span>
              </div>
              {movie.synopsis && <p className="synopsis">{movie.synopsis}</p>}

              <section className="showtimes" aria-labelledby="showtimes-title">
                <div className="showtimes-header">
                  <h2 id="showtimes-title">Elegí función</h2>
                  <span className="meta-item muted small">
                    <CalendarDays aria-hidden="true" />
                    {dayLabel(date)}
                    {cinemaId && cinemaName ? ` · ${cinemaName}` : ""}
                  </span>
                </div>
                <DayPicker />

                {loading && <Loading label="Actualizando horarios…" />}
                {!loading && movie.screenings.length === 0 && (
                  <Empty title="No hay funciones para este día." icon={CalendarDays}>
                    <p className="muted">Probá con otra fecha o con otra sede.</p>
                  </Empty>
                )}
                {!loading &&
                  Object.entries(groups).map(([format, screenings]) => (
                    <div className="showtime-group" key={format}>
                      <div className="showtime-format">{format}</div>
                      <div className="showtime-list">
                        {screenings.map((screening) => (
                          <Showtime key={screening.id} screening={screening} />
                        ))}
                      </div>
                    </div>
                  ))}
                {!loading && movie.screenings.some((s) => s.sold_out) && (
                  <p className="muted small">Los horarios tachados están agotados.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
