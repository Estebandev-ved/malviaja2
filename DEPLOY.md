# Guía de Deploy — Malviaja2

Stack: React + Vite (Vercel) + Spring Boot (Railway) + MySQL (Railway)

---

## Paso 1 — Repositorio GitHub

Si aún no tienes el repo en GitHub:

```bash
git init
git add .
git commit -m "initial commit"
gh repo create malviaja2 --private --push --source=.
```

---

## Paso 2 — Firebase Service Account

1. Abre [Firebase Console](https://console.firebase.google.com) → tu proyecto
2. Configuración del proyecto → **Cuentas de servicio**
3. Clic en **"Generar nueva clave privada"** → descarga el JSON
4. Renómbralo a `firebase-service-account.json`
5. Colócalo en `backend/src/main/resources/firebase-service-account.json`

> Este archivo está en `.gitignore`. NUNCA lo subas al repo.

---

## Paso 3 — Deploy del Backend en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión con GitHub
2. **New Project → Deploy from GitHub repo** → selecciona tu repo
3. En "Root Directory" escribe: `backend`
4. Railway detectará el Dockerfile automáticamente

### Agregar MySQL
1. En el proyecto Railway → **New → Database → MySQL**
2. Haz clic en la base de datos → **Variables** → copia `MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD`

### Variables de entorno del backend (Railway → Variables)

| Variable | Valor |
|---|---|
| `DB_URL` | `jdbc:mysql://<host>:<port>/<db>?useSSL=true&serverTimezone=UTC` |
| `DB_USERNAME` | (el usuario de Railway MySQL) |
| `DB_PASSWORD` | (la contraseña de Railway MySQL) |
| `TELEGRAM_BOT_USERNAME` | Nombre de tu bot |
| `TELEGRAM_BOT_TOKEN` | Token de @BotFather |
| `TELEGRAM_ADMIN_CHAT_ID` | Tu chat ID de Telegram |
| `CORS_ALLOWED_ORIGINS` | (déjalo vacío por ahora, lo completas en el Paso 4) |

5. Haz deploy y espera que el build termine (~3 minutos)
6. En **Settings → Domains** → genera un dominio público. Anótalo: `https://tu-backend.up.railway.app`

---

## Paso 4 — Deploy del Frontend en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. **New Project → Import** → selecciona tu repo
3. En **Root Directory** escribe: `frontend`
4. Framework: **Vite** (lo detecta automáticamente)
5. En **Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://tu-backend.up.railway.app` |

6. Clic en **Deploy**. Vercel te dará una URL: `https://malviaja2.vercel.app`

---

## Paso 5 — Conectar CORS

Ahora que tienes la URL de Vercel, vuelve a Railway y actualiza:

| Variable | Valor |
|---|---|
| `CORS_ALLOWED_ORIGINS` | `https://malviaja2.vercel.app` |

Railway hará redeploy automático.

---

## Paso 6 — Activar Firebase Auth para producción

En Firebase Console → **Authentication → Settings → Dominios autorizados**:
- Agrega: `malviaja2.vercel.app`

---

## Paso 7 — Primer Admin

Como el magic link fue eliminado por seguridad, el primer admin se asigna directamente en la base de datos.

En Railway → tu base MySQL → **Data** (o conéctate con un cliente MySQL):

```sql
UPDATE usuarios SET rol = 'ADMIN' WHERE firebase_uid = 'TU_UID_DE_FIREBASE';
```

Tu UID lo encuentras en Firebase Console → Authentication → Users.

---

## Verificación final

- [ ] Frontend carga en Vercel
- [ ] Login con Google funciona
- [ ] Catálogo de productos carga (GET `/api/productos`)
- [ ] Checkout envía pedido y llega notificación a Telegram
- [ ] Panel admin (`/admin`) visible solo con rol ADMIN
- [ ] Bot de Telegram responde a `/start`
