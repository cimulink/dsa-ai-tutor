import React, { useState, useRef, useEffect } from 'react';

interface ResizablePanelProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  leftPanel,
  rightPanel,
  initialLeftWidth = 300,
  minLeftWidth = 200,
  maxLeftWidth = 600,
  className = ''
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const onDrag = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = e.clientX - containerRect.left;

    // Apply min and max constraints
    if (newLeftWidth >= minLeftWidth && newLeftWidth <= maxLeftWidth) {
      setLeftWidth(newLeftWidth);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDragging);
    }

    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDragging);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className={`flex w-full h-full ${className}`}
    >
      <div 
        className="h-full flex overflow-auto"
        style={{ width: `${leftWidth}px` }}
      >
        <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
          {leftPanel}
        </div>
      </div>
      
      <div 
        className="w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex items-center justify-center relative"
        onMouseDown={startDragging}
      >
        <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
      </div>
      
      <div className="flex-1 h-full flex overflow-auto">
        <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
          {rightPanel}
        </div>
      </div>
    </div>
  );
};

interface VerticalResizablePanelProps {
  topPanel: React.ReactNode;
  bottomPanel: React.ReactNode;
  initialTopHeight?: number;
  minTopHeight?: number;
  maxTopHeight?: number;
  className?: string;
}

export const VerticalResizablePanel: React.FC<VerticalResizablePanelProps> = ({
  topPanel,
  bottomPanel,
  initialTopHeight = 300,
  minTopHeight = 100,
  maxTopHeight = 500,
  className = ''
}) => {
  const [topHeight, setTopHeight] = useState(initialTopHeight);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const onDrag = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newTopHeight = e.clientY - containerRect.top;

    // Apply min and max constraints
    if (newTopHeight >= minTopHeight && newTopHeight <= maxTopHeight) {
      setTopHeight(newTopHeight);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDragging);
    }

    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDragging);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col w-full h-full ${className}`}
    >
      <div 
        className="w-full flex overflow-auto"
        style={{ height: `${topHeight}px` }}
      >
        <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
          {topPanel}
        </div>
      </div>
      
      <div 
        className="h-2 bg-gray-200 hover:bg-blue-400 cursor-row-resize flex items-center justify-center relative"
        onMouseDown={startDragging}
      >
        <div className="w-8 h-1 bg-gray-400 rounded-full"></div>
      </div>
      
      <div className="flex-1 w-full flex overflow-auto">
        <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
          {bottomPanel}
        </div>
      </div>
    </div>
  );
};