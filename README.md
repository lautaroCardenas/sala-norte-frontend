# Sala Norte — Boletería de cine

Trabajo Práctico N.º 2 de Programación IV: integración de back-end y front-end.

Sala Norte es la boletería online de una cadena de cines. El cliente consulta la cartelera por día y sede, elige una función, selecciona sus asientos en el mapa de la sala, compra las entradas y las ve en "Mis entradas". El administrador gestiona sedes, salas, películas, funciones, compras y usuarios desde el back-office de Rails.

| | |
|---|---|
| **Integrantes** | Lautaro Cárdenas |
| **Modalidad** | Individual |
| **Autor del back-end original** | Lautaro Cárdenas (TP 1) |
| **Framework del front-end** | React 19 + Vite 8 + React Router 7 |
| **Repositorio back-end** | https://github.com/lautaroCardenas/Entradas_cines |
| **Repositorio front-end** | https://github.com/lautaroCardenas/sala-norte-frontend |

## Deploy

| | URL |
|---|---|
| Front-end | _(completar al publicar)_ |
| Back-end / API | _(completar al publicar)_ |
| Back-office | _(URL del back-end)_`/admin` |

El back-end usa el plan gratis de Render: si no recibió visitas en los últimos 15 minutos, la primera carga puede tardar alrededor de un minuto mientras el servidor arranca. Los pasos para publicar están en [docs/DEPLOY.md](docs/DEPLOY.md).

## Funcionalidades del front-end

- **Cuenta:** registro, inicio de sesión (con "Mantener sesión iniciada") y cierre de sesión.
- **Cartelera:** películas con funciones el día elegido (Hoy, Mañana…) y en la sede elegida. También hay una sección de próximos estrenos.
- **Película:** datos, sinopsis y horarios agrupados por formato e idioma. Los horarios agotados aparecen tachados.
- **Compra:**
  1. Mapa de asientos con disponibles, ocupados, seleccionados y de movilidad reducida, hasta 10 por compra.
  2. Resumen con el total y el cargo por servicio.
  3. Confirmación con pago **simulado**.
- **Mis entradas:** listado de compras y detalle con los códigos de entrada. Se pueden pagar las compras pendientes y cancelar una compra antes de que empiece la función.
- **Experiencia de usuario:**
  - estados de carga, error con **Reintentar** y sin resultados
  - validación de formularios y errores de la API mostrados en pantalla
  - botones deshabilitados durante los envíos, para evitar envíos repetidos
  - navegación por teclado y diseño adaptable a pantallas chicas

## Requisitos

| Herramienta | Versión usada |
|---|---|
| Ruby | 3.3.12 |
| Rails | 8.1 |
| SQLite | 3 (desarrollo) |
| Node.js | 24 (funciona con 20 o superior) |
| npm | 11 |

## Instalación y ejecución local

Se necesitan **dos terminales**, una para cada proyecto. Primero el back-end y después el front-end.

### 1. Back-end (Rails)

```bash
git clone https://github.com/lautaroCardenas/Entradas_cines.git cines
cd cines
bundle install
bin/rails db:setup        # crea la base SQLite, carga el esquema y los datos de prueba
bin/rails server          # http://localhost:3000
```

Las funciones de prueba se crean para el día en que se corren los seeds y los dos siguientes. Para regenerarlas: `bin/rails db:seed:replant`.

### 2. Front-end (React)

```bash
git clone https://github.com/lautaroCardenas/sala-norte-frontend.git frontend
cd frontend
npm install
npm run dev               # http://localhost:5173
```

En desarrollo, Vite reenvía `/api` y `/rails` al back-end en `localhost:3000` (ver `vite.config.js`), así que no hace falta configurar nada más.

### Variables de entorno (sin secretos)

Front-end, archivo `.env` (opcional; ver `.env.example`):

```bash
VITE_BACKEND_URL=http://localhost:3000            # a dónde reenvía el proxy de Vite en desarrollo
# VITE_API_URL=https://mi-api.onrender.com/api/v1 # URL de la API al compilar para producción
```

Back-end (solo en producción):

```bash
DATABASE_URL=postgresql://usuario:clave@host/base?sslmode=require
SECRET_KEY_BASE=...                                # lo genera Render
FRONTEND_ORIGINS=https://mi-front.onrender.com     # orígenes habilitados por CORS
APP_HOST=mi-api.onrender.com
```

## Datos de prueba y credenciales de demostración

