# Deploy en Render + Neon

- **Back-end (Rails):** Render, servicio web gratis.
- **Base de datos:** PostgreSQL en [Neon](https://neon.tech), gratis.
- **Front-end (React):** Render, sitio estático gratis.

Los dos repos ya tienen un `render.yaml` con la configuración. Solo hay que crear las cuentas, conectar los repos y completar algunas variables.

> Los nombres de los servicios (`sala-norte-api`, `sala-norte-front`) pueden estar ocupados en Render. En ese caso Render les agrega un sufijo a la URL: usá siempre la URL que te muestra Render.

## 1. Base de datos en Neon

1. Entrá a https://neon.tech y creá una cuenta (se puede con GitHub).
2. **Create project**:
   - Name: `sala-norte`
   - Postgres version: la que venga por defecto
   - Region: la más cercana, por ejemplo **AWS São Paulo (sa-east-1)**
3. En el panel del proyecto, hacé clic en **Connect**:
   - **Desactivá "Connection pooling"**, para usar la conexión directa.
   - Copiá la **connection string**. Tiene esta forma:
     `postgresql://neondb_owner:XXXX@ep-algo-123456.sa-east-1.aws.neon.tech/neondb?sslmode=require`
4. Guardala; la vas a pegar en Render. **No la subas al repo:** tiene la contraseña.

## 2. Back-end en Render

1. Entrá a https://render.com y creá una cuenta **con GitHub**.
2. **New → Blueprint**, elegí el repo `Entradas_cines` (rama `main`).
3. Render lee el `render.yaml` y te pide las variables marcadas para completar:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | la connection string de Neon |
   | `FRONTEND_ORIGINS` | por ahora `https://sala-norte-front.onrender.com` (en el paso 4 la corregís) |
   | `APP_HOST` | `sala-norte-api.onrender.com` (o el dominio que te asigne Render) |

4. **Apply / Deploy Blueprint.** El primer deploy tarda unos minutos: instala las gemas, crea las tablas en Neon y carga los datos de prueba.
5. Cuando diga **Live**, probá:
   - `https://TU-API.onrender.com/up` → página verde
   - `https://TU-API.onrender.com/api/v1/movies` → JSON con películas
   - `https://TU-API.onrender.com/admin` → login del back-office (`admin@salanorte.com` / `password123`)

## 3. Front-end en Render

1. En Render: **New → Blueprint**, elegí el repo `sala-norte-frontend` (rama `main`).
2. Completá la variable:

   | Variable | Valor |
   |---|---|
   | `VITE_API_URL` | `https://TU-API.onrender.com/api/v1` |

3. **Apply / Deploy Blueprint.** Tarda uno o dos minutos.
4. Copiá la URL del sitio, por ejemplo `https://sala-norte-front.onrender.com`.

## 4. Habilitar el front en el back (CORS)

1. En Render, abrí el servicio **sala-norte-api → Environment**.
2. Poné en `FRONTEND_ORIGINS` la URL **exacta** del front, sin `/` al final. Ejemplo: `https://sala-norte-front.onrender.com`.
3. **Save Changes.** El back se vuelve a publicar solo.

## 5. Probar

1. Abrí la URL del front. La primera vez puede tardar alrededor de un minuto si el back estaba dormido.
2. Iniciá sesión con `maria@example.com` / `password123` y comprá una entrada.
3. Completá las URLs en la sección **Deploy** del README del front y hacé commit.

## Problemas comunes

| Síntoma | Causa y solución |
|---|---|
| En el front: "No se pudo conectar con el servidor" | Lo más probable es CORS: revisá que `FRONTEND_ORIGINS` sea exactamente la URL del front, con `https://` y sin `/` al final. También puede ser que `VITE_API_URL` esté mal. Si cambiás `VITE_API_URL`, hay que volver a publicar el front (**Manual Deploy**). |
| Al recargar una página del front aparece "Not Found" | Falta la regla de reescritura. Ya está en el `render.yaml`; si creaste el sitio a mano, agregá en **Redirects/Rewrites**: `/*` → `/index.html` (Rewrite). |
| El build del back falla en `db:prepare` | La `DATABASE_URL` está mal copiada o tiene el pooler activado. Copiala de nuevo desde Neon, sin pooling. |
| La primera carga tarda mucho | Es normal en el plan gratis: el servidor se duerme a los 15 minutos sin uso. |
| No hay funciones en la cartelera | Las funciones de prueba se crean al arrancar el servidor (hoy y los dos días siguientes). Reiniciá el servicio desde Render (**Manual Deploy → Restart service**). |
