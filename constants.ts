export const FARE_CONFIG = {
  BASE_FARE: 19, // in INR
  TIME_FARE_PER_MINUTE: 0.5, // in INR
  DISTANCE_FARE_PER_KM: 20, // in INR
  PLATFORM_FEE: 2.5, // in INR
  MINIMUM_FARE: 20, // in INR
  NIGHT_SURCHARGE_RATE: 0.20, // 20%
  WAIT_TIME_SURCHARGE_RATE: 0.20, // 20%
  NIGHT_SURCHARGE_START_HOUR: 23, // 11 PM
  NIGHT_SURCHARGE_END_HOUR: 6, // 6 AM
  WAIT_TIME_THRESHOLD_MINUTES: 3,
};

export const RIDE_CONFIG = {
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  },
  DISTANCE_UPDATE_THRESHOLD_METERS: 5, // Process update only if moved more than 5 meters
  STATIONARY_SPEED_THRESHOLD_KPH: 1, // Fallback if accelerometer is not available
  DEVICE_MOTION_LPF_ALPHA: 0.1, // Low-pass filter alpha for smoothing accelerometer data
  STATIONARY_ACCEL_THRESHOLD_G: 0.035, // Threshold in Gs to consider the device stationary
  BACKGROUND_GPS_INTERVAL_MS: 30000, // Poll GPS every 30s when in background
};