Se crean con `bin/rails db:seed` (local) y automáticamente en el deploy.

| Rol | Email | Contraseña | Dónde se usa |
|---|---|---|---|
| Administrador | admin@salanorte.com | password123 | Back-office (`/admin`) |
| Cliente | maria@example.com | password123 | Front-end |
| Cliente | juan@example.com | password123 | Front-end |
| Cliente | lucia@example.com | password123 | Front-end |

También se puede crear un cliente nuevo desde **Registrate** en el front-end. Para crear otro administrador: desde el back-office, en **Usuarios → Nuevo usuario**, con rol "Administrador".

Son cuentas de demostración, no de personas reales.

## Pruebas y controles de calidad

Back-end (desde `cines/`):

```bash
bin/rails test     # 39 tests: modelos, back-office y API
bin/rubocop        # estilo (0 ofensas)
bin/brakeman       # seguridad (0 advertencias)
```

Front-end (desde `frontend/`):

```bash
npm test           # 10 tests con Vitest + Testing Library
npm run build      # compilación de producción en dist/
```

Los tests del front simulan las respuestas de la API (lo permite el enunciado). Cubren:
- login correcto, credenciales incorrectas y validación del formulario
- cartelera con datos, error de conexión con reintento y "sin funciones"
- compra completa (asientos → pago → detalle) y asientos ya vendidos (422)
- cancelación de una compra y error al cancelar

### Advertencias y excepciones justificadas

- **Rubocop y Brakeman:** sin advertencias ni reglas ignoradas.
- **Brakeman:** `bin/brakeman` exige la última versión de la gema. Si aparece "Brakeman X is not the latest version", correr `bundle update brakeman`.
- **libvips:** al arrancar en producción puede aparecer "Using vips to process variants requires the libvips library". No afecta, porque la app no genera versiones redimensionadas de las imágenes.
- **Pago:** es simulado. Se crea la compra (`POST /orders`) y después se marca como pagada (`PATCH /orders/:id/pay`). No se piden datos de tarjeta.
- **Deploy:**
  - Los mails no se envían: quedan registrados en el log. En local se ven en http://localhost:3000/rails/mailers.
  - Los pósters subidos se guardan en el disco temporal de Render y se pierden cuando el servidor se reinicia. Las películas sin póster muestran un recuadro con el título.

## Integración back-end ↔ front-end

- **API:** el back expone una API JSON en `/api/v1`, separada del back-office. La tabla de endpoints está en el [README del back-end](https://github.com/lautaroCardenas/Entradas_cines#api-apiv1).
- **Autenticación:** `POST /api/v1/login` devuelve un token. El front lo guarda (`localStorage` si se marca "Mantener sesión iniciada"; si no, `sessionStorage`) y lo envía como `Authorization: Bearer <token>`. Si la API responde `401`, el front cierra la sesión.
- **Errores:** todas las respuestas de error tienen el formato `{ "error": "...", "details": [...] }`. El front las convierte en mensajes en pantalla.
- **Conexión:** en desarrollo, el proxy de Vite. En producción, el front llama a la URL de `VITE_API_URL` y Rails habilita ese origen con CORS (`rack-cors`, variable `FRONTEND_ORIGINS`).

## Cambios en el back-end para el TP 2

- `GET /api/v1/movies` acepta los filtros `date` (AAAA-MM-DD) y `cinema_id`.
- CORS para el front-end (`rack-cors`).
- El cliente solo puede cancelar una compra antes de que empiece la función; el administrador puede cancelar siempre. El JSON de la compra informa si es cancelable (`cancellable`).
- Configuración de producción con PostgreSQL (Neon) para el deploy en Render.

## Estructura del front-end

```
src/
├── api/client.js          # llamadas a la API: token, errores (ApiError), endpoints
├── auth/AuthContext.jsx   # sesión: login, registro, logout, token guardado
├── filters/               # día y sede elegidos (compartidos entre pantallas)
├── hooks/useApi.js        # estados de carga / error / datos + reintentar
├── components/            # Header, SeatMap, Poster, DayPicker, CinemaSelect, States, RequireAuth
├── pages/                 # Login, Register, Billboard, MovieDetail, SeatSelection, MyTickets, OrderDetail
├── test/                  # configuración y helpers de los tests
└── utils/format.js        # fechas, horas y moneda
```

El estado presentado en el checkpoint está en [docs/CHECKPOINT.md](docs/CHECKPOINT.md).
