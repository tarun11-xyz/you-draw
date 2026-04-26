import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const STROKE_COLORS = ['#1e1e1e', '#e11d48', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#6366f1', '#06b6d4', '#ec4899'];
export const BG_COLORS = ['transparent', '#f1f5f9', '#fef2f2', '#eff6ff', '#fefce8', '#f3e8ff', '#f0fdf4', '#e0f2fe', '#ffe4e6', '#ffedd5', '#ecfccb'];
export const FONT_FAMILIES = ['Caveat, cursive', 'Inter, sans-serif', 'JetBrains Mono, monospace', 'Consolas, monospace', 'Comic Sans MS, Comic Sans, cursive', 'Georgia, serif', 'Impact, sans-serif'];

interface SettingsPanelProps {
  strokeColor: string;
  setStrokeColor: (c: string) => void;
  backgroundColor: string;
  setBackgroundColor: (c: string) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  roundness: 'sharp' | 'round';
  setRoundness: (r: 'sharp' | 'round') => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  textAlign: 'left' | 'center' | 'right';
  setTextAlign: (a: 'left' | 'center' | 'right') => void;
  link: string;
  setLink: (l: string) => void;
  activeTool: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  strokeColor,
  setStrokeColor,
  backgroundColor,
  setBackgroundColor,
  strokeWidth,
  setStrokeWidth,
  roundness,
  setRoundness,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  textAlign,
  setTextAlign,
  link,
  setLink,
  activeTool,
}) => {
  const [isVisible, setIsVisible] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed top-16 sm:top-24 left-4 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 z-10"
      >
        <ChevronRight size={20} />
      </button>
    );
  }

  const isTextSelected = activeTool === 'text';

  return (
    <div className="fixed top-16 sm:top-24 left-4 w-52 sm:w-60 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col gap-4 z-10 transition-colors max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar touch-auto">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Properties</span>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ChevronLeft size={18} />
        </button>
      </div>

      <div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Stroke Color</span>
        <div className="flex flex-wrap gap-2">
          {STROKE_COLORS.map(color => (
            <button
              key={color}
              onClick={() => setStrokeColor(color)}
              className={`w-6 h-6 rounded-md relative overflow-hidden ${strokeColor === color ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800' : 'border border-gray-200 dark:border-gray-600'}`}
            >
              <div className="absolute inset-0" style={{ backgroundColor: color === '#1e1e1e' ? '' : color }} />
              {color === '#1e1e1e' && (
                <div className="absolute inset-0 bg-gray-900 dark:bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Background</span>
        <div className="flex flex-wrap gap-2">
          {BG_COLORS.map(color => (
            <button
              key={color}
              onClick={() => setBackgroundColor(color)}
              style={{ background: color === 'transparent' ? 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 8px 8px' : color }}
              className={`w-6 h-6 rounded-md ${backgroundColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : 'border border-gray-200 dark:border-gray-600'}`}
            />
          ))}
        </div>
      </div>

      {!isTextSelected && (
        <>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Stroke Width</span>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg">
              {[2, 4, 8].map(w => (
                <button
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  className={`flex-1 h-8 flex items-center justify-center rounded-md transition-colors ${strokeWidth === w ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  <div className={`bg-gray-800 dark:bg-gray-200 ${w === 2 ? 'w-full h-0.5' : w === 4 ? 'w-full h-1' : 'w-full h-2'} rounded-full mx-2`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Edges</span>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg">
              {(['sharp', 'round'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRoundness(r)}
                  className={`flex-1 h-8 flex items-center justify-center rounded-md font-medium text-xs transition-colors ${roundness === r ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {r === 'sharp' ? 'Sharp' : 'Round'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {isTextSelected && (
        <>
          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Font Family</span>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
            >
              <option value="Caveat, cursive">Handdrawn</option>
              <option value="Inter, sans-serif">Normal</option>
              <option value="JetBrains Mono, monospace">Monospace</option>
              <option value="Consolas, monospace">Consolas</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Link</span>
            <input
              type="url"
              value={link || ''}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Font Size</span>
            <div className="flex gap-2">
              <div className="flex-1 flex gap-1.5 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg">
                {[16, 24, 32, 48].map(s => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className={`flex-1 h-8 flex items-center justify-center rounded-md font-medium text-xs transition-colors ${fontSize === s ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    {s === 16 ? 'S' : s === 24 ? 'M' : s === 32 ? 'L' : 'XL'}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="8"
                max="400"
                value={fontSize ? Math.round(fontSize) : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFontSize(0); // Temporary state before blur/commit
                  } else {
                    setFontSize(parseInt(val, 10));
                  }
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!val || val < 8) setFontSize(8);
                  else if (val > 400) setFontSize(400);
                }}
                className="w-[60px] h-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2 text-center"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Text Align</span>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg">
              {(['left', 'center', 'right'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setTextAlign(a)}
                  className={`flex-1 h-8 flex items-center justify-center rounded-md font-medium text-xs transition-colors capitalize ${textAlign === a ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {a.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
