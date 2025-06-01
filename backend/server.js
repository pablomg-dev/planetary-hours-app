// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const SunCalc = require('suncalc');
const { DateTime, Interval } = require('luxon'); // Importa DateTime e Interval de Luxon

const app = express();
// Define el puerto del servidor. Busca la variable PORT en .env o usa 5000 por defecto.
const port = process.env.PORT || 5000;

// MIDDLEWARES
// Habilita CORS para permitir solicitudes desde dominios diferentes (frontend)
app.use(cors());
// Parsea el cuerpo de las solicitudes entrantes con formato JSON
app.use(express.json());

// RUTA PRINCIPAL DE LA API para calcular las horas planetarias
app.get('/api/planetary-hours', (req, res) => {
    // Extrae los parámetros de la consulta (query parameters) de la URL
    const { date, lat, lon, timezone, cityName } = req.query;

    // Validación básica de los parámetros
    if (!date || !lat || !lon || !timezone) {
        return res.status(400).json({ error: 'Missing date, latitude, longitude, or timezone.' });
    }

    try {
        // Convierte la fecha ISO (YYYY-MM-DD) y la zona horaria a un objeto DateTime de Luxon
        // Esto es crucial para manejar correctamente las horas y el DST
        const targetDate = DateTime.fromISO(date, { zone: timezone });

        // Verifica si la fecha es válida
        if (!targetDate.isValid) {
            return res.status(400).json({ error: 'Invalid date or timezone provided.' });
        }

        // Calcula la fecha del día siguiente para obtener el amanecer del día siguiente
        const tomorrowDate = targetDate.plus({ days: 1 });

        // Obtiene los tiempos astronómicos para hoy y mañana usando SunCalc
        // SunCalc necesita un objeto Date de JS nativo y números para lat/lon
        const timesToday = SunCalc.getTimes(targetDate.toJSDate(), parseFloat(lat), parseFloat(lon));
        const timesTomorrow = SunCalc.getTimes(tomorrowDate.toJSDate(), parseFloat(lat), parseFloat(lon));

        // Convierte los objetos Date de SunCalc a DateTime de Luxon, aplicando la zona horaria
        const sunriseToday = DateTime.fromJSDate(timesToday.sunrise, { zone: timezone });
        const sunsetToday = DateTime.fromJSDate(timesToday.sunset, { zone: timezone });
        const sunriseTomorrow = DateTime.fromJSDate(timesTomorrow.sunrise, { zone: timezone });

        // Valida que los tiempos calculados sean válidos
        if (!sunriseToday.isValid || !sunsetToday.isValid || !sunriseTomorrow.isValid) {
            return res.status(500).json({ error: 'Could not calculate accurate sunrise/sunset times for this location/date. Check coordinates.' });
        }

        // Define el orden Caldeo de los planetas
        const planetaryOrder = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
        // Mapeo de días de la semana a sus regentes planetarios
        const daysOfWeekRulers = {
            1: 'Sun',      // Lunes (Luxon weekday 1) -> Domingo (nuestro día 0) -> Sol
            2: 'Moon',     // Martes (Luxon weekday 2) -> Lunes (nuestro día 1) -> Luna
            3: 'Mars',
            4: 'Mercury',
            5: 'Jupiter',
            6: 'Venus',
            7: 'Saturn'
        };
        // Para obtener el día de la semana, Luxon usa 1 (lunes) a 7 (domingo).
        // Adaptamos para que el regente del día sea correcto (Domingo: Sol, Lunes: Luna, etc.)
        const dayRuler = daysOfWeekRulers[(targetDate.weekday % 7) + 1]; // Ajuste para que 1=Domingo, 2=Lunes, etc.
        // O mapear el día de la semana de Luxon (1=Lunes) a la tradición caldea
        // Lunes(1)->Luna, Martes(2)->Marte, Miercoles(3)->Mercurio, Jueves(4)->Jupiter, Viernes(5)->Venus, Sabado(6)->Saturno, Domingo(7)->Sol
        const dayRulerCorrected = {
            1: 'Moon',     // Lunes
            2: 'Mars',     // Martes
            3: 'Mercury',  // Miércoles
            4: 'Jupiter',  // Jueves
            5: 'Venus',    // Viernes
            6: 'Saturn',   // Sábado
            7: 'Sun'       // Domingo
        }[targetDate.weekday];


        if (!dayRulerCorrected) {
             return res.status(500).json({ error: 'Could not determine day ruler based on weekday.' });
        }

        // Calcula la duración de las horas diurnas y nocturnas
        const dayInterval = Interval.fromDateTimes(sunriseToday, sunsetToday);
        const nightInterval = Interval.fromDateTimes(sunsetToday, sunriseTomorrow);

        // Asegúrate de que los intervalos sean válidos para evitar errores
        if (!dayInterval.isValid || !nightInterval.isValid) {
             return res.status(500).json({ error: 'Could not calculate valid day/night intervals. Check sunrise/sunset times.' });
        }


        const dayHourDurationMillis = dayInterval.length('milliseconds') / 12;
        const nightHourDurationMillis = nightInterval.length('milliseconds') / 12;

        const results = [];
        let currentHourTime;
        let currentPlanetIndex;

        // Determinar el planeta de la primera hora del día
        currentPlanetIndex = planetaryOrder.indexOf(dayRulerCorrected);
        currentHourTime = sunriseToday;

        // CALCULO DE HORAS DIURNAS (12 horas)
        for (let i = 0; i < 12; i++) {
            const nextHourTime = currentHourTime.plus({ milliseconds: dayHourDurationMillis });
            results.push({
                hour: i + 1,
                type: 'day',
                start: currentHourTime.toFormat('HH:mm:ss'),
                end: nextHourTime.toFormat('HH:mm:ss'),
                planet: planetaryOrder[currentPlanetIndex]
            });
            currentHourTime = nextHourTime;
            currentPlanetIndex = (currentPlanetIndex + 1) % planetaryOrder.length; // Avanza al siguiente planeta en el ciclo
        }

        // CALCULO DE HORAS NOCTURNAS (12 horas)
        // La primera hora nocturna es regida por el planeta que sigue al regente de la última hora diurna
        // currentPlanetIndex ya está en la posición correcta después del bucle diurno
        currentHourTime = sunsetToday; // Empieza la noche al atardecer

        for (let i = 0; i < 12; i++) {
            const nextHourTime = currentHourTime.plus({ milliseconds: nightHourDurationMillis });
            results.push({
                hour: i + 13, // Las horas nocturnas se numeran del 13 al 24
                type: 'night',
                start: currentHourTime.toFormat('HH:mm:ss'),
                end: nextHourTime.toFormat('HH:mm:ss'),
                planet: planetaryOrder[currentPlanetIndex]
            });
            currentHourTime = nextHourTime;
            currentPlanetIndex = (currentPlanetIndex + 1) % planetaryOrder.length; // Avanza al siguiente planeta en el ciclo
        }

        // Envía los resultados al frontend
        res.json({ 
            dayRuler: dayRulerCorrected, 
            hours: results, 
            timezone,
            city: cityName // opcional
        });

    } catch (error) {
        // Captura cualquier error durante el proceso y lo envía como respuesta 500
        console.error('Error calculating planetary hours:', error);
        res.status(500).json({ error: 'Internal server error during calculation. Please check inputs and server logs.' });
    }
});

// Inicia el servidor y lo pone a escuchar en el puerto especificado
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
