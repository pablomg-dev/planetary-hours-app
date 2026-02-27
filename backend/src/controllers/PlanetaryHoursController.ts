import type { Request, Response } from 'express';
import { PlanetaryHoursService } from '../services/PlanetaryHoursService.js';
import type { PlanetaryHoursParams } from '../interfaces/PlanetaryHours.js';

export class PlanetaryHoursController {
    private planetaryHoursService: PlanetaryHoursService;

    constructor() {
        this.planetaryHoursService = new PlanetaryHoursService();
    }

    /**
     * Maneja la solicitud para obtener las horas planetarias.
     */
    public getPlanetaryHours = (req: Request, res: Response): void => {
        try {
            const { date, lat, lon, timezone, cityName } = req.query as unknown as PlanetaryHoursParams;

            // Validación básica (en un futuro esto se puede mover a un middleware con Zod)
            if (!date || !lat || !lon || !timezone) {
                res.status(400).json({ error: 'Missing date, latitude, longitude, or timezone.' });
                return;
            }

            const result = this.planetaryHoursService.calculateHours({
                date,
                lat,
                lon,
                timezone,
                cityName: cityName as string
            });

            res.json(result);
        } catch (error: any) {
            console.error('Error in PlanetaryHoursController:', error.message);
            res.status(500).json({ error: error.message || 'Internal server error during calculation.' });
        }
    };
}
