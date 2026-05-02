import React, { useState } from 'react';
import { Menu, Undo2, Redo2, LogOut, Trash2, Moon, Sun, ZoomIn, ZoomOut, Check, Square, Grid3x3, Grip, User, Plus, Paintbrush } from 'lucide-react';

interface SidebarProps {
  onReset: () => void;
  onNewCanvas?: () => void;
  onDeleteCanvas?: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  canvasBgColor: string;
  setCanvasBgColor: (color: string) => void;
  canvasPattern: 'dots' | 'grid' | 'isometric' | 'lines' | 'none';
  setCanvasPattern: (pattern: 'dots' | 'grid' | 'isometric' | 'lines' | 'none') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onReset, 
  onNewCanvas,
  onDeleteCanvas,
  theme, 
  toggleTheme, 
  canvasBgColor, 
  setCanvasBgColor, 
  canvasPattern, 
  setCanvasPattern 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    { label: 'Default', value: 'default' },
    { label: 'White', value: '#ffffff' },
    { label: 'Dark Navy', value: '#0a0a1a' },
    { label: 'Deep Violet', value: '#120024' },
    { label: 'Cyber Black', value: '#050505' },
    { label: 'Neon Blue', value: '#001122' },
    { label: 'Neon Purple', value: '#1a0033' },
  ];

  return (
    <div className="fixed top-4 left-4 flex gap-3 items-center z-10 transition-colors">
      <div className="relative flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white dark:bg-[#232329] rounded-lg shadow-sm border border-gray-200 dark:border-[#383845] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#343442] flex items-center justify-center transition-colors"
        >
          <Menu size={20} />
        </button>

        {isOpen && (
          <div className="absolute top-12 left-0 w-64 bg-white dark:bg-[#232329] rounded-xl shadow-lg border border-gray-100 dark:border-[#383845] overflow-hidden py-3 transition-colors touch-auto max-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
            <div className="px-4 pb-4 mb-2 border-b border-gray-100 dark:border-[#383845] flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-500 dark:bg-[#00ffff] dark:text-[#232329] rounded-lg flex items-center justify-center text-white shadow-sm ring-2 ring-blue-500 dark:ring-[#00ffff] ring-offset-2 dark:ring-offset-gray-800 overflow-hidden">
                {/* Replace the 'src' below with your custom image URL */}
                <img src="./YouDraw..png" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <span className="font-bold text-lg text-gray-800 dark:text-gray-200 tracking-widest font-joyful">YouDraw</span>
            </div>

            <div className="pb-2 mb-2 border-b border-gray-100 dark:border-[#383845]">
              <button
                onClick={() => {
                  if (onNewCanvas) onNewCanvas();
                  else onReset();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#343442] text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm transition-colors"
              >
                <Plus size={16} />
                New Canvas
              </button>
            </div>

            <div className="px-4 pb-2 mb-2 border-b border-gray-100 dark:border-[#383845]">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Canvas Style</h3>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setCanvasPattern('dots')} 
                  className={`flex-1 p-2 flex flex-col items-center justify-center gap-1 rounded border transition-colors ${canvasPattern === 'dots' ? 'border-blue-500 dark:border-[#00ffff]/50 bg-blue-50/50 dark:bg-[#00ffff]/20 text-blue-600 dark:text-[#00ffff]' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#343442] text-gray-600 dark:text-gray-300'}`}
                >
                  <Grip size={16} />
                  <span className="text-[10px] font-medium">Dots</span>
                </button>
                <button 
                  onClick={() => setCanvasPattern('grid')} 
                  className={`flex-1 p-2 flex flex-col items-center justify-center gap-1 rounded border transition-colors ${canvasPattern === 'grid' ? 'border-blue-500 dark:border-[#00ffff]/50 bg-blue-50/50 dark:bg-[#00ffff]/20 text-blue-600 dark:text-[#00ffff]' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#343442] text-gray-600 dark:text-gray-300'}`}
                >
                  <Grid3x3 size={16} />
                  <span className="text-[10px] font-medium">Grid</span>
                </button>
                <button 
                  onClick={() => setCanvasPattern('lines')} 
                  className={`flex-1 p-2 flex flex-col items-center justify-center gap-1 rounded border transition-colors ${canvasPattern === 'lines' ? 'border-blue-500 dark:border-[#00ffff]/50 bg-blue-50/50 dark:bg-[#00ffff]/20 text-blue-600 dark:text-[#00ffff]' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#343442] text-gray-600 dark:text-gray-300'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                  <span className="text-[10px] font-medium">Lines</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => setCanvasPattern('isometric')} 
                  className={`flex-1 p-2 flex flex-col items-center justify-center gap-1 rounded border transition-colors ${canvasPattern === 'isometric' ? 'border-blue-500 dark:border-[#00ffff]/50 bg-blue-50/50 dark:bg-[#00ffff]/20 text-blue-600 dark:text-[#00ffff]' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#343442] text-gray-600 dark:text-gray-300'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline><polyline points="2 15.5 12 8.5 22 15.5"></polyline><line x1="12" y1="2" x2="12" y2="8.5"></line></svg>
                  <span className="text-[10px] font-medium">Isometric</span>
                </button>
                <button 
                  onClick={() => setCanvasPattern('none')} 
                  className={`flex-1 p-2 flex flex-col items-center justify-center gap-1 rounded border transition-colors ${canvasPattern === 'none' ? 'border-blue-500 dark:border-[#00ffff]/50 bg-blue-50/50 dark:bg-[#00ffff]/20 text-blue-600 dark:text-[#00ffff]' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#343442] text-gray-600 dark:text-gray-300'}`}
                >
                  <Square size={16} />
                  <span className="text-[10px] font-medium">None</span>
                </button>
              </div>
            </div>

            <div className="px-4 pb-2 mb-2 border-b border-gray-100 dark:border-[#383845]">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Canvas Color</h3>
              <div className="flex flex-wrap gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => setCanvasBgColor(c.value)}
                    className={`w-6 h-6 rounded-full border shadow-sm flex items-center justify-center transition-transform hover:scale-110 ${canvasBgColor === c.value ? 'ring-2 ring-blue-500 dark:ring-[#00ffff] ring-offset-1 dark:ring-offset-gray-800' : 'border-gray-200 dark:border-gray-600'}`}
                    style={c.value !== 'default' ? { backgroundColor: c.value } : { background: 'conic-gradient(from 90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)' }}
                  >
                    {canvasBgColor === c.value && <Check size={12} className={c.value === '#1f2937' ? 'text-white' : 'text-gray-800'} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-[#383845] py-1">
              <a
                href="https://tarun11.in/"
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#343442] text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm transition-colors"
              >
                <User size={16} />
                Author
              </a>
              <button
                onClick={() => {
                  if (onDeleteCanvas) onDeleteCanvas();
                  else onReset();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-2 text-sm transition-colors"
              >
                <Trash2 size={16} />
                Delete Canvas
              </button>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={toggleTheme}
        className="p-2 bg-white dark:bg-[#232329] rounded-lg shadow-sm border border-gray-200 dark:border-[#383845] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#343442] flex items-center justify-center transition-colors"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </div>
  );
};

interface ControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoomScale: number;
  setZoomScale: React.Dispatch<React.SetStateAction<number>>;
}

export const Controls: React.FC<ControlsProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoomScale,
  setZoomScale,
}) => {
  return (
    <div className="fixed bottom-20 sm:bottom-4 right-4 flex flex-col sm:flex-row gap-2 z-10 transition-colors items-end sm:items-center pointer-events-none [&>*]:pointer-events-auto">
      <div className="flex gap-1 p-1 bg-white dark:bg-[#232329] rounded-lg shadow-md border border-gray-100 dark:border-[#383845] transition-colors">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#343442] rounded-md transition-colors flex items-center justify-center"
        >
          <Undo2 size={18} strokeWidth={2} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#343442] rounded-md transition-colors flex items-center justify-center"
        >
          <Redo2 size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-white dark:bg-[#232329] rounded-lg shadow-md border border-gray-100 dark:border-[#383845] transition-colors">
        <button
          onClick={() => setZoomScale(s => Math.max(0.1, s - 0.1))}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#343442] rounded-md transition-colors flex items-center justify-center"
        >
          <ZoomOut size={18} strokeWidth={2} />
        </button>
        
        <div className="flex justify-center items-center px-2 text-xs font-medium text-gray-700 dark:text-gray-300 w-12 cursor-pointer" onClick={() => setZoomScale(1)}>
          {Math.round(zoomScale * 100)}%
        </div>

        <button
          onClick={() => setZoomScale(s => Math.min(10, s + 0.1))}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#343442] rounded-md transition-colors flex items-center justify-center"
        >
          <ZoomIn size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
