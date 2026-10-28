import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { vi } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { FiltersProvider } from "../filters/FiltersContext";

export function jsonResponse(body, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );
}

// Reemplaza fetch por respuestas simuladas según la ruta pedida.
// `routes` es una lista de [patrón, función que devuelve la respuesta].
export function mockApi(routes) {
  const fetchMock = vi.fn((url, options = {}) => {
    const { pathname } = new URL(url);
    const method = options.method || "GET";
    const match = routes.find(([pattern]) => `${method} ${pathname}`.match(pattern));
    if (!match) throw new Error(`Request no simulada: ${method} ${pathname}`);
    return match[1](url, options);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// Renderiza la app con sus providers en la ruta indicada.
export function renderAt(path, routes) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <FiltersProvider>
          <Routes>
            {routes.map(([routePath, element]) => (
              <Route key={routePath} path={routePath} element={element} />
            ))}
          </Routes>
        </FiltersProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}
