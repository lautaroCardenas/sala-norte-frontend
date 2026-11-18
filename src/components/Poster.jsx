import { useState } from "react";

// Póster de la película. Si no tiene imagen, o la imagen no carga (por ejemplo
// porque el archivo se borró del servidor), se muestra un recuadro gris con el título.
export default function Poster({ movie, tag, size = "card" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const showImage = movie.poster_url && failedUrl !== movie.poster_url;

  return (
    <div className={`poster poster-${size}`}>
      {showImage ? (
        <img src={movie.poster_url} alt="" className="poster-img" onError={() => setFailedUrl(movie.poster_url)} />
      ) : (
        <span className="poster-title">{movie.title}</span>
      )}
      {tag && <span className="poster-tag">{tag}</span>}
    </div>
  );
}
