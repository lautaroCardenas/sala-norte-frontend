// Mapa de asientos de una función. Cada asiento es un botón (accesible con
// teclado); los ocupados quedan deshabilitados. Se deja un pasillo al medio.
function groupByRow(seats) {
  return seats.reduce((rows, seat) => {
    (rows[seat.row] ||= []).push(seat);
    return rows;
  }, {});
}

export default function SeatMap({ seats, selectedIds, onToggle }) {
  const rows = groupByRow(seats);

  return (
    <div className="seat-map">
      <div className="screen" aria-hidden="true">
        <span>PANTALLA</span>
      </div>
      <div className="seat-rows" role="group" aria-label="Asientos de la sala">
        {Object.entries(rows).map(([row, rowSeats]) => {
          const aisleAfter = Math.ceil(rowSeats.length / 2);
          return (
            <div className="seat-row" key={row}>
              <span className="row-label" aria-hidden="true">
                {row}
              </span>
              {rowSeats.map((seat, index) => {
                const selected = selectedIds.includes(seat.id);
                const state = seat.taken ? "ocupado" : selected ? "seleccionado" : "disponible";
                return (
                  <button
                    key={seat.id}
                    type="button"
                    className={[
                      "seat",
                      seat.taken && "seat-taken",
                      selected && "seat-selected",
                      seat.accessible && "seat-accessible",
                      index + 1 === aisleAfter && "seat-aisle",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={seat.taken}
                    aria-pressed={selected}
                    aria-label={`Fila ${seat.row}, asiento ${seat.number}, ${state}${seat.accessible ? ", movilidad reducida" : ""}`}
                    onClick={() => onToggle(seat)}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <ul className="seat-legend">
        <li>
          <span className="seat seat-sample" /> Disponible
        </li>
        <li>
          <span className="seat seat-sample seat-selected" /> Seleccionado
        </li>
        <li>
          <span className="seat seat-sample seat-taken" /> Ocupado
        </li>
        <li>
          <span className="seat seat-sample seat-accessible" /> Movilidad reducida
        </li>
      </ul>
    </div>
  );
}
