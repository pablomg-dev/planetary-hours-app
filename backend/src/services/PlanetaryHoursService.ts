import SunCalc from 'suncalc';
import { DateTime, Interval } from 'luxon';
import type { PlanetaryHour, PlanetaryHoursParams, PlanetaryHoursResponse } from '../interfaces/PlanetaryHours.js';

export class PlanetaryHoursService {
    private readonly planetaryOrder = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
    private readonly dayRulerMap: Record<number, string> = {
        7: 'Sun',     // Domingo
        1: 'Moon',    // Lunes
        2: 'Mars',    // Martes
        3: 'Mercury', // Miércoles
        4: 'Jupiter', // Jueves
        5: 'Venus',   // Viernes
        6: 'Saturn'   // Sábado
    };

    /**
     * Calcula las horas planetarias para una fecha y ubicación dadas.
     * Aplica la lógica tradicional caldea dividiendo el día y la noche en 12 horas cada uno.
     */
    public calculateHours(params: PlanetaryHoursParams): PlanetaryHoursResponse {
        const { date, lat, lon, timezone, cityName } = params;
        const targetDate = DateTime.fromISO(date, { zone: timezone });

        if (!targetDate.isValid) {
            throw new Error('Invalid date or timezone provided.');
        }

        const tomorrowDate = targetDate.plus({ days: 1 });
        const timesToday = SunCalc.getTimes(targetDate.toJSDate(), parseFloat(lat), parseFloat(lon));
        const timesTomorrow = SunCalc.getTimes(tomorrowDate.toJSDate(), parseFloat(lat), parseFloat(lon));

        const sunriseToday = DateTime.fromJSDate(timesToday.sunrise).setZone(timezone);
        const sunsetToday = DateTime.fromJSDate(timesToday.sunset).setZone(timezone);
        const sunriseTomorrow = DateTime.fromJSDate(timesTomorrow.sunrise).setZone(timezone);

        const weekday = sunriseToday.weekday;
        const dayRuler = this.dayRulerMap[weekday];

        if (!dayRuler) {
            throw new Error(`Could not determine day ruler for weekday: ${weekday}`);
        }

        const dayInterval = Interval.fromDateTimes(sunriseToday, sunsetToday);
        const nightInterval = Interval.fromDateTimes(sunsetToday, sunriseTomorrow);

        if (!dayInterval.isValid || !nightInterval.isValid) {
            throw new Error('Could not calculate valid day/night intervals. Check sunrise/sunset times.');
        }

        const dayHourDurationMillis = dayInterval.length('milliseconds') / 12;
        const nightHourDurationMillis = nightInterval.length('milliseconds') / 12;

        const hours: PlanetaryHour[] = [];
        let currentPlanetIndex = this.planetaryOrder.indexOf(dayRuler);

        // Cálculo de horas diurnas
        let currentHourTime = sunriseToday;
        for (let i = 0; i < 12; i++) {
            const nextHourTime = currentHourTime.plus({ milliseconds: dayHourDurationMillis });
            hours.push({
                hour: i + 1,
                type: 'day',
                start: currentHourTime.toFormat('HH:mm:ss'),
                end: nextHourTime.toFormat('HH:mm:ss'),
                planet: this.planetaryOrder[currentPlanetIndex]
            });
            currentHourTime = nextHourTime;
            currentPlanetIndex = (currentPlanetIndex + 1) % this.planetaryOrder.length;
        }

        // Cálculo de horas nocturnas
        currentHourTime = sunsetToday;
        for (let i = 0; i < 12; i++) {
            const nextHourTime = currentHourTime.plus({ milliseconds: nightHourDurationMillis });
            hours.push({
                hour: i + 13,
                type: 'night',
                start: currentHourTime.toFormat('HH:mm:ss'),
                end: nextHourTime.toFormat('HH:mm:ss'),
                planet: this.planetaryOrder[currentPlanetIndex]
            });
            currentHourTime = nextHourTime;
            currentPlanetIndex = (currentPlanetIndex + 1) % this.planetaryOrder.length;
        }

        const nextDayRuler = this.dayRulerMap[tomorrowDate.weekday];

        return {
            dayRuler,
            nextDayRuler,
            hours,
            timezone,
            city: cityName,
            currentPlanetaryDay: {
                start: sunriseToday.toFormat('HH:mm:ss'),
                end: sunriseTomorrow.toFormat('HH:mm:ss'),
                isBeforeSunrise: false
            }
        };
    }
}
