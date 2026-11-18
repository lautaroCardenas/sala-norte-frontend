import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Billboard from "./Billboard";
import { jsonResponse, mockApi, renderAt } from "../test/helpers";

const MOVIES = [
  { id: 1, title: "Órbita baja", genre: "Ciencia ficción", duration: "2 h 12 min", rating: "+13", poster_url: null },
  { id: 2, title: "Casa de verano", genre: "Comedia", duration: "1 h 41 min", rating: "ATP", poster_url: null },
];

describe("Cartelera", () => {
  it("muestra las películas que devuelve la API", async () => {
    mockApi([
      [/^GET \/api\/v1\/cinemas$/, () => jsonResponse([])],
      [/^GET \/api\/v1\/movies$/, () => jsonResponse(MOVIES)],
    ]);
    renderAt("/", [["/", <Billboard />]]);

    expect(screen.getByText("Cargando películas…")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Órbita baja/ })).toHaveAttribute("href", "/peliculas/1");
    expect(screen.getByText("Comedia · 1 h 41 min")).toBeInTheDocument();
  });

  it("muestra un error si no hay conexión y permite reintentar", async () => {
    let attempts = 0;
    mockApi([
      [/^GET \/api\/v1\/cinemas$/, () => jsonResponse([])],
      [
        /^GET \/api\/v1\/movies$/,
        () => (++attempts === 1 ? Promise.reject(new TypeError("Failed to fetch")) : jsonResponse(MOVIES)),
      ],
    ]);
    renderAt("/", [["/", <Billboard />]]);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor");

    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Órbita baja", { selector: ".movie-card-title" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("avisa cuando no hay funciones para el día elegido", async () => {
    mockApi([
      [/^GET \/api\/v1\/cinemas$/, () => jsonResponse([])],
      // Sin `date` devuelve todas las películas; con `date`, las que tienen funciones ese día (ninguna).
      [/^GET \/api\/v1\/movies$/, (url) => jsonResponse(new URL(url).searchParams.has("date") ? [] : MOVIES)],
    ]);
    renderAt("/", [["/", <Billboard />]]);

    expect(await screen.findByText(/No hay funciones para hoy/)).toBeInTheDocument();
    expect(screen.getAllByText("Sin funciones este día")).toHaveLength(2);
  });

  it("muestra también las películas sin funciones ese día, al final y marcadas", async () => {
    mockApi([
      [/^GET \/api\/v1\/cinemas$/, () => jsonResponse([])],
      [/^GET \/api\/v1\/movies$/, (url) => jsonResponse(new URL(url).searchParams.has("date") ? [MOVIES[1]] : MOVIES)],
    ]);
    renderAt("/", [["/", <Billboard />]]);

    const cards = await screen.findAllByRole("link", { name: /Órbita baja|Casa de verano/ });
    expect(cards.map((card) => card.getAttribute("href"))).toEqual(["/peliculas/2", "/peliculas/1"]);
    expect(cards[0]).not.toHaveTextContent("Sin funciones este día");
    expect(cards[1]).toHaveTextContent("Sin funciones este día");
  });
});
