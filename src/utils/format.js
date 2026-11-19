const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Fecha local en formato AAAA-MM-DD (el que espera la API). No se usa toISOString
// porque convierte a UTC y de noche devolvería el día siguiente.
export function toDateParam(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Próximos días para los botones de la cartelera: Hoy, Mañana, Vie, Sáb...
export function upcomingDays(count = 5) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const label = i === 0 ? "Hoy" : i === 1 ? "Mañana" : WEEKDAYS[date.getDay()];
    return { value: toDateParam(date), label };
  });
}

export function dayLabel(dateParam) {
  return upcomingDays(7).find((d) => d.value === dateParam)?.label || dateParam;
}

export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatMoney(amount) {
  return Number(amount).toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// "Hoy 17:30", "Mañana 11:00" o "vie 21/11 · 20:15" para la próxima función.
export function relativeShowtime(isoString) {
  const date = new Date(isoString);
  const today = toDateParam(new Date());
  const tomorrow = toDateParam(new Date(Date.now() + 86400000));
  const day = toDateParam(date);
  const time = formatTime(isoString);
  if (day === today) return `Hoy ${time}`;
  if (day === tomorrow) return `Mañana ${time}`;
  const label = date.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit" });
  return `${label} · ${time}`;
}

export function releaseYear(dateString) {
  return dateString ? dateString.slice(0, 4) : null;
}

// Partes de una fecha para mostrarla como bloque: { weekday: "VIE", day: "21", month: "NOV" }.
export function dateParts(isoString) {
  const date = new Date(isoString);
  return {
    weekday: date.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "").toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleDateString("es-AR", { month: "short" }).replace(".", "").toUpperCase(),
  };
}
