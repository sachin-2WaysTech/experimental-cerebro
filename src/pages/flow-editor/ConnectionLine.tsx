import React from 'react';
import { useConnection } from '@xyflow/react';
import type { ConnectionLineComponentProps } from '@xyflow/react';

interface AnimatedConnectionLineProps extends ConnectionLineComponentProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

const AnimatedConnectionLine: React.FC<AnimatedConnectionLineProps> = ({
  fromX,
  fromY,
  toX,
  toY
}) => {
  const { fromHandle } = useConnection();

  // Calculate control points for smooth curve
  const controlPointOffset = Math.abs(toY - fromY) * 0.5;
  const controlPoint1X = fromX;
  const controlPoint1Y = fromY + controlPointOffset;
  const controlPoint2X = toX;
  const controlPoint2Y = toY - controlPointOffset;

  // Create smooth bezier curve path
  const path = `M${fromX},${fromY} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${toX},${toY}`;

  // Get stroke color from handle or use default gradient
  const strokeColor = fromHandle?.id || 'url(#connection-gradient)';

  return (
    <g>
      {/* Gradient definition */}
      <defs>
        <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFDE58" />
          <stop offset="50%" stopColor="#FF8E6C" />
          <stop offset="100%" stopColor="#BA49AB" />
        </linearGradient>
      </defs>

      {/* Animated connection line */}
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeDasharray="5,5"
        className="animate-pulse"
        d={path}
        style={{
          filter: 'drop-shadow(0 0 4px rgba(255, 222, 88, 0.3))',
          animation: 'dashOffset 2s linear infinite'
        }}
      />

      {/* Connection endpoint circle */}
      <circle
        cx={toX}
        cy={toY}
        fill="rgba(255, 255, 255, 0.9)"
        r={4}
        stroke={strokeColor}
        strokeWidth={2}
        className="animate-pulse"
        style={{
          filter: 'drop-shadow(0 0 4px rgba(255, 222, 88, 0.5))'
        }}
      />

      {/* Animated flow indicator */}
      <circle
        cx={fromX}
        cy={fromY}
        fill={strokeColor}
        r={2}
        className="animate-ping"
        style={{
          animationDelay: '0.5s'
        }}
      />
    </g>
  );
};

export default AnimatedConnectionLine;
