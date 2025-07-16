import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

const AnimatedConnectionLine: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
  ...props
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: selected ? '#00790e' : '#454b56',
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: '6,10',
        }}
        className="connection-line"
        {...props}
      />
      <circle r="3" fill="#FF8E6C">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-white px-2 py-1 rounded shadow-sm border border-gray-900 text-gray-700"
          >
            {data?.label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default AnimatedConnectionLine;
