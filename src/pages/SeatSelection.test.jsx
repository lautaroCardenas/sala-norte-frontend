import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useParams } from "react-router";
import SeatSelection from "./SeatSelection";
import { jsonResponse, mockApi, renderAt } from "../test/helpers";

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

const SCREENING = {
  id: 5,
  starts_at: tomorrow,
  price: "1000.0",
  service_fee_rate: "0.1",
  format_label: "2D · Doblada",
  sold_out: false,
  cinema: { id: 1, name: "Centro" },
  hall: { id: 1, name: "Sala 1" },
  movie: { id: 2, title: "Órbita baja" },
  seats: [
    { id: 11, row: "A", number: 1, accessible: false, taken: false },
    { id: 12, row: "A", number: 2, accessible: false, taken: false },
    { id: 13, row: "A", number: 3, accessible: false, taken: true },
  ],
};

function OrderPage() {
  const { id } = useParams();
  return <p>Detalle de la compra {id}</p>;
}

const routes = [
  ["/funciones/:id", <SeatSelection />],
  ["/mis-entradas/:id", <OrderPage />],
];

async function chooseSeatsAndConfirm(user) {
  await user.click(await screen.findByRole("button", { name: "Fila A, asiento 1, disponible" }));
  await user.click(screen.getByRole("button", { name: "Fila A, asiento 2, disponible" }));
  await user.click(screen.getByRole("button", { name: "Continuar al pago" }));
  await user.click(screen.getByRole("button", { name: "Confirmar y pagar" }));
}

describe("Compra de entradas", () => {
  it("elige asientos, crea la compra, la paga y muestra el detalle", async () => {
    const fetchMock = mockApi([
      [/^GET \/api\/v1\/screenings\/5$/, () => jsonResponse(SCREENING)],
      [/^POST \/api\/v1\/orders$/, () => jsonResponse({ id: 77, status: "pending" }, 201)],
      [/^PATCH \/api\/v1\/orders\/77\/pay$/, () => jsonResponse({ id: 77, status: "paid" })],
    ]);
    const user = userEvent.setup();
    renderAt("/funciones/5", routes);

    expect(await screen.findByRole("button", { name: "Fila A, asiento 3, ocupado" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Fila A, asiento 1, disponible" }));
    await user.click(screen.getByRole("button", { name: "Fila A, asiento 2, disponible" }));
    const summary = screen.getByRole("complementary", { name: "Resumen de la compra" });
    expect(within(summary).getByText("A1, A2")).toBeInTheDocument();
    expect(within(summary).getByText(/2\.200/)).toBeInTheDocument(); // 2 × 1000 + 10 %

    await user.click(screen.getByRole("button", { name: "Continuar al pago" }));
    await user.click(screen.getByRole("button", { name: "Confirmar y pagar" }));

    expect(await screen.findByText("Detalle de la compra 77")).toBeInTheDocument();
    const createCall = fetchMock.mock.calls.find(([, options]) => options?.method === "POST");
    expect(JSON.parse(createCall[1].body)).toEqual({ order: { screening_id: 5, seat_ids: [11, 12] } });
    expect(fetchMock.mock.calls.some(([url, options]) => options?.method === "PATCH" && String(url).endsWith("/orders/77/pay"))).toBe(true);
  });

  it("si los asientos ya fueron vendidos muestra el error y actualiza el mapa", async () => {
    let screeningRequests = 0;
    const fetchMock = mockApi([
      [
        /^GET \/api\/v1\/screenings\/5$/,
        () => {
          screeningRequests += 1;
          return jsonResponse(SCREENING);
        },
      ],
      [
        /^POST \/api\/v1\/orders$/,
        () => jsonResponse({ error: "No se pudo procesar la solicitud", details: ["Los asientos A1 ya están ocupados"] }, 422),
      ],
    ]);
    renderAt("/funciones/5", routes);

    await chooseSeatsAndConfirm(userEvent.setup());

    expect(await screen.findByRole("alert")).toHaveTextContent("Los asientos A1 ya están ocupados");
    expect(screen.getByRole("button", { name: "Continuar al pago" })).toBeDisabled(); // vuelve al paso de asientos, sin selección
    expect(screeningRequests).toBe(2); // recargó el mapa
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === "PATCH")).toBe(false);
    expect(screen.queryByText(/Detalle de la compra/)).not.toBeInTheDocument();
  });
});
