import { useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import Header from "../components/Header";
import { Empty, ErrorState, Loading } from "../components/States";
import { formatDateTime, formatMoney } from "../utils/format";

export const STATUS_LABELS = { pending: "Pendiente de pago", paid: "Pagada", cancelled: "Cancelada" };

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { data, loading, error, reload } = useApi(() => api.order(id), [id]);
  const [order, setOrder] = useState(null);
  const [flash, setFlash] = useState(
    location.state?.flash ? { text: location.state.flash, type: location.state.flashType || "notice" } : null,
  );
  const [busy, setBusy] = useState(null); // "pay" | "cancel" mientras se procesa

  const current = order || data;

  async function runAction(action) {
    if (busy) return;
    if (action === "cancel" && !window.confirm("¿Cancelar la compra? Los asientos se liberan y no se puede deshacer.")) {
      return;
    }
    setBusy(action);
    setFlash(null);
    try {
      const updated = action === "pay" ? await api.payOrder(current.id) : await api.cancelOrder(current.id);
      setOrder(updated);
      setFlash({
        text: action === "pay" ? "¡Listo! Tu compra está confirmada." : "La compra fue cancelada y los asientos quedaron libres.",
        type: "notice",
      });
    } catch (err) {
      setFlash({ text: err.message, type: "error" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Header />
      <main className="page">
        <Link to="/mis-entradas" className="back-link">
          ← Mis entradas
        </Link>

        {flash && (
          <div className={`alert ${flash.type === "error" ? "alert-error" : "alert-success"}`} role="status">
            {flash.text}
          </div>
        )}

        {loading && !current && <Loading label="Cargando compra…" />}
        {error && error.status === 404 && (
          <Empty title="No encontramos esa compra.">
            <Link to="/mis-entradas" className="btn btn-outline">
              Volver a mis entradas
            </Link>
          </Empty>
        )}
        {error && error.status !== 404 && <ErrorState error={error} onRetry={reload} />}

        {current && (
          <article className="panel order-detail">
            <div className="order-detail-header">
              <div>
                <p className="muted small">Compra #{current.id}</p>
                <h1>{current.screening.movie}</h1>
                <p className="muted">
                  {formatDateTime(current.screening.starts_at)} · {current.screening.format_label}
                </p>
                <p>
                  {current.screening.cinema} · {current.screening.hall}
                </p>
              </div>
              <span className={`badge badge-${current.status}`}>{STATUS_LABELS[current.status]}</span>
            </div>

            <hr />

            {current.tickets.length > 0 ? (
              <>
                <h2>Entradas</h2>
                {current.status === "pending" && (
                  <p className="muted">Las entradas se habilitan cuando la compra está pagada.</p>
                )}
                <ul className="ticket-list">
                  {current.tickets.map((ticket) => (
                    <li key={ticket.id} className="ticket">
                      <span>
                        Asiento <strong>{ticket.seat}</strong>
                      </span>
                      <code className="ticket-code" aria-label={`Código de entrada ${ticket.code}`}>
                        {current.status === "paid" ? ticket.code : "••••••••••"}
                      </code>
                      <span className="muted">{formatMoney(ticket.price)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="muted">Los asientos de esta compra fueron liberados.</p>
            )}

            <dl className="totals">
              <dt>Cargo por servicio</dt>
              <dd>{formatMoney(current.service_fee)}</dd>
              <dt className="total">Total</dt>
              <dd className="total">{formatMoney(current.total)}</dd>
            </dl>

            <div className="actions">
              {current.status === "pending" && (
                <button type="button" className="btn btn-primary" disabled={Boolean(busy)} onClick={() => runAction("pay")}>
                  {busy === "pay" ? "Procesando…" : "Pagar ahora"}
                </button>
              )}
              {current.cancellable && (
                <button type="button" className="btn btn-danger" disabled={Boolean(busy)} onClick={() => runAction("cancel")}>
                  {busy === "cancel" ? "Cancelando…" : "Cancelar compra"}
                </button>
              )}
              {!current.cancellable && current.status !== "cancelled" && (
                <p className="muted small">La función ya empezó: esta compra no se puede cancelar.</p>
              )}
            </div>
          </article>
        )}
      </main>
    </>
  );
}
