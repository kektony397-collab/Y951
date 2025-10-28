// FIX: Import React to provide the namespace for React.Dispatch
import React, { useEffect, useRef, useCallback } from 'react';
import type { Action, RidePhase } from '../types';
import { RIDE_CONFIG } from '../constants';

export function useRide(dispatch: React.Dispatch<Action>, phase: RidePhase) {
  const watchIdRef = useRef<number | null>(null);
  const backgroundTaskIdRef = useRef<number | null>(null);
  const lpfAccelRef = useRef({ x: 0, y: 0, z: 0 });

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (backgroundTaskIdRef.current !== null) {
      clearInterval(backgroundTaskIdRef.current);
      backgroundTaskIdRef.current = null;
    }
  }, []);

  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (!event.acceleration) return;
    
    const { x, y, z } = event.acceleration;
    if (x === null || y === null || z === null) return;
    
    const alpha = RIDE_CONFIG.DEVICE_MOTION_LPF_ALPHA;
    const lpf = lpfAccelRef.current;
    
    lpf.x = alpha * x + (1 - alpha) * lpf.x;
    lpf.y = alpha * y + (1 - alpha) * lpf.y;
    lpf.z = alpha * z + (1 - alpha) * lpf.z;
    
    const magnitude = Math.sqrt(lpf.x ** 2 + lpf.y ** 2 + lpf.z ** 2) / 9.81; // Convert to G
    const isMoving = magnitude > RIDE_CONFIG.STATIONARY_ACCEL_THRESHOLD_G;

    dispatch({ type: 'DEVICE_MOTION_UPDATE', payload: { isMoving } });
  }, [dispatch]);
  
  const startWatching = useCallback(() => {
    stopWatching();
    
    const successCallback: PositionCallback = (position) => {
      if (position.coords.accuracy > 50) return; // Ignore low accuracy updates
      dispatch({ type: 'GEOLOCATION_UPDATE', payload: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: position.timestamp,
      }});
    };
    
    const errorCallback: PositionErrorCallback = (error) => {
      dispatch({ type: 'SET_ERROR', payload: `Location Error: ${error.message}` });
    };

    if (document.visibilityState === 'visible') {
      watchIdRef.current = navigator.geolocation.watchPosition(successCallback, errorCallback, RIDE_CONFIG.GEOLOCATION_OPTIONS);
    } else {
      backgroundTaskIdRef.current = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, RIDE_CONFIG.GEOLOCATION_OPTIONS);
      }, RIDE_CONFIG.BACKGROUND_GPS_INTERVAL_MS);
    }
  }, [dispatch, stopWatching]);

  // Main effect for ride lifecycle
  useEffect(() => {
    if (phase !== 'running') {
      stopWatching();
      window.removeEventListener('devicemotion', handleDeviceMotion);
      return;
    }

    // Start timer
    const timerId = setInterval(() => dispatch({ type: 'TICK' }), 1000);

    // Start sensors
    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }
    startWatching();
    
    // Handle visibility changes for battery optimization
    const handleVisibilityChange = () => {
      if (phase === 'running') {
        startWatching();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timerId);
      stopWatching();
      window.removeEventListener('devicemotion', handleDeviceMotion);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [phase, dispatch, startWatching, stopWatching, handleDeviceMotion]);
}