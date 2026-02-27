import type { CityOption } from '../interfaces/PlanetaryHours.js';

export class LocationService {
    private static readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
    private static readonly USER_AGENT = 'PlanetaryHoursApp/1.0 (pablomg-dev; education)';

    /**
     * Busca ciudades usando el API de Nominatim (OpenStreetMap)
     * @param query - Término de búsqueda
     * @returns Lista de opciones de ciudad formateadas
     */
    async searchCities(query: string): Promise<any[]> {
        if (!query || query.length < 3) return [];

        try {
            const url = `${LocationService.NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=es`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': LocationService.USER_AGENT,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error en la API de Nominatim: ${response.statusText}`);
            }

            const data = await response.json() as any[];

            return data.map(place => ({
                label: place.display_name,
                value: {
                    lat: place.lat,
                    lon: place.lon,
                    name: place.display_name.split(',')[0],
                    // Timezone se infiere en el frontend o se puede mejorar aquí luego
                }
            }));
        } catch (error) {
            console.error('Error in LocationService.searchCities:', error);
            throw error;
        }
    }
}
