import React from 'react';
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Diamond,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Image as ImageIcon,
  LayoutPanelLeft,
  Triangle,
} from 'lucide-react';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  onImageClick?: () => void;
}

const TOOLS = [
  { type: 'selection', icon: MousePointer2, label: 'Select', key: '1' },
  { type: 'hand', icon: Hand, label: 'Pan', key: '2' },
  { type: 'frame', icon: LayoutPanelLeft, label: 'Frame', key: 'f' },
  { type: 'rectangle', icon: Square, label: 'Rectangle', key: '3' },
  { type: 'diamond', icon: Diamond, label: 'Diamond', key: '4' },
  { type: 'ellipse', icon: Circle, label: 'Ellipse', key: '5' },
  { type: 'triangle', icon: Triangle, label: 'Triangle', key: 't' },
  { type: 'arrow', icon: ArrowRight, label: 'Arrow', key: '6' },
  { type: 'line', icon: Minus, label: 'Line', key: '7' },
  { type: 'pencil', icon: Pencil, label: 'Draw', key: '8' },
  { type: 'text', icon: Type, label: 'Insert Text', key: '9' },
  { type: 'image', icon: ImageIcon, label: 'Image', key: '0' },
  { type: 'eraser', icon: ({size, strokeWidth}: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L20 9C20.5 9.5 20.5 10.5 20 11L11 20H20V20Z"/>
      <path d="M11 20L18 13"/>
    </svg>
  ), label: 'Eraser', key: 'e' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, onImageClick }) => {
  return (
    <div className="fixed bottom-4 sm:bottom-auto md:top-12 lg:top-4 sm:top-4 left-1/2 -translate-x-1/2 flex items-center p-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 gap-1 z-10 transition-colors w-max max-w-[calc(100vw-1rem)] overflow-x-auto custom-scrollbar touch-auto">
      {TOOLS.map(({ type, icon: Icon, label, key }) => (
        <React.Fragment key={type}>
          {type === 'rectangle' && <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0"></div>}
          <button
            onClick={() => {
              setActiveTool(type as ToolType);
              if (type === 'image' && onImageClick) onImageClick();
            }}
            title={`${label} (${key})`}
            className={`relative p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0 ${
              activeTool === type
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
            }`}
          >
            <Icon size={20} strokeWidth={2} />
            <span className="absolute bottom-0 right-1 text-[9px] font-bold opacity-50 hidden lg:block">{key}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};
