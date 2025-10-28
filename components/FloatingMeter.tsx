import React, { useState, useRef, useEffect } from 'react';
import type { RideState } from '../types';
import AnimatedNumber from './AnimatedNumber';

interface FloatingMeterProps {
  rideState: RideState;
  onClose: () => void;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}m`;
};

const FloatingMeter: React.FC<FloatingMeterProps> = ({ rideState, onClose }) => {
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };
  
  useEffect(() => {
    const currentIsDragging = isDraggingRef.current;
    if (currentIsDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [position]);


  return (
    <div
      ref={nodeRef}
      className="fixed top-0 left-0 bg-gray-900/80 backdrop-blur-sm text-white rounded-full shadow-2xl border-2 border-cyan-500/50 font-orbitron z-50 flex items-center p-2 cursor-grab active:cursor-grabbing animate-fade-in-scale"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center space-x-4 px-4">
        <div className="text-center">
            <div className="text-2xl font-bold text-cyan-300">
                <AnimatedNumber value={rideState.distance} format={(v) => v.toFixed(2)} />
            </div>
            <div className="text-xs text-gray-400">km</div>
        </div>
        <div className="border-l border-gray-600 h-8"></div>
        <div className="text-center">
            <div className="text-2xl font-bold text-cyan-300">
                {formatTime(rideState.elapsedTime)}
            </div>
            <div className="text-xs text-gray-400">time</div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="ml-2 bg-red-500/50 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
        aria-label="Close floating meter"
      >
        &times;
      </button>
    </div>
  );
};

export default FloatingMeter;
