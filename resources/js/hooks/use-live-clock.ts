import { useState, useEffect } from 'react';

export function useLiveClock() {
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const dateStr = new Intl.DateTimeFormat('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }).format(now);

            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const timeStr = `${hours}.${minutes}.${seconds} WIB`;

            setCurrentDate(dateStr);
            setCurrentTime(timeStr);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    return { currentDate, currentTime };
}
