# Checkpoint TP 2 — Sala Norte

## Proyecto

- **Temática:** boletería de una cadena de cines. El cliente consulta la cartelera, elige función y asientos, compra entradas y las ve en "Mis entradas".
- **Modalidad:** individual. Uso mi propio back-end del TP 1.
- **Front-end:** React + Vite, en un repositorio separado del back-end.
- **Contextos:** el back-office de Rails (`/admin`) sigue funcionando para el administrador. El nuevo front es solo para el cliente.

## Alcance previsto

| Caso de uso | Pantalla | Endpoints | Estado |
|---|---|---|---|
| Iniciar sesión | `/login` | `POST /login`, `GET /profile` | ✅ Hecho |
| Registrarse | `/registro` | `POST /users` | ✅ Hecho |
| Cerrar sesión | menú del usuario | `DELETE /logout` | ✅ Hecho |
| Ver cartelera por día y sede | `/` | `GET /movies?date=&cinema_id=`, `GET /cinemas` | ✅ Hecho |
| Ver próximos estrenos | `/proximamente` | `GET /movies?status=coming_soon` | ✅ Hecho |
| Ver película y elegir función | `/peliculas/:id` | `GET /movies/:id?date=&cinema_id=` | ✅ Hecho |
| Ver mis compras | `/mis-entradas` | `GET /orders` | ✅ Hecho |
| Elegir asientos en el mapa | `/funciones/:id` | `GET /screenings/:id` | 🟡 Pantalla iniciada, falta el mapa |
| Comprar y pagar | `/funciones/:id` → pago | `POST /orders`, `PATCH /orders/:id/pay` | ⏳ Pendiente |
| Cancelar una compra | `/mis-entradas` | `PATCH /orders/:id/cancel` | ⏳ Pendiente |
| Ver detalle de compra con códigos | `/mis-entradas/:id` | `GET /orders/:id` | ⏳ Pendiente |

## Navegación

```
/login ──────┐                 ┌── /proximamente
/registro ───┤                 │
             ▼                 │
        / (Cartelera) ─────────┼── /mis-entradas  (requiere sesión)
             │
             ▼
     /peliculas/:id  (elegir día y horario)
             │
             ▼
     /funciones/:id  (asientos → pago)  (requiere sesión)
```

- La cartelera y el detalle de película son **públicos**. Para comprar o ver "Mis entradas" se pide sesión, y después del login se vuelve a la página donde estaba el usuario.
- El día ("Hoy, Mañana, Vie…") y la sede se eligen en la cartelera y se mantienen al entrar a una película.

## Integración con la API

- **Autenticación:** `POST /api/v1/login` devuelve un `token`. Se envía en cada request protegida como `Authorization: Bearer <token>`.
  - Con "Mantener sesión iniciada" el token se guarda en `localStorage`. Sin esa opción, en `sessionStorage` (se borra al cerrar la pestaña).
  - Al abrir la app, el token se valida con `GET /profile`. Si la API responde `401`, se cierra la sesión.
- **Errores:** `api/client.js` convierte toda respuesta de error en un `ApiError` con el mensaje y los `details` de validación. Las pantallas los muestran: error de login, errores de validación del registro y "No se pudo conectar con el servidor".
- **Estados de interfaz:** cada pantalla muestra carga, error con botón **Reintentar** y "sin resultados".
- **Formularios:** se validan antes de enviar con las mismas reglas que el back (email válido, contraseña de 8 caracteres o más, confirmación). El botón queda deshabilitado mientras se envía, para evitar envíos repetidos.
- **Desarrollo:** el proxy de Vite reenvía `/api` a Rails, así el navegador ve un único origen.

## Cambios en el back-end para el TP 2

- `GET /api/v1/movies` acepta `date` (AAAA-MM-DD) y `cinema_id`: devuelve solo las películas con funciones ese día o en esa sede. Devuelve `400` si la fecha es inválida. Tiene test.
- Corrección de una línea suelta en una vista del back-office.

- CORS con `rack-cors` para `/api/*`. Se habilitan los orígenes de la variable `FRONTEND_ORIGINS` (por defecto, el front en `localhost:5173`). Tiene test.

### Pendientes del back-end

- Documentación del contrato de la API (campos, validaciones, errores y ejemplos por endpoint).

## Tests

- **Back-end:** 36 tests (modelos, back-office y API). Rubocop y Brakeman sin advertencias.
- **Front-end:** 6 tests con Vitest y Testing Library (`npm test`):
  - login correcto, login con error de la API y validación del formulario
  - cartelera con datos, error de conexión con reintento y "sin funciones"

## Próximos pasos (hasta el 11/11)

1. Mapa de asientos interactivo: disponibles, ocupados, seleccionados y movilidad reducida, con un máximo de 10.
2. Resumen y pago: crear la compra y pagarla, con confirmación y manejo de "asiento ocupado" (422).
3. Detalle de compra con códigos de entrada, y cancelación.
4. Tests de la compra, incluido el caso de asiento ocupado.
5. Contrato de la API en Markdown y README principal.
