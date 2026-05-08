# BandUp Shop - Frontend

Frontend de la tienda BandUp construido con React + Vite, optimizado para despliegue en Vercel.

## 🚀 Despliegue en Vercel

### Requisitos previos
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com)

### Pasos para desplegar

1. **Crear repositorio en GitHub**
   - Ve a https://github.com/new
   - Nombre: `bandup-frontend`
   - Descripción: "Frontend de BandUp Shop - React + Vite"
   - Hazlo público o privado según prefieras

2. **Subir código a GitHub**
   ```bash
   git remote add origin https://github.com/TU_USUARIO/bandup-frontend.git
   git push -u origin main
   ```

3. **Conectar con Vercel**
   - Ve a https://vercel.com/new
   - Importa tu repositorio de GitHub
   - Configura el proyecto:
     - **Framework Preset**: Vite
     - **Root Directory**: `./` (raíz del proyecto)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

4. **Variables de entorno en Vercel**
   Agrega estas variables en el dashboard de Vercel (Project Settings > Environment Variables):

   ```
   VITE_API_URL=https://api-bandup.ygnaciomarts.com/api
   VITE_USE_MOCK=false
   ```

5. **Desplegar**
   - Haz clic en "Deploy"
   - Vercel detectará automáticamente que es un proyecto Vite
   - El sitio estará disponible en una URL como `https://bandup-frontend.vercel.app`

### Configuración de dominio personalizado (opcional)
En Vercel Dashboard:
- Settings > Domains
- Agrega tu dominio personalizado
- Configura los DNS según las instrucciones

## 🛠 Desarrollo local

### Instalación
```bash
npm install
```

### Ejecutar en desarrollo
```bash
npm run dev
```

### Build de producción
```bash
npm run build
```

### Preview del build
```bash
npm run preview
```

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL de la API backend
VITE_API_URL=https://api-bandup.ygnaciomarts.com/api

# Usar datos mock en desarrollo (true/false)
VITE_USE_MOCK=false
```

## 📁 Estructura del proyecto

```
src/
├── components/     # Componentes reutilizables
├── context/        # Contextos de React (Auth, Cart, etc.)
├── pages/          # Páginas de la aplicación
├── services/       # Servicios API y datos mock
├── styles/         # Estilos globales
└── theme.js        # Configuración de Material-UI
```

## 🔧 Tecnologías utilizadas

- **React 18** - Framework principal
- **Vite** - Build tool y dev server
- **Material-UI** - Componentes UI
- **React Router** - Routing
- **React Query** - Gestión de estado del servidor
- **Axios** - Cliente HTTP (a través de fetch nativo)

## 📦 Scripts disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Preview del build local
- `npm run lint` - Ejecuta linter (si configurado)

## 🔐 Autenticación

El frontend se conecta a una API REST que maneja:
- Registro de usuarios
- Login con JWT
- Perfiles de usuario
- Gestión de productos (admin)

## 🛒 Funcionalidades

- ✅ Catálogo de productos
- ✅ Búsqueda y filtros
- ✅ Carrito de compras
- ✅ Sistema de autenticación
- ✅ Panel de administración
- ✅ Responsive design
- ✅ PWA-ready

---

**Nota**: Este es solo el frontend. El backend API debe estar desplegado por separado.

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
