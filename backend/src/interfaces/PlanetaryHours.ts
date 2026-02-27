export interface PlanetaryHour {
    hour: number;
    type: 'day' | 'night';
    start: string;
    end: string;
    planet: string;
}

export interface PlanetaryHoursParams {
    date: string;
    lat: string;
    lon: string;
    timezone: string;
    cityName?: string;
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

export interface CityOption {
    label: string;
    value: {
        lat: string;
        lon: string;
        name: string;
        timezone?: string;
    };
}
