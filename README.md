# Sala Norte — Front-end

Interfaz para el usuario final del sistema de cine Sala Norte (TP 2 de Programación IV). Consume la API JSON del back-end Rails ([repositorio `cines`](../cines)).

- **Modalidad:** individual
- **Framework:** React 19 + Vite 8, React Router 7
- **Back-end:** Ruby on Rails 8.1 (TP 1, autor: Lautaro Cárdenas)

## Requisitos

- Node.js 20 o superior (probado con Node 24)
- El back-end corriendo en `http://localhost:3000` (ver su README)

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abrir http://localhost:5173.

El servidor de desarrollo de Vite reenvía las rutas `/api` y `/rails` al back-end (`vite.config.js`), así que no hace falta configurar CORS. Para usar otra URL del back-end, copiar `.env.example` a `.env` y modificar `VITE_BACKEND_URL`.

```bash
npm run build     # compila a dist/
npm run preview   # sirve la versión compilada
```

## Usuarios de prueba

Se crean con `bin/rails db:seed` en el back-end.

| Rol | Email | Contraseña |
|---|---|---|
| Cliente | maria@example.com | password123 |
| Cliente | juan@example.com | password123 |
| Admin (solo back-office) | admin@salanorte.com | password123 |

También se puede crear un cliente nuevo desde la pantalla **Registrate**.

## Estructura

```
src/
├── api/client.js          # fetch a la API: token, errores (ApiError), endpoints
├── auth/AuthContext.jsx   # sesión: login, registro, logout, token guardado
├── filters/               # día y sede elegidos (compartidos entre pantallas)
├── hooks/useApi.js        # estados de carga / error / datos + reintentar
├── components/            # Header, Poster, DayPicker, CinemaSelect, States, RequireAuth
├── pages/                 # Login, Register, Billboard, MovieDetail, SeatSelection, MyTickets
└── utils/format.js        # fechas, horas, moneda
```

Estado del desarrollo y alcance: ver [docs/CHECKPOINT.md](docs/CHECKPOINT.md).
