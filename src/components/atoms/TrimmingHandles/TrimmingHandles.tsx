import React from 'react';
import './TrimmingHandles.css'; // Add CSS import

interface TrimmingHandlesProps {
  duration: number;
  startTime: number;
  endTime: number;
  dragging: string | null;
  setDragging: React.Dispatch<React.SetStateAction<string | null>>;
}

const TrimmingHandles: React.FC<TrimmingHandlesProps> = ({
  duration,
  startTime,
  endTime,
  dragging,
  setDragging,
}) => {
  // Calculate positions as percentages
  const startPercent = (startTime / duration) * 100;
  const endPercent = (endTime / duration) * 100;

  const handleMouseDown = (handle: string) => {
    setDragging(handle);
  };

  return (
    <div className="trimming-handles">
      <div
        className="handle start-handle"
        style={{ left: `${startPercent}%` }}
        onMouseDown={() => handleMouseDown('start')}
      />
      <div
        className="handle end-handle"
        style={{ left: `${endPercent}%` }}
        onMouseDown={() => handleMouseDown('end')}
      />
      <div
        className="highlighted-region"
        style={{
          left: `${startPercent}%`,
          width: `${endPercent - startPercent}%`,
        }}
      />
    </div>
  );
};

export default TrimmingHandles;