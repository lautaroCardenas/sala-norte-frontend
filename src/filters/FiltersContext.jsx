import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toDateParam } from "../utils/format";

const CINEMA_KEY = "salanorte.cinemaId";
const FiltersContext = createContext(null);

// Día y sede elegidos en la cartelera; se comparten con el detalle de la película.
// La sede se recuerda entre visitas, el día siempre arranca en "Hoy".
export function FiltersProvider({ children }) {
  const [date, setDate] = useState(() => toDateParam(new Date()));
  const [cinemaId, setCinemaId] = useState(() => {
    try {
      return localStorage.getItem(CINEMA_KEY) || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CINEMA_KEY, cinemaId);
    } catch {
      // Sin almacenamiento disponible: la sede no se recuerda.
    }
  }, [cinemaId]);

  const value = useMemo(() => ({ date, setDate, cinemaId, setCinemaId }), [date, cinemaId]);
  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  return useContext(FiltersContext);
}
