# BandUp Shop

Proyecto separado en dos partes:

## Estructura

```
├── api/              ← Backend PHP (API REST JSON)
├── frontend/         ← Frontend React + Vite (para Vercel)
└── [archivos legacy] ← Proyecto original (PHP monolítico)
```

---

## API (PHP Backend)

### Setup

1. Subir la carpeta `api/` a un hosting PHP (ej: tu hosting actual)
2. Configurar variables de entorno o editar `api/config/database.php`:
   - `DB_SERVER`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
3. Asegurarte de que `mod_rewrite` esté habilitado (Apache)

### Endpoints disponibles
Ver `api/README.md`

### Autenticación
Usa JWT Bearer tokens. El login devuelve un token que debe incluirse en:
```
Authorization: Bearer <token>
```

---

## Frontend (Vite + React → Vercel)

### Desarrollo local

```bash
cd frontend
npm install
npm run dev
```

### Variables de entorno

Crear `frontend/.env` para desarrollo local con la API real:
```
VITE_API_URL=https://api-bandup.ygnaciomarts.com/api
VITE_USE_MOCK=false
```

Para producción (en Vercel):
```
VITE_API_URL=https://tu-api.com/api
VITE_USE_MOCK=false
```

Si quieres seguir trabajando con datos de prueba, deja `VITE_USE_MOCK` sin configurar o ponlo en `true`.

### Deploy a Vercel

1. Conectar el repo a Vercel
2. Configurar:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Agregar variable de entorno `VITE_API_URL` con la URL de tu API

---

## API Development Server (PHP Built-in)

Para desarrollo local del API:
```bash
cd api
php -S localhost:8000
```

El proxy de Vite redirige `/api` a `localhost:8000` automáticamente en desarrollo.
