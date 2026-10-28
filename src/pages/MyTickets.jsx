import { Link } from "react-router";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import Header from "../components/Header";
import { Empty, ErrorState, Loading } from "../components/States";
import { formatDateTime, formatMoney } from "../utils/format";

const STATUS_LABELS = { pending: "Pendiente de pago", paid: "Pagada", cancelled: "Cancelada" };

export default function MyTickets() {
  const { data: orders, loading, error, reload } = useApi(() => api.orders(), []);

  return (
    <>
      <Header />
      <main className="page">
        <h1 className="display">Mis entradas</h1>

        {loading && <Loading label="Cargando tus compras…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {!loading && !error && orders.length === 0 && (
          <Empty title="Todavía no compraste entradas.">
            <Link to="/" className="btn btn-primary">
              Ver cartelera
            </Link>
          </Empty>
        )}

        {!loading && !error && orders.length > 0 && (
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order.id} className="panel order">
                <div>
                  <h2>{order.screening.movie}</h2>
                  <p className="muted">
                    {formatDateTime(order.screening.starts_at)} · {order.screening.cinema} · {order.screening.hall}
                  </p>
                  <p>
                    {order.tickets.length > 0 ? `Asientos ${order.tickets.map((t) => t.seat).join(", ")}` : "Asientos liberados"}
                  </p>
                </div>
                <div className="order-side">
                  <span className={`badge badge-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                  <strong>{formatMoney(order.total)}</strong>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
