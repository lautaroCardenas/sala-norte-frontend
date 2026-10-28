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
      [/^GET \/api\/v1\/movies$/, () => jsonResponse([])],
    ]);
    renderAt("/", [["/", <Billboard />]]);

    expect(await screen.findByText("No hay funciones para hoy.")).toBeInTheDocument();
  });
});
