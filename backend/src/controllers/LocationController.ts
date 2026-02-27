import type { Request, Response } from 'express';
import { LocationService } from '../services/LocationService.js';

export class LocationController {
    private locationService: LocationService;

    constructor() {
        this.locationService = new LocationService();
    }

    async searchCities(req: Request, res: Response): Promise<void> {
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            res.status(400).json({ error: 'El parámetro de búsqueda "q" es obligatorio' });
            return;
        }

        try {
            const cities = await this.locationService.searchCities(q);
            res.json(cities);
        } catch (error) {
            res.status(500).json({ error: 'Error al buscar ciudades' });
        }
    }
}
