import { Link, useParams } from "react-router";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useFilters } from "../filters/FiltersContext";
import Header from "../components/Header";
import DayPicker from "../components/DayPicker";
import Poster from "../components/Poster";
import { Empty, ErrorState, Loading } from "../components/States";
import { dayLabel, formatTime } from "../utils/format";

// Agrupa las funciones por formato e idioma: "IMAX · Doblada", "2D · Subtitulada"...
function groupByFormat(screenings) {
  return screenings.reduce((groups, screening) => {
    (groups[screening.format_label] ||= []).push(screening);
    return groups;
  }, {});
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
    <>
      <Header />
      <main className="page">
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
          <div className="detail">
            <Poster movie={movie} tag={movie.rating} size="large" />

            <div className="detail-body">
              <Link to="/" className="back-link">
                ← Volver a cartelera
              </Link>
              <h1 className="display">{movie.title}</h1>
              <div className="pills">
                <span className="pill">{movie.genre}</span>
                <span className="pill">{movie.duration}</span>
                <span className="pill">{movie.rating}</span>
              </div>
              {movie.synopsis && <p className="synopsis">{movie.synopsis}</p>}

              <hr />

              <div className="showtimes-header">
                <h2>Elegí función</h2>
                <span className="muted">
                  {dayLabel(date)}
                  {cinemaId && cinemaName ? ` · ${cinemaName}` : ""}
                </span>
              </div>
              <DayPicker />

              {loading && <Loading label="Actualizando horarios…" />}
              {!loading && movie.screenings.length === 0 && (
                <Empty title="No hay funciones para este día. Probá con otra fecha o sede." />
              )}
              {!loading &&
                Object.entries(groups).map(([format, screenings]) => (
                  <div className="showtime-row" key={format}>
                    <span className="showtime-format">{format}</span>
                    <div className="showtime-list">
                      {screenings.map((screening) =>
                        screening.sold_out ? (
                          <span key={screening.id} className="showtime showtime-sold" title="Agotada">
                            <s>{formatTime(screening.starts_at)}</s>
                          </span>
                        ) : (
                          <Link
                            key={screening.id}
                            to={`/funciones/${screening.id}`}
                            className="showtime"
                            title={`${screening.cinema.name} · ${screening.hall.name} · ${screening.available_seats} lugares`}
                          >
                            {formatTime(screening.starts_at)}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              <p className="muted small">Los horarios tachados están agotados.</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
