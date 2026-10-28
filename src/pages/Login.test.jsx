import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";
import { jsonResponse, mockApi, renderAt } from "../test/helpers";

const routes = [
  ["/login", <Login />],
  ["/", <p>Página de inicio</p>],
];

async function fillAndSubmit(email, password) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Correo electrónico"), email);
  await user.type(screen.getByLabelText("Contraseña"), password);
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("Login", () => {
  it("inicia sesión, guarda el token y redirige a la cartelera", async () => {
    const fetchMock = mockApi([
      [/^POST \/api\/v1\/login$/, () => jsonResponse({ token: "abc123", user: { id: 1, name: "María Rodríguez" } }, 201)],
    ]);
    renderAt("/login", routes);

    await fillAndSubmit("maria@example.com", "password123");

    expect(await screen.findByText("Página de inicio")).toBeInTheDocument();
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ email_address: "maria@example.com", password: "password123" });
    expect(sessionStorage.getItem("salanorte.token")).toBe("abc123");
  });

  it("muestra el error de la API cuando las credenciales son incorrectas", async () => {
    mockApi([[/^POST \/api\/v1\/login$/, () => jsonResponse({ error: "Correo o contraseña incorrectos" }, 401)]]);
    renderAt("/login", routes);

    await fillAndSubmit("maria@example.com", "incorrecta");

    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
    expect(screen.queryByText("Página de inicio")).not.toBeInTheDocument();
  });

  it("valida el formulario antes de llamar a la API", async () => {
    const fetchMock = mockApi([]);
    renderAt("/login", routes);

    await fillAndSubmit("no-es-un-mail", "x");

    expect(screen.getByText("Ingresá un correo válido.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
