import { useState } from "react";
import { releaseYear } from "../utils/format";

// Tono del póster tipográfico: se deriva del id para que cada película tenga
// siempre el mismo, dentro de una gama cálida y apagada.
const HUES = [355, 18, 32, 205, 160, 280, 340, 45];
export function posterHue(movie) {
  return HUES[movie.id % HUES.length];
}

// Póster de la película. Si no tiene imagen, o la imagen no carga (por ejemplo
// porque el archivo se borró del servidor), se muestra un póster tipográfico.
export default function Poster({ movie, tag, size = "card" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const showImage = movie.poster_url && failedUrl !== movie.poster_url;
  const year = releaseYear(movie.release_date);

  return (
    <div className={`poster poster-${size}`} style={{ "--poster-hue": posterHue(movie) }}>
      {showImage ? (
        <img
          src={movie.poster_url}
          alt=""
          className="poster-img"
          loading="lazy"
          onError={() => setFailedUrl(movie.poster_url)}
        />
      ) : (
        <div className="poster-fallback">
          <span className="poster-kicker">{year || "Sala Norte"}</span>
          <span className="poster-title">{movie.title}</span>
        </div>
      )}
      {tag && <span className="poster-tag">{tag}</span>}
    </div>
  );
}
