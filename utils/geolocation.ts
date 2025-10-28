
import type { Position } from '../types';

// Calculates the distance between two points in kilometers using the Haversine formula.
export const haversineDistance = (pos1: Position, pos2: Position): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLng = toRad(pos2.lng - pos1.lng);
  const lat1 = toRad(pos1.lat);
  const lat2 = toRad(pos2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};
