import React from 'react';
import { Handle } from '@xyflow/react';
import type { HandleProps } from '@xyflow/react';

interface ButtonHandleProps extends Omit<HandleProps, 'children'> {
  showButton?: boolean;
  children: React.ReactNode;
}

const ButtonHandle: React.FC<ButtonHandleProps> = ({
  showButton = true,
  children,
  className = '',
  ...handleProps
}) => {
  return (
    <Handle
      {...handleProps}
      className={`relative ${className}`}
    >
      {showButton && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </Handle>
  );
};

export default ButtonHandle;
