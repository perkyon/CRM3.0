import React from 'react';

interface PrimitiveDivProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function PrimitiveDiv({ children, className = '', ...props }: PrimitiveDivProps) {
  return (
    <div 
      className={`w-[1080px] h-[860px] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}