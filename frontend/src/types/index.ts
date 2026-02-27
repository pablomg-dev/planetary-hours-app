export interface PlanetaryHour {
    hour: number;
    type: 'day' | 'night';
    start: string;
    end: string;
    planet: string;
}

export interface PlanetaryHoursResponse {
    dayRuler: string;
    nextDayRuler: string;
    hours: PlanetaryHour[];
    timezone: string;
    city?: string;
    currentPlanetaryDay: {
        start: string;
        end: string;
        isBeforeSunrise: boolean;
    };
}

export interface ApiParams {
    date: string;
    lat: string | null;
    lon: string | null;
    timezone: string | null;
    cityName: string | null;
}
