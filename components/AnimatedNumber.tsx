import React, { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format: (value: number) => string;
  className?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 500,
  format,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const interpolatedValue = startValue + (endValue - startValue) * percentage;
      setDisplayValue(interpolatedValue);

      if (progress < duration) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      prevValueRef.current = value;
    };
  }, [value, duration]);

  return <span className={className}>{format(displayValue)}</span>;
};

export default AnimatedNumber;
