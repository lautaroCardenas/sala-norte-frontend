import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import Header from "../components/Header";
import SeatMap from "../components/SeatMap";
import { ErrorState, Loading } from "../components/States";
import { formatDateTime, formatMoney } from "../utils/format";

export const MAX_SEATS = 10;

function seatLabels(seats, ids) {
  return seats
    .filter((seat) => ids.includes(seat.id))
    .map((seat) => `${seat.row}${seat.number}`)
    .join(", ");
}

// Compra en dos pasos: 1) elegir asientos en el mapa, 2) confirmar y pagar.
// El pago es simulado: se crea la compra (POST /orders) y luego se paga (PATCH /orders/:id/pay).
export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: screening, loading, error, reload } = useApi(() => api.screening(id), [id]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [step, setStep] = useState("seats");
  const [submitting, setSubmitting] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [notice, setNotice] = useState(null);

  function toggleSeat(seat) {
    setNotice(null);
    if (selectedIds.includes(seat.id)) {
      setSelectedIds(selectedIds.filter((seatId) => seatId !== seat.id));
    } else if (selectedIds.length >= MAX_SEATS) {
      setNotice(`Podés elegir hasta ${MAX_SEATS} asientos por compra.`);
    } else {
      setSelectedIds([...selectedIds, seat.id]);
    }
  }

  async function confirmPurchase() {
    if (submitting) return;
    setSubmitting(true);
    setPurchaseError(null);

    let order;
    try {
      order = await api.createOrder(screening.id, selectedIds);
    } catch (err) {
      setSubmitting(false);
      if (err.status === 422) {
        // Probablemente otra persona compró alguno de los asientos: se actualiza el mapa.
        setPurchaseError(err.details?.length ? err.details : [err.message]);
        setSelectedIds([]);
        setStep("seats");
        reload();
      } else {
        setPurchaseError([err.message]);
      }
      return;
    }

    try {
      await api.payOrder(order.id);
      navigate(`/mis-entradas/${order.id}`, { state: { flash: "¡Listo! Tu compra está confirmada." } });
    } catch {
      navigate(`/mis-entradas/${order.id}`, {
        state: {
          flash: "La compra se registró pero no se pudo completar el pago. Podés reintentarlo desde acá.",
          flashType: "error",
        },
      });
    }
  }

  const subtotal = screening ? Number(screening.price) * selectedIds.length : 0;
  const serviceFee = screening ? Math.round(subtotal * Number(screening.service_fee_rate) * 100) / 100 : 0;
  const started = screening && new Date(screening.starts_at) <= new Date();

  return (
    <>
      <Header />
      <main className="page">
        {loading && !screening && <Loading label="Cargando función…" />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {screening && (
          <>
            <ol className="steps" aria-label="Pasos de la compra">
              <li>1. Función</li>
              <li aria-current={step === "seats" ? "step" : undefined}>2. Asientos</li>
              <li aria-current={step === "confirm" ? "step" : undefined}>3. Pago</li>
            </ol>

            {purchaseError && (
              <div className="alert alert-error" role="alert">
                <strong>No se pudo completar la compra.</strong>
                <ul>
                  {purchaseError.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            {started ? (
              <div className="panel">
                <p>Esta función ya comenzó y no se pueden comprar entradas.</p>
                <Link to={`/peliculas/${screening.movie.id}`}>← Elegir otra función</Link>
              </div>
            ) : (
              <div className="checkout">
                <section className="checkout-main">
                  {step === "seats" ? (
                    <>
                      <div className="checkout-header">
                        <Link to={`/peliculas/${screening.movie.id}`} className="back-link">
                          ← Cambiar función
                        </Link>
                        <span className="muted">
                          {screening.hall.name} · {screening.cinema.name}
                        </span>
                      </div>
                      {screening.sold_out ? (
                        <p>Esta función está agotada.</p>
                      ) : (
                        <SeatMap seats={screening.seats} selectedIds={selectedIds} onToggle={toggleSeat} />
                      )}
                      {loading && <Loading label="Actualizando asientos…" />}
                    </>
                  ) : (
                    <>
                      <button type="button" className="link-button back-link" onClick={() => setStep("seats")}>
                        ← Volver a asientos
                      </button>
                      <h1>Pago</h1>
                      <p>Revisá tu compra y confirmá para pagar.</p>
                      <p className="alert">
                        El pago es simulado: no se cobra nada ni se piden datos de tarjeta.
                      </p>
                    </>
                  )}
                </section>

                <aside className="panel checkout-summary" aria-label="Resumen de la compra">
                  <p className="muted small">Tu función</p>
                  <h2>{screening.movie.title}</h2>
                  <p className="muted">
                    {formatDateTime(screening.starts_at)} · {screening.format_label}
                  </p>
                  <hr />
                  <p>
                    Asientos ({selectedIds.length}):{" "}
                    <strong>{selectedIds.length ? seatLabels(screening.seats, selectedIds) : "ninguno"}</strong>
                  </p>
                  {notice && (
                    <p className="field-error" role="status">
                      {notice}
                    </p>
                  )}
                  <dl className="totals">
                    <dt>
                      Entrada general × {selectedIds.length}
                    </dt>
                    <dd>{formatMoney(subtotal)}</dd>
                    <dt>Cargo por servicio</dt>
                    <dd>{formatMoney(serviceFee)}</dd>
                    <dt className="total">Total</dt>
                    <dd className="total">{formatMoney(subtotal + serviceFee)}</dd>
                  </dl>

                  {step === "seats" ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      disabled={selectedIds.length === 0}
                      onClick={() => {
                        setPurchaseError(null);
                        setStep("confirm");
                      }}
                    >
                      Continuar al pago
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      disabled={submitting}
                      onClick={confirmPurchase}
                    >
                      {submitting ? "Procesando…" : "Confirmar y pagar"}
                    </button>
                  )}
                </aside>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
