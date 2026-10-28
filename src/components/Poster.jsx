// Póster de la película. Si no tiene imagen cargada en el back-office,
// se muestra un recuadro gris con el título.
export default function Poster({ movie, tag, size = "card" }) {
  return (
    <div className={`poster poster-${size}`}>
      {movie.poster_url ? (
        <img src={movie.poster_url} alt="" className="poster-img" />
      ) : (
        <span className="poster-title">{movie.title}</span>
      )}
      {tag && <span className="poster-tag">{tag}</span>}
    </div>
  );
}
