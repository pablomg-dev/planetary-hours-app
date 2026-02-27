# Calculadora de Horas Planetarias �🌑

Una aplicación web moderna y profesional para calcular las horas planetarias tradicionales (caldeas) basadas en la ubicación astronómica y fecha del usuario. Refactorizada integralmente para ofrecer máxima solidez técnica y una experiencia de usuario premium.

## ✨ Características Principales

- **⚡ Arquitectura SOLID**: Backend desacoplado con servicios especializados para cálculos y geolocalización.
- **🛡️ Full TypeScript**: Tipado estricto en todo el flujo de datos para prevenir errores en tiempo de ejecución.
- **🎨 Diseño Premium**: Interfaz mística con estética *glass-morphism*, modo oscuro profundo y tipografías optimizadas (`Outfit` e `Inter`).
- **🌍 Geolocalización Avanzada**: Detección automática y buscador de ciudades mediante un proxy seguro para evitar errores de CORS.
- **⏰ Tiempo Real**: Reloj dinámico sincronizado con la zona horaria seleccionada.
- **♄ Simbolismo Tradicional**: Uso de glifos astronómicos y nombres tradicionales en español.

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **Vite** (TypeScript)
- **Bootstrap 5** & **React Bootstrap**
- **Custom Hooks** para lógica de estado (`useClock`, `useGeolocation`)
- **Luxon** (Gestión de zonas horarias complejas)
- **React-Select** & **React-DatePicker** (UI refinada)

### Backend
- **Node.js** + **Express** (TypeScript)
- **tsx** (Ejecutor moderno de TS con soporte ESM)
- **SunCalc** (Algoritmos astronómicos de precisión)
- **CORS** & **Dotenv**
- **Proxy Nominatim**: Búsqueda de ciudades segura con cumplimiento de políticas de User-Agent.

## 📦 Instalación y Despliegue

### Requisitos Previos
- Node.js (v18 o superior recomendado)
- npm o yarn

### Configuración del Repositorio
```bash
git clone https://github.com/your-username/planetary-hours-app.git
cd planetary-hours-app
```

### Backend Setup
1. Accede a la carpeta: `cd backend`
2. Instala dependencias: `npm install`
3. Configura el entorno: Crea un `.env` con `PORT=5000`
4. Ejecución:
   - Desarrollo: `npm run dev` (Hot reloading con tsx)
   - Producción: `npm run build && npm start`

### Frontend Setup
1. Accede a la carpeta: `cd frontend`
2. Instala dependencias: `npm install`
3. Ejecución:
   - Desarrollo: `npm run dev`
   - Producción: `npm run build`

## 🚀 Uso de la Aplicación

1. Asegúrate de que el **Backend** esté corriendo en `http://localhost:5000`.
2. Inicia el **Frontend** y ábrelo en `http://localhost:5173`.
3. Permite el acceso a la ubicación para carga automática o usa el buscador manual para cualquier ciudad del mundo.
4. Explora la tabla de regentes diurnos y nocturnos con el indicador de hora actual ⚡.

---
**Desarrollado con ❤️ por Pablo MG**