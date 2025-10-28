
import { FARE_CONFIG, RIDE_CONFIG } from '../constants';
import type { RideState, Action } from '../types';
import { haversineDistance } from '../utils/geolocation';
import { isNightTime } from '../utils/time';

export const initialState: RideState = {
  phase: 'idle',
  movementStatus: 'unknown',
  distance: 0,
  startTime: null,
  elapsedTime: 0,
  fare: null,
  lastPosition: null,
  stationaryTime: 0,
  error: null,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export function rideReducer(state: RideState, action: Action): RideState {
  switch (action.type) {
    case 'START_RIDE':
      return {
        ...initialState,
        phase: 'running',
        startTime: Date.now(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

    case 'STOP_RIDE': {
      if (state.phase !== 'running') return state;
      
      const timeInMinutes = state.elapsedTime / 60;
      const stationaryTimeInMinutes = state.stationaryTime / 60;

      let calculatedFare = FARE_CONFIG.BASE_FARE;
      calculatedFare += timeInMinutes * FARE_CONFIG.TIME_FARE_PER_MINUTE;
      calculatedFare += state.distance * FARE_CONFIG.DISTANCE_FARE_PER_KM;
      calculatedFare += FARE_CONFIG.PLATFORM_FEE;

      if (isNightTime(new Date(), state.timeZone)) {
        calculatedFare *= (1 + FARE_CONFIG.NIGHT_SURCHARGE_RATE);
      }

      if (stationaryTimeInMinutes > FARE_CONFIG.WAIT_TIME_THRESHOLD_MINUTES) {
        calculatedFare *= (1 + FARE_CONFIG.WAIT_TIME_SURCHARGE_RATE);
      }
      
      if (calculatedFare < FARE_CONFIG.MINIMUM_FARE) {
        calculatedFare = FARE_CONFIG.MINIMUM_FARE;
      }

      return { ...state, phase: 'stopped', fare: calculatedFare };
    }

    case 'RESET_RIDE':
      return initialState;

    case 'TICK': {
      if (state.phase !== 'running' || !state.startTime) return state;
      const elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
      const stationaryTime = state.movementStatus === 'stationary' ? state.stationaryTime + 1 : state.stationaryTime;
      return { ...state, elapsedTime, stationaryTime };
    }

    case 'GEOLOCATION_UPDATE': {
      if (state.phase !== 'running') return state;
      const newPosition = action.payload;
      
      if (!state.lastPosition) {
        return { ...state, lastPosition: newPosition };
      }

      const distanceIncrement = haversineDistance(state.lastPosition, newPosition); // in km
      
      // Only add distance if moving and the distance increment is significant enough
      const isSignificantMove = distanceIncrement * 1000 > RIDE_CONFIG.DISTANCE_UPDATE_THRESHOLD_METERS;

      const distance = state.movementStatus === 'moving' && isSignificantMove
        ? state.distance + distanceIncrement
        : state.distance;

      return { ...state, distance, lastPosition: newPosition };
    }
    
    case 'DEVICE_MOTION_UPDATE': {
        const isMoving = action.payload.isMoving;
        return { ...state, movementStatus: isMoving ? 'moving' : 'stationary' };
    }

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}
