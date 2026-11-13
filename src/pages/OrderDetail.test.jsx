import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderDetail from "./OrderDetail";
import { jsonResponse, mockApi, renderAt } from "../test/helpers";

const ORDER = {
  id: 77,
  status: "paid",
  cancellable: true,
  service_fee: "200.0",
  total: "2200.0",
  screening: {
    id: 5,
    starts_at: new Date(Date.now() + 86400000).toISOString(),
    format_label: "2D · Doblada",
    movie: "Órbita baja",
    movie_id: 2,
    cinema: "Centro",
    hall: "Sala 1",
  },
  tickets: [
    { id: 1, seat: "A1", code: "X7K2P9QA01", price: "1000.0" },
    { id: 2, seat: "A2", code: "M4N8T2WB55", price: "1000.0" },
  ],
};

const routes = [["/mis-entradas/:id", <OrderDetail />]];

describe("Detalle de compra", () => {
  it("muestra los códigos y permite cancelar", async () => {
    vi.stubGlobal("confirm", () => true);
    mockApi([
      [/^GET \/api\/v1\/orders\/77$/, () => jsonResponse(ORDER)],
      [
        /^PATCH \/api\/v1\/orders\/77\/cancel$/,
        () => jsonResponse({ ...ORDER, status: "cancelled", cancellable: false, tickets: [] }),
      ],
    ]);
    renderAt("/mis-entradas/77", routes);

    expect(await screen.findByText("X7K2P9QA01")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Cancelar compra" }));

    expect(await screen.findByText("La compra fue cancelada y los asientos quedaron libres.")).toBeInTheDocument();
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancelar compra" })).not.toBeInTheDocument();
  });

  it("muestra el error de la API si no se puede cancelar", async () => {
    vi.stubGlobal("confirm", () => true);
    mockApi([
      [/^GET \/api\/v1\/orders\/77$/, () => jsonResponse(ORDER)],
      [
        /^PATCH \/api\/v1\/orders\/77\/cancel$/,
        () => jsonResponse({ error: "No se puede cancelar una compra de una función que ya empezó" }, 422),
      ],
    ]);
    renderAt("/mis-entradas/77", routes);

    await userEvent.setup().click(await screen.findByRole("button", { name: "Cancelar compra" }));

    expect(await screen.findByRole("status")).toHaveTextContent("ya empezó");
    expect(screen.getByText("Pagada")).toBeInTheDocument();
  });
});
