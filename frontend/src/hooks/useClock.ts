import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

export const useClock = (timezone: string | null) => {
    const [currentTime, setCurrentTime] = useState<string>('--:--:--');

    useEffect(() => {
        const updateTime = () => {
            if (!timezone) return;

            try {
                const now = DateTime.now().setZone(timezone);
                if (now.isValid) {
                    setCurrentTime(now.toFormat('HH:mm:ss'));
                }
            } catch (error) {
                console.error('Clock error:', error);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [timezone]);

    return currentTime;
};
