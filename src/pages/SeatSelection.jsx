import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AlertCircle, ArrowLeft, Check, Info, Loader2, Lock, MapPin } from "lucide-react";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import Layout from "../components/Layout";
import Poster from "../components/Poster";
import SeatMap from "../components/SeatMap";
import { ErrorState, Loading } from "../components/States";
import { formatDateTime, formatMoney } from "../utils/format";

export const MAX_SEATS = 10;

function selectedSeats(seats, ids) {
  return seats.filter((seat) => ids.includes(seat.id)).map((seat) => `${seat.row}${seat.number}`);
}

function Steps({ step }) {
  const items = [
    ["1", "Función", "done"],
    ["2", "Asientos", step === "seats" ? "current" : "done"],
    ["3", "Pago", step === "confirm" ? "current" : "todo"],
  ];
  return (
    <ol className="steps" aria-label="Pasos de la compra">
      {items.map(([num, label, state]) => (
        <li key={label} className={state === "done" ? "step-done" : undefined} aria-current={state === "current" ? "step" : undefined}>
          <span className="step-num">{state === "done" ? <Check size={13} aria-hidden="true" /> : num}</span>
          {label}
        </li>
      ))}
    </ol>
  );
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
  const labels = screening ? selectedSeats(screening.seats, selectedIds) : [];

  return (
    <Layout>
      {loading && !screening && <Loading label="Cargando función…" />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {screening && (
        <>
          <Steps step={step} />

          {purchaseError && (
            <div className="alert alert-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <div>
                <strong>No se pudo completar la compra.</strong>
                <ul>
                  {purchaseError.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {started ? (
            <div className="pay-panel">
              <p>Esta función ya comenzó y no se pueden comprar entradas.</p>
              <Link to={`/peliculas/${screening.movie.id}`} className="btn btn-outline" style={{ marginTop: 16 }}>
                Elegir otra función
              </Link>
            </div>
          ) : (
            <div className="checkout">
              <section>
                {step === "seats" ? (
                  <>
                    <div className="checkout-header">
                      <Link to={`/peliculas/${screening.movie.id}`} className="link-button back-link">
                        <ArrowLeft aria-hidden="true" /> Cambiar función
                      </Link>
                      <span className="meta-item muted small">
                        <MapPin aria-hidden="true" size={15} />
                        {screening.cinema.name} · {screening.hall.name}
                      </span>
                    </div>
                    <h1 className="checkout-title">Elegí tus asientos</h1>
                    <p className="muted" style={{ marginBottom: 24 }}>
                      Hasta {MAX_SEATS} por compra. Tocá un asiento para seleccionarlo.
                    </p>
                    {screening.sold_out ? (
                      <div className="pay-panel">Esta función está agotada.</div>
                    ) : (
                      <SeatMap seats={screening.seats} selectedIds={selectedIds} onToggle={toggleSeat} />
                    )}
                    {loading && <Loading label="Actualizando asientos…" />}
                  </>
                ) : (
                  <>
                    <button type="button" className="link-button back-link" onClick={() => setStep("seats")}>
                      <ArrowLeft aria-hidden="true" /> Volver a asientos
                    </button>
                    <h1 className="checkout-title">Pago</h1>
                    <div className="pay-panel">
                      <p>Revisá tu compra en el resumen y confirmá para pagar.</p>
                      <p className="muted">
                        Al confirmar se reservan los asientos y la compra queda pagada. Vas a ver tus entradas con su
                        código en <strong>Mis entradas</strong>.
                      </p>
                    </div>
                    <p className="alert" style={{ marginTop: 20 }}>
                      <Info aria-hidden="true" />
                      El pago es simulado: no se cobra nada ni se piden datos de tarjeta.
                    </p>
                  </>
                )}
              </section>

              <aside className="summary" aria-label="Resumen de la compra">
                <div className="summary-movie">
                  <Poster movie={{ ...screening.movie, poster_url: null }} size="thumb" />
                  <div>
                    <p className="eyebrow">Tu función</p>
                    <h2>{screening.movie.title}</h2>
                    <p className="muted small">
                      {formatDateTime(screening.starts_at)} · {screening.format_label}
                    </p>
                  </div>
                </div>

                <div className="summary-section">
                  <p className="summary-seats">
                    Asientos ({selectedIds.length}): <span className="sr-only">{labels.join(", ")}</span>
                    {labels.length === 0 && <span className="muted"> ninguno</span>}
                  </p>
                  {labels.length > 0 && (
                    <div className="seat-pills" aria-hidden="true">
                      {labels.map((label) => (
                        <span key={label} className="seat-pill">
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                  {notice && (
                    <p className="field-error" role="status" style={{ marginTop: 10 }}>
                      {notice}
                    </p>
                  )}
                </div>

                <dl className="totals">
                  <dt>Entrada general × {selectedIds.length}</dt>
                  <dd>{formatMoney(subtotal)}</dd>
                  <dt>Cargo por servicio</dt>
                  <dd>{formatMoney(serviceFee)}</dd>
                  <dt className="total">Total</dt>
                  <dd className="total">{formatMoney(subtotal + serviceFee)}</dd>
                </dl>

                {step === "seats" ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-block btn-large"
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
                    className={`btn btn-primary btn-block btn-large ${submitting ? "is-loading" : ""}`}
                    disabled={submitting}
                    onClick={confirmPurchase}
                  >
                    {submitting && <Loader2 aria-hidden="true" />}
                    {submitting ? "Procesando…" : "Confirmar y pagar"}
                  </button>
                )}
                <p className="summary-note">
                  <Lock aria-hidden="true" />
                  Los asientos se confirman al pagar.
                </p>
              </aside>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
