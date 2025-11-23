import React, { useRef, useEffect } from 'react';
import { FormElement, FieldType } from '../types';

interface DraggableFieldProps {
  element: FormElement;
  isSelected: boolean;
  scale: number;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (id: string, updates: Partial<FormElement>) => void;
}

const DraggableField: React.FC<DraggableFieldProps> = ({
  element,
  isSelected,
  scale,
  onSelect,
  onUpdate,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startDims = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e);
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startDims.current = { x: element.x, y: element.y, w: element.width, h: element.height };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    onUpdate(element.id, {
      x: startDims.current.x + dx,
      y: startDims.current.y + dy
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Handle Resizing
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    // Don't trigger select on resize handle click specifically to avoid conflict, but usually select is fine
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = element.width;
    const startH = element.height;

    const handleResizeMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      
      // Simple bottom-right resize for MVP. Full 8-handle resize is complex.
      if (direction === 'se') {
        onUpdate(element.id, {
          width: Math.max(20, startW + dx),
          height: Math.max(20, startH + dy)
        });
      }
    };

    const handleResizeUp = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeUp);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
  };

  // Styles based on type
  const getBgColor = () => {
    switch (element.type) {
      case FieldType.CHECKBOX: return 'bg-green-100/80';
      case FieldType.RADIO: return 'bg-purple-100/80';
      default: return 'bg-blue-100/80';
    }
  };

  const getBorderColor = () => {
    if (isSelected) return 'border-blue-600 ring-2 ring-blue-400 ring-opacity-50';
    switch (element.type) {
      case FieldType.CHECKBOX: return 'border-green-500';
      case FieldType.RADIO: return 'border-purple-500';
      default: return 'border-blue-500';
    }
  };

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: isSelected ? 'move' : 'default',
      }}
      className={`
        absolute flex items-center justify-center text-xs overflow-hidden rounded-sm border transition-shadow
        ${getBgColor()} ${getBorderColor()}
      `}
    >
      <span className="pointer-events-none select-none font-medium text-slate-700 truncate px-1">
        {element.name || element.type} {element.required && '*'}
      </span>

      {isSelected && (
        <div
          onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize rounded-tl-sm"
        />
      )}
    </div>
  );
};

export default DraggableField;
