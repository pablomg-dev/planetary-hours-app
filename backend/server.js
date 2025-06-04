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
    const { date, lat, lon, timezone, cityName } = req.query;
    console.log('Received request with params:', { date, lat, lon, timezone, cityName });

    // Validación básica de los parámetros
    if (!date || !lat || !lon || !timezone) {
        return res.status(400).json({ error: 'Missing date, latitude, longitude, or timezone.' });
    }

    try {
        // Convierte la fecha ISO (YYYY-MM-DD) y la zona horaria a un objeto DateTime de Luxon
        const targetDate = DateTime.fromISO(date, { zone: timezone });
        console.log('Análisis detallado de fecha:', {
            fechaOriginal: date,
            zonaHoraria: timezone,
            fechaISO: targetDate.toISO(),
            fechaUTC: targetDate.toUTC().toISO(),
            offset: targetDate.offset,
            weekday: targetDate.weekday,
            weekdayUTC: targetDate.toUTC().weekday,
            hora: targetDate.toFormat('HH:mm:ss'),
            horaUTC: targetDate.toUTC().toFormat('HH:mm:ss')
        });

        // Verifica si la fecha es válida
        if (!targetDate.isValid) {
            return res.status(400).json({ error: 'Invalid date or timezone provided.' });
        }

        // Calcula la fecha del día siguiente para obtener el amanecer del día siguiente
        const tomorrowDate = targetDate.plus({ days: 1 });

        // Obtiene los tiempos astronómicos para hoy y mañana usando SunCalc
        const timesToday = SunCalc.getTimes(targetDate.toJSDate(), parseFloat(lat), parseFloat(lon));
        const timesTomorrow = SunCalc.getTimes(tomorrowDate.toJSDate(), parseFloat(lat), parseFloat(lon));

        // Convierte los tiempos a la zona horaria especificada
        const sunriseToday = DateTime.fromJSDate(timesToday.sunrise).setZone(timezone);
        const sunsetToday = DateTime.fromJSDate(timesToday.sunset).setZone(timezone);
        const sunriseTomorrow = DateTime.fromJSDate(timesTomorrow.sunrise).setZone(timezone);

        console.log('Calculated times in timezone:', {
            sunrise: sunriseToday.toISO(),
            sunset: sunsetToday.toISO(),
            nextSunrise: sunriseTomorrow.toISO()
        });

        // Define el orden Caldeo de los planetas
        const planetaryOrder = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

        // Mapeo de días de la semana según Luxon y el sistema tradicional
        // Luxon: 1 = Lunes ... 7 = Domingo
        const dayRulerMap = new Map([
            [7, 'Sun'],     // Domingo
            [1, 'Moon'],    // Lunes
            [2, 'Mars'],    // Martes
            [3, 'Mercury'], // Miércoles
            [4, 'Jupiter'], // Jueves
            [5, 'Venus'],   // Viernes
            [6, 'Saturn']   // Sábado
        ]);

        // Usar directamente la fecha objetivo para el regente
        const weekday = targetDate.weekday;
        const dayRuler = dayRulerMap.get(weekday);
        
        console.log('Debug - Cálculo de regente:', {
            fechaConsultada: targetDate.toFormat('yyyy-MM-dd'),
            diaSemana: weekday,
            nombreDia: targetDate.toFormat('EEEE'),
            nombreDiaLocal: targetDate.setLocale('es').toFormat('EEEE'),
            regente: dayRuler,
            weekInfo: {
                weekday: targetDate.weekday,
                weekdayLong: targetDate.weekdayLong,
                weekdayShort: targetDate.weekdayShort
            }
        });

        if (!dayRuler) {
            console.error('Error en cálculo de regente:', {
                weekday: weekday,
                availableRulers: Array.from(dayRulerMap.keys()),
                fecha: targetDate.toFormat('yyyy-MM-dd')
            });
            return res.status(500).json({ 
                error: `Could not determine day ruler. Invalid weekday: ${weekday} for date: ${targetDate.toFormat('yyyy-MM-dd')}` 
            });
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
        currentPlanetIndex = planetaryOrder.indexOf(dayRuler);
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
            currentPlanetIndex = (currentPlanetIndex + 1) % planetaryOrder.length;
        }

        // CALCULO DE HORAS NOCTURNAS (12 horas)
        currentHourTime = sunsetToday;

        for (let i = 0; i < 12; i++) {
            const nextHourTime = currentHourTime.plus({ milliseconds: nightHourDurationMillis });
            results.push({
                hour: i + 13,
                type: 'night',
                start: currentHourTime.toFormat('HH:mm:ss'),
                end: nextHourTime.toFormat('HH:mm:ss'),
                planet: planetaryOrder[currentPlanetIndex]
            });
            currentHourTime = nextHourTime;
            currentPlanetIndex = (currentPlanetIndex + 1) % planetaryOrder.length;
        }

        // Envía los resultados al frontend
        res.json({ 
            dayRuler: dayRuler,
            nextDayRuler: dayRulerMap.get(targetDate.plus({ days: 1 }).weekday),
            hours: results, 
            timezone,
            city: cityName,
            currentPlanetaryDay: {
                start: sunriseToday.toFormat('HH:mm:ss'),
                end: sunriseTomorrow.toFormat('HH:mm:ss'),
                isBeforeSunrise: false // Ya no usamos la hora actual
            }
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
