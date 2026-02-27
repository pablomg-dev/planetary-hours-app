import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

interface LocationData {
    lat: string | null;
    lon: string | null;
    timezone: string | null;
}

export const useGeolocation = (defaultLocation: LocationData) => {
    const [location, setLocation] = useState<LocationData>({
        lat: null,
        lon: null,
        timezone: null
    });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude.toString(),
                        lon: position.coords.longitude.toString(),
                        timezone: DateTime.local().zoneName
                    });
                },
                () => {
                    setLocation(defaultLocation);
                }
            );
        } else {
            setLocation(defaultLocation);
        }
    }, []);

    return location;
};
