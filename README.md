# Calculadora de Horas Planetarias 🌍⏰

Una aplicación web para calcular las horas planetarias tradicionales (caldeas) basadas en la ubicación y fecha del usuario.

## ✨ Características

- ⚡ Cálculo automático de horas planetarias basado en salida y puesta del sol
- 📍 Detección automática de ubicación del usuario
- 🔍 Búsqueda de ciudades con autocompletado
- 🌓 Modo claro/oscuro
- ⏰ Visualización de hora actual
- ♄ Símbolos planetarios tradicionales
- 📱 Interfaz responsiva
- 🌐 Soporte multiidioma (nombres de planetas en español)

## 🛠️ Tecnologías

### Frontend
- React
- Bootstrap 5
- React Bootstrap
- Luxon (manejo de fechas y zonas horarias)
- React-Select (búsqueda de ciudades)
- React-DatePicker
- Axios

### Backend
- Node.js
- Express
- SunCalc (cálculos astronómicos)
- Luxon
- CORS
- dotenv

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/your-username/planetary-hours-app.git
cd planetary-hours-app
```

2. Instala las dependencias del backend:
```bash
cd backend
npm install
```

3. Instala las dependencias del frontend:
```bash
cd ../frontend
npm install
```

## ⚙️ Configuración

1. Crea un archivo `.env` en la carpeta `backend`:
```env
PORT=5000
```

2. Asegúrate de que el frontend esté configurado para conectarse al backend:
```javascript
// frontend/src/config.js
export const API_URL = 'http://localhost:5000';
```

## 🚀 Uso

1. Inicia el backend:
```bash
cd backend
npm start
```

2. Inicia el frontend:
```bash
cd frontend
npm run dev
```

3. Abre tu navegador en `http://localhost:5173`

## 📝 Características planeadas

- [ ] Soporte para más idiomas
- [ ] Gráficos de los aspectos planetarios
- [ ] Exportación de datos a PDF/CSV
- [ ] PWA para uso offline
- [ ] Widget para sitios web

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📄 Licencia

[ISC](https://choosealicense.com/licenses/isc/)

## 👤 Autor

Pablo MG