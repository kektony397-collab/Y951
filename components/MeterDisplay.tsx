import React from 'react';
import type { RidePhase } from '../types';
import AnimatedNumber from './AnimatedNumber';

interface MeterDisplayProps {
  distance: number;
  timeInSeconds: number;
  fare: number | null;
  status: RidePhase;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const MeterDisplay: React.FC<MeterDisplayProps> = ({ distance, timeInSeconds, fare, status }) => {
  const isFareVisible = status === 'stopped' && fare !== null;

  return (
    <div className="bg-black/50 rounded-lg p-6 text-center border-2 border-gray-700 mb-6 font-orbitron">
      
      {/* Fare Display */}
      <div className={`transition-all duration-500 ease-in-out ${isFareVisible ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {isFareVisible && (
          <div className="mb-4 animate-fade-in-scale">
            <p className="text-xl text-gray-400">TOTAL FARE</p>
            <p className="text-6xl font-bold text-green-400 tracking-tighter">
              <span className="text-4xl align-top mr-1">₹</span>
              <AnimatedNumber value={fare} format={(v) => v.toFixed(2)} />
            </p>
          </div>
        )}
      </div>

      {/* Ride In Progress Display */}
      <div className={`transition-opacity duration-500 ${isFareVisible ? 'opacity-0 h-0 overflow-hidden pointer-events-none' : 'opacity-100'}`}>
        <div className={status === 'idle' ? 'opacity-50' : ''}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-widest">Distance</p>
              <p className="text-4xl font-bold text-cyan-300">
                <AnimatedNumber value={distance} format={(v) => v.toFixed(2)} />
                <span className="text-lg ml-1">km</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-widest">Time</p>
              <p className="text-4xl font-bold text-cyan-300">
                {formatTime(timeInSeconds)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default MeterDisplay;
