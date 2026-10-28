import { useFilters } from "../filters/FiltersContext";
import { upcomingDays } from "../utils/format";

export default function DayPicker() {
  const { date, setDate } = useFilters();

  return (
    <div className="day-picker" role="group" aria-label="Día de la función">
      {upcomingDays().map((day) => (
        <button
          key={day.value}
          type="button"
          className={`chip ${day.value === date ? "chip-active" : ""}`}
          aria-pressed={day.value === date}
          onClick={() => setDate(day.value)}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}
