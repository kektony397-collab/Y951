import { FARE_CONFIG } from "../constants";

export const isNightTime = (date: Date, timeZone: string): boolean => {
  try {
    const hourString = date.toLocaleString('en-US', {
      timeZone,
      hour: '2-digit',
      hour12: false,
    });
    const currentHour = parseInt(hourString, 10);
    
    if(isNaN(currentHour)) return false;

    return (
      currentHour >= FARE_CONFIG.NIGHT_SURCHARGE_START_HOUR ||
      currentHour < FARE_CONFIG.NIGHT_SURCHARGE_END_HOUR
    );
  } catch (e) {
    console.error("Error determining night time:", e);
    // Fallback to local time if IANA timezone fails
    const currentHour = date.getHours();
    return (
      currentHour >= FARE_CONFIG.NIGHT_SURCHARGE_START_HOUR ||
      currentHour < FARE_CONFIG.NIGHT_SURCHARGE_END_HOUR
    );
  }
};
