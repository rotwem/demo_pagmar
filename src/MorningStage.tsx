import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { GazePoint } from './types';

interface MorningStageProps {
  faceDetected: boolean;
  mappedPoint: GazePoint;
  onStageComplete: () => void;
  blinkDetected: boolean;
}

const MorningStage: React.FC<MorningStageProps> = ({
  faceDetected,
  mappedPoint,
  onStageComplete,
  blinkDetected
}) => {
  const [showWink, setShowWink] = useState(false);
  const [isBlackBackground, setIsBlackBackground] = useState(false);
  const [isHoveringCircle, setIsHoveringCircle] = useState(false);
  const lastBlinkTime = useRef<number>(0);
  const toggleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  // Add effect for wink text display and background toggle with debounce
  useEffect(() => {
    if (blinkDetected) {
      const now = Date.now();
      const timeSinceLastBlink = now - lastBlinkTime.current;
      
      // Only toggle if it's been at least 500ms since the last blink
      if (timeSinceLastBlink > 500) {
        lastBlinkTime.current = now;
        
        setShowWink(true);
        setIsBlackBackground(prev => !prev);
        
        // Clear any existing timeout
        if (toggleTimeoutRef.current) {
          clearTimeout(toggleTimeoutRef.current);
        }
        
        // Hide wink text after 500ms
        toggleTimeoutRef.current = setTimeout(() => {
          setShowWink(false);
        }, 500);
      }
    }
  }, [blinkDetected]);

  // Effect to check gaze intersection with circle
  useEffect(() => {
    if (!faceDetected || !mappedPoint || !circleRef.current) {
      setIsHoveringCircle(false);
      return;
    }

    const rect = circleRef.current.getBoundingClientRect();
    const isIntersecting = 
      mappedPoint.x >= rect.left &&
      mappedPoint.x <= rect.right &&
      mappedPoint.y >= rect.top &&
      mappedPoint.y <= rect.bottom;

    setIsHoveringCircle(isIntersecting);
  }, [faceDetected, mappedPoint.x, mappedPoint.y]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toggleTimeoutRef.current) {
        clearTimeout(toggleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="stage-morning" style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: isBlackBackground ? 'black' : 'white',
      // transition: 'background-color 0.3s ease'
    }}>
      
      {/* Center Circle */}
      <div
        ref={circleRef}
        style={{
          position: 'absolute',
          top: '70%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isHoveringCircle ? '220px' : '200px',
          height: isHoveringCircle ? '220px' : '200px',
          borderRadius: '50%',
          backgroundColor: isBlackBackground ? 'white' : 'black',
          transition: 'all 0.3s ease',
          boxShadow: isHoveringCircle 
            ? `0 0 30px ${isBlackBackground ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'}`
            : 'none',
          zIndex: 2
        }}
      />
      
      {/* Wink Text */}
      {showWink && (
        <div className="wink-text">
          wink
        </div>
      )}

      {/* Gaze tracking overlay */}
      <div className="tracking-overlay" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 4
      }}>
        {faceDetected && (
          <motion.div
            className="gaze-dot"
            style={{ 
              position: 'absolute',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ff0000',
              x: mappedPoint.x,
              y: mappedPoint.y,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px rgba(255, 0, 0, 0.6)',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    </div>
  );
};

export default MorningStage; 