import { Link } from "react-router";
import { ChevronRight, Ticket } from "lucide-react";
import { api } from "../api/client";
import { useApi } from "../hooks/useApi";
import Layout from "../components/Layout";
import { Empty, ErrorState, Loading } from "../components/States";
import { dateParts, formatMoney, formatTime } from "../utils/format";
import { STATUS_LABELS } from "./OrderDetail";

export default function MyTickets() {
  const { data: orders, loading, error, reload } = useApi(() => api.orders(), []);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <p className="eyebrow">Tu cuenta</p>
          <h1 className="display">Mis entradas</h1>
        </div>
      </div>

      {loading && <Loading label="Cargando tus compras…" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && orders.length === 0 && (
        <Empty title="Todavía no compraste entradas." icon={Ticket}>
          <Link to="/" className="btn btn-primary">
            Ver cartelera
          </Link>
        </Empty>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="order-list">
          {orders.map((order) => {
            const date = dateParts(order.screening.starts_at);
            return (
              <li key={order.id}>
                <Link to={`/mis-entradas/${order.id}`} className="order order-link">
                  <div className="date-block" aria-hidden="true">
                    <span className="date-block-weekday">{date.weekday}</span>
                    <span className="date-block-day">{date.day}</span>
                    <span className="date-block-month">{date.month}</span>
                  </div>
                  <div>
                    <h2>{order.screening.movie}</h2>
                    <p className="muted small">
                      {formatTime(order.screening.starts_at)} · {order.screening.cinema} · {order.screening.hall}
                    </p>
                    <p className="small" style={{ marginTop: 4 }}>
                      {order.tickets.length > 0
                        ? `Asientos ${order.tickets.map((t) => t.seat).join(", ")}`
                        : "Asientos liberados"}
                    </p>
                  </div>
                  <div className="order-side">
                    <span className={`badge badge-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                    <span className="order-total">{formatMoney(order.total)}</span>
                    <span className="link-button">
                      Ver detalle <ChevronRight aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}
