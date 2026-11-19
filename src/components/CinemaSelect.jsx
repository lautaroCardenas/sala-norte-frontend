import { MapPin } from "lucide-react";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useFilters } from "../filters/FiltersContext";

export default function CinemaSelect() {
  const { cinemaId, setCinemaId } = useFilters();
  const { data: cinemas } = useApi(() => api.cinemas(), []);

  return (
    <label className="cinema-select">
      <MapPin aria-hidden="true" />
      <span className="sr-only">Sede</span>
      <select className="select" value={cinemaId} onChange={(e) => setCinemaId(e.target.value)}>
        <option value="">Todas las sedes</option>
        {(cinemas || []).map((cinema) => (
          <option key={cinema.id} value={cinema.id}>
            {cinema.name}
          </option>
        ))}
      </select>
    </label>
  );
}
