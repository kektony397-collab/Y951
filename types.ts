export type RidePhase = 'idle' | 'running' | 'stopped';

export type MovementStatus = 'unknown' | 'moving' | 'stationary';

export interface Position {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface RideState {
  phase: RidePhase;
  movementStatus: MovementStatus;
  distance: number; // in km
  startTime: number | null; // timestamp
  elapsedTime: number; // in seconds
  fare: number | null;
  lastPosition: Position | null;
  stationaryTime: number; // in seconds
  error: string | null;
  timeZone: string;
}

export type Action =
  | { type: 'START_RIDE' }
  | { type: 'STOP_RIDE' }
  | { type: 'RESET_RIDE' }
  | { type: 'TICK' }
  | { type: 'GEOLOCATION_UPDATE'; payload: Position }
  | { type: 'DEVICE_MOTION_UPDATE'; payload: { isMoving: boolean } }
  | { type: 'SET_ERROR'; payload: string | null };
