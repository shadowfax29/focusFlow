import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TimerCircleProps {
  progress: number;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  timeDisplay: string;
  statusText: string;
}

export default function TimerCircle({ 
  progress, 
  mode, 
  timeDisplay, 
  statusText 
}: TimerCircleProps) {
  const circleRef = useRef<SVGCircleElement>(null);

  // Calculate colors based on mode
  const getColor = () => {
    switch (mode) {
      case 'focus':
        return 'stroke-primary';
      case 'shortBreak':
      case 'longBreak':
        return 'stroke-orange-500';
      default:
        return 'stroke-primary';
    }
  };

  const getStatusColor = () => {
    switch (mode) {
      case 'focus':
        return 'text-primary';
      case 'shortBreak':
      case 'longBreak':
        return 'text-orange-500';
      default:
        return 'text-primary';
    }
  };
  
  // SVG circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    if (circleRef.current) {
      const offset = circumference - (progress * circumference);
      circleRef.current.style.strokeDashoffset = offset.toString();
    }
  }, [progress, circumference]);

  return (
    <div className="relative w-64 h-64 mx-auto mb-6">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="4"
        />
        
        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className={cn("transition-all", getColor())}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset="0"
          style={{
            transition: 'stroke-dashoffset 0.5s',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      
      {/* Timer display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold">{timeDisplay}</span>
        <span className={cn("text-sm font-medium mt-2", getStatusColor())}>
          {statusText}
        </span>
      </div>
    </div>
  );
}
