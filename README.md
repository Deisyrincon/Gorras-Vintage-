# Gorras Vintage

Sitio web comercial de gorras estilo vintage y streetwear, con catálogo, carrito, integración de pagos con Wompi y contacto directo por WhatsApp.

## Tecnologías
- HTML5
- CSS3
- JavaScript vanilla
- Node.js + Express para la API de Wompi

## Requisitos
- Node.js 18 o superior
- NPM

## Instalación local
1. Entra a la carpeta backend e instala dependencias:
   cd backend
   npm install
2. Inicia el backend:
   npm start
3. En otra terminal, desde la raíz del proyecto, sirve el frontend:
   python3 -m http.server 8000
4. Abre la página principal en el navegador:
   http://localhost:8000
5. La API del backend quedará disponible en:
   http://localhost:3000

## Configuración para Wompi
1. Crea un archivo .env dentro de la carpeta backend con las siguientes variables:
   WOMPI_PUBLIC_KEY=tu_public_key
   WOMPI_INTEGRITY_SECRET=tu_secret_integrity
   WOMPI_EVENTS_SECRET=tu_secret_events
   PORT=3000
2. Usa tu backend desplegado en Render o cualquier hosting compatible con Node.js.

## Publicación
### Opción 1: GitHub Pages para el front
- Sube la carpeta raíz a GitHub.
- Activa GitHub Pages desde la rama principal.
- Reemplaza la URL de la API del backend en js/script.js por la URL pública final.

### Opción 2: Netlify o Vercel
- Conecta el repositorio.
- Publica la carpeta raíz como sitio estático.
- Configura la variable de entorno del backend o la URL real del servicio para pagos.

### Opción 3: Render para backend
- Crea un servicio web en Render.
- Selecciona la carpeta backend.
- Añade las variables de entorno de Wompi.
- Usa la URL pública del backend en la constante API_URL del frontend.

## Personalización rápida
- Cambia el número de WhatsApp en el archivo js/script.js.
- Actualiza enlaces de Instagram y Facebook en index.html.
- Ajusta nombre, colores y texto de la marca en index.html y css/style.css.

## Estructura del proyecto
- index.html: contenido y secciones del sitio
- css/style.css: estilos y responsive
- js/script.js: filtros, carrito, WhatsApp y Wompi
- backend/server.js: API para pagos con Wompi

## Sugerencia de entrega
- Mantén la página en un único landing page para una mejor experiencia móvil.
- Verifica la apariencia en celular antes de entregar.
- Confirma el número real de WhatsApp y links sociales antes de publicar.
### Opción 2: Netlify o Vercel
- Conecta el repositorio.
- Publica la carpeta raíz como sitio estático.
- Si usas un backend separado, configura la URL del API en el archivo JavaScript.

### Opción 3: Render para backend
- Crea un servicio web en Render.
- Selecciona la carpeta backend.
- Añade las variables de entorno de Wompi.
- Usa la URL pública del backend en la constante API_URL del frontend.

## Personalización rápida
- Cambia el número de WhatsApp en el archivo js/script.js.
- Actualiza enlaces de Instagram y Facebook en index.html.
- Ajusta nombre, colores y texto de la marca en index.html y css/style.css.

## Estructura del proyecto
- index.html: contenido y secciones del sitio
- css/style.css: estilos y responsive
- js/script.js: filtros, carrito, WhatsApp y Wompi
- backend/server.js: API para pagos con Wompi

## Sugerencia de entrega
- Mantén la página en un único landing page para una mejor experiencia móvil.
- Verifica la apariencia en celular antes de entregar.
- Confirma el número real de WhatsApp y links sociales antes de publicar.