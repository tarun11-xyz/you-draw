import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PALETTE = [
  { id: 'transparent', label: 'Transparent', shades: ['transparent', 'transparent', 'transparent', 'transparent', 'transparent'] },
  { id: 'gray', label: 'Gray', shades: ['#1e1e1e', '#343a40', '#868e96', '#ced4da', '#f8f9fa'] },
  { id: 'brown', label: 'Brown', shades: ['#4e342e', '#5d4037', '#795548', '#a1887f', '#d7ccc8'] },
  { id: 'teal', label: 'Teal', shades: ['#0b7285', '#0c8599', '#1098ad', '#20c997', '#63e6be'] },
  { id: 'blue', label: 'Blue', shades: ['#1864ab', '#1971c2', '#228be6', '#4dabf7', '#a5d8ff'] },
  { id: 'indigo', label: 'Indigo', shades: ['#3b5bdb', '#4c6ef5', '#5c7cfa', '#748ffc', '#bac8ff'] },
  { id: 'violet', label: 'Violet', shades: ['#5f3dc4', '#6741d9', '#7950f2', '#845ef7', '#b197fc'] },
  { id: 'grape', label: 'Grape', shades: ['#862e9c', '#9c36b5', '#ae3ec9', '#cc5de8', '#eebefa'] },
  { id: 'pink', label: 'Pink', shades: ['#a61e4d', '#c2255c', '#d6336c', '#e64980', '#faa2c1'] },
  { id: 'red', label: 'Red', shades: ['#c92a2a', '#e03131', '#f03e3e', '#ff6b6b', '#ffc9c9'] },
  { id: 'orange', label: 'Orange', shades: ['#d9480f', '#e8590c', '#fd7e14', '#ff922b', '#ffd8a8'] },
  { id: 'yellow', label: 'Yellow', shades: ['#e67700', '#f08c00', '#fdc500', '#ffe066', '#fff3bf'] },
  { id: 'lime', label: 'Lime', shades: ['#5c940d', '#66a80f', '#82c91e', '#a9e34b', '#d8f5a2'] },
  { id: 'green', label: 'Green', shades: ['#2b8a3e', '#2f9e44', '#40c057', '#51cf66', '#b2f2bb'] },
  { id: 'cyan', label: 'Cyan', shades: ['#0b7285', '#0c8599', '#15aabf', '#3bc9db', '#99e9f2'] }
];

export const FONT_FAMILIES =  ['Caveat, cursive', 'Inter, sans-serif', 'JetBrains Mono, monospace', 'Consolas, monospace', 'Comic Sans MS, Comic Sans, cursive', 'Georgia, serif', 'Impact, sans-serif'];

interface SettingsPanelProps {
  strokeColor: string;
  setStrokeColor: (c: string) => void;
  backgroundColor: string;
  setBackgroundColor: (c: string) => void;
  fillStyle: 'hachure' | 'cross-hatch' | 'solid';
  setFillStyle: (style: 'hachure' | 'cross-hatch' | 'solid') => void;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  setStrokeStyle: (style: 'solid' | 'dashed' | 'dotted') => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  roughness: number;
  setRoughness: (r: number) => void;
  opacity: number;
  setOpacity: (o: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onLayerAction: (actionType: 'front' | 'back' | 'forward' | 'backward') => void;
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


export const getFamilyAndShade = (hex: string) => {
  for (const f of PALETTE) {
    const idx = f.shades.indexOf(hex);
    if (idx !== -1) return { family: f, shadeIndex: idx };
  }
  return { family: PALETTE[1], shadeIndex: 0 };
};

const ColorPickerPopup = ({ color, onChange, onClose, anchorRect }: { color: string, onChange: (c: string) => void, onClose: () => void, anchorRect?: DOMRect }) => {
  const { family, shadeIndex } = getFamilyAndShade(color);
  const [localHex, setLocalHex] = React.useState(color.replace('#', ''));

  React.useEffect(() => {
    if (color !== 'transparent' && color !== '#' + localHex) {
      setLocalHex(color.replace('#', ''));
    }
  }, [color]);

  const customHex = color.startsWith('#') || color === 'transparent' ? color : '#000000';
  
  return (
    <div className="fixed z-50 bg-[#15151a] rounded-xl shadow-xl border border-[#383845] p-3 w-64 flex flex-col gap-4 animate-in fade-in zoom-in duration-200" style={{ top: anchorRect ? Math.max(16, Math.min(window.innerHeight - 300, Math.max(0, anchorRect.top))) : 0, left: anchorRect ? anchorRect.right + 12 : 0 }}>
      <div className="flex justify-between items-center relative">
         <span className="text-xs font-semibold text-gray-200">Colors</span>
         <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
         <div className="absolute top-1/2 -left-[18px] -translate-y-1/2 border-[6px] border-transparent border-r-[#383845]"></div>
         <div className="absolute top-1/2 -left-[17px] -translate-y-1/2 border-[6px] border-transparent border-r-[#232329]"></div>
      </div>
      
      <div className="grid grid-cols-5 gap-1.5">
        {PALETTE.map(f => (
          <button
            key={f.id}
            onClick={() => onChange(f.shades[shadeIndex])}
            title={f.label}
            className={`w-8 h-8 rounded-xl transition-transform hover:scale-110 flex items-center justify-center relative ${family.id === f.id ? 'ring-2 ring-offset-2 ring-offset-[#232329] ring-[#a5d8ff]' : ''}`}
            style={{ 
               background: f.id === 'transparent' ? 'repeating-conic-gradient(#495057 0% 25%, #343a40 0% 50%) 50% / 10px 10px' : f.shades[2] 
            }}
          >
            {f.id === 'gray' && f.shades[2] === '#868e96' && <div className="absolute inset-0 bg-gray-900 rounded-xl opacity-0" />}
          </button>
        ))}
      </div>

      <div className="h-[1px] w-full bg-[#383845]"></div>

      {family.id !== 'transparent' && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-200">Shades</span>
          <div className="flex justify-between">
            {family.shades.map((shade, i) => (
              <button
                key={shade}
                onClick={() => onChange(shade)}
                className={`w-9 h-9 rounded-xl transition-all flex flex-col items-center justify-center ${shadeIndex === i ? 'ring-2 ring-offset-2 ring-offset-[#232329] ring-[#a5d8ff]' : ''}`}
                style={{ backgroundColor: shade }}
              >
                 <span className={`text-[10px] flex items-center gap-0.5 ${i < 2 ? 'text-white/70' : 'text-black/70'}`}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>{i+1}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-gray-200">Hex code</span>
        <div className="flex bg-[#1a1a20] border border-[#383845] rounded-lg items-center px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#a5d8ff]">
          <span className="text-gray-500 mr-2">#</span>
          <input 
            type="text" 
            value={localHex}
            onChange={(e) => {
              const val = e.target.value;
              setLocalHex(val);
              if (val === 'transparent') {
                 onChange('transparent');
              } else if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                if (val.length === 6 || val.length === 3) {
                  onChange('#' + val);
                }
              }
            }}
            className="bg-transparent border-none text-gray-200 text-sm outline-none w-full font-mono"
            placeholder="000000"
          />
        </div>
      </div>
    </div>
  );
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  strokeColor,
  setStrokeColor,
  backgroundColor,
  setBackgroundColor,
  fillStyle,
  setFillStyle,
  strokeStyle,
  setStrokeStyle,
  strokeWidth,
  setStrokeWidth,
  roughness,
  setRoughness,
  opacity,
  setOpacity,
  onDuplicate,
  onDelete,
  onLayerAction,
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
  const [activeColorPicker, setActiveColorPicker] = useState<'stroke' | 'bg' | null>(null);

  const STROKE_QUICK = ['#1e1e1e', '#fa5252', '#40c057', '#228be6', '#fd7e14'];
  const BG_QUICK = ['transparent', '#c92a2a', '#2b8a3e', '#1864ab', '#e67700'];

  const getActiveFamily = (hex: string) => {
    for (const f of PALETTE) {
      const idx = f.shades.indexOf(hex);
      if (idx !== -1) return { family: f, shadeIndex: idx };
    }
    return { family: PALETTE[1], shadeIndex: 0 };
  };

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
        className="fixed top-16 sm:top-24 left-4 p-2 bg-white dark:bg-[#232329] rounded-xl shadow-md border border-gray-100 dark:border-[#383845] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#343442] z-10"
      >
        <ChevronRight size={20} />
      </button>
    );
  }

  const isTextSelected = activeTool === 'text';

  return (
    <div className="fixed top-16 sm:top-24 left-4 w-52 sm:w-60 bg-white dark:bg-[#15151a] rounded-xl shadow-md border border-gray-100 dark:border-[#2a2a35] flex flex-col z-10 transition-colors">
      <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-[#2a2a35]">
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Properties</span>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ChevronLeft size={18} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-4 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar touch-auto">



      {/* Stroke Color */}
      <div className="relative">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Stroke Color</span>
        <div className="flex gap-1.5 items-center">
          {STROKE_QUICK.map(color => (
            <button
              key={'quick-'+color}
              onClick={() => setStrokeColor(color)}
              className={`w-6 h-6 rounded-md relative overflow-hidden transition-transform ${strokeColor === color ? 'ring-2 ring-offset-2 ring-[#00ffff] dark:ring-offset-gray-800' : 'border border-gray-200 dark:border-gray-600 hover:scale-110'}`}
            >
              <div className="absolute inset-0" style={{ backgroundColor: color === '#1e1e1e' ? '' : color }} />
              {color === '#1e1e1e' && (
                <div className="absolute inset-0 bg-gray-900 dark:bg-white" />
              )}
            </button>
          ))}
          <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>
          <button
            onClick={() => setActiveColorPicker(activeColorPicker === 'stroke' ? null : 'stroke')}
            id="stroke-btn-anchor"
            className={`w-6 h-6 rounded-md relative flex items-center justify-center overflow-hidden transition-transform hover:scale-110 ${(activeColorPicker === 'stroke' || (!STROKE_QUICK.includes(strokeColor))) ? 'ring-2 ring-offset-2 ring-[#00ffff] dark:ring-offset-gray-800' : 'border border-gray-200 dark:border-gray-600'}`}
          >
             <div className="absolute inset-0" style={{ backgroundColor: strokeColor === '#1e1e1e' ? '' : strokeColor, background: strokeColor === 'transparent' ? 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 8px 8px' : strokeColor }} />
             {strokeColor === '#1e1e1e' && <div className="absolute inset-0 bg-gray-900 dark:bg-white" />}
             {!STROKE_QUICK.includes(strokeColor) && <div className="absolute inset-0 bg-black/10 dark:bg-white/10" />}
          </button>
        </div>
        {activeColorPicker === 'stroke' && (
          <ColorPickerPopup
             anchorRect={document.getElementById('stroke-btn-anchor')?.getBoundingClientRect()} 
             color={strokeColor} 
             onChange={(c) => setStrokeColor(c)} 
             onClose={() => setActiveColorPicker(null)} 
          />
        )}
      </div>

      {/* Background Color */}
      <div className="relative">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Background</span>
        <div className="flex gap-1.5 items-center">
          {BG_QUICK.map(color => (
            <button
              key={'quick-'+color}
              onClick={() => setBackgroundColor(color)}
              className={`w-6 h-6 rounded-md transition-transform ${backgroundColor === color ? 'ring-2 ring-offset-2 ring-[#00ffff] dark:ring-offset-gray-800' : 'border border-gray-200 dark:border-gray-600 hover:scale-110'}`}
              style={{ background: color === 'transparent' ? 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 8px 8px' : color }}
            />
          ))}
          <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>
          <button
            onClick={() => setActiveColorPicker(activeColorPicker === 'bg' ? null : 'bg')}
            id="bg-btn-anchor"
            className={`w-6 h-6 rounded-md relative flex items-center justify-center overflow-hidden transition-transform hover:scale-110 ${(activeColorPicker === 'bg' || (!BG_QUICK.includes(backgroundColor))) ? 'ring-2 ring-offset-2 ring-[#00ffff] dark:ring-offset-gray-800' : 'border border-gray-200 dark:border-gray-600'}`}
          >
             <div className="absolute inset-0" style={{ background: backgroundColor === 'transparent' ? 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 8px 8px' : backgroundColor }} />
             {!BG_QUICK.includes(backgroundColor) && <div className="absolute inset-0 bg-black/10 dark:bg-white/10" />}
          </button>
        </div>
        {activeColorPicker === 'bg' && (
          <ColorPickerPopup
             anchorRect={document.getElementById('bg-btn-anchor')?.getBoundingClientRect()} 
             color={backgroundColor} 
             onChange={(c) => setBackgroundColor(c)} 
             onClose={() => setActiveColorPicker(null)} 
          />
        )}
      </div>




      {!isTextSelected && (
        <>
          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Fill</span>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-[#1a1a20] p-1 rounded-lg">
              {(['hachure', 'cross-hatch', 'solid'] as const).map(fs => (
                <button
                  key={fs}
                  onClick={() => setFillStyle(fs)}
                  className={`flex-1 h-8 flex items-center justify-center rounded-md transition-colors font-medium text-xs ${fillStyle === fs ? 'bg-white dark:bg-[#343442] shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#404052]'}`}
                >
                  <div className="w-5 h-5 rounded overflow-hidden relative border border-gray-300 dark:border-gray-600">
                    {fs === 'hachure' && <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#ccc_2px,#ccc_4px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#555_2px,#555_4px)]" />}
                    {fs === 'cross-hatch' && <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#ccc_2px,#ccc_4px),repeating-linear-gradient(-45deg,transparent,transparent_2px,#ccc_2px,#ccc_4px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#555_2px,#555_4px),repeating-linear-gradient(-45deg,transparent,transparent_2px,#555_2px,#555_4px)]" />}
                    {fs === 'solid' && <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Stroke width</span>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-[#1a1a20] p-1 rounded-lg">
              {[2, 4, 8].map(w => (
                <button
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  className={`flex-1 h-8 flex items-center justify-center rounded-md transition-colors ${strokeWidth === w ? 'bg-white dark:bg-[#343442] shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-[#404052]'}`}
                >
                  <div className={`bg-gray-800 dark:bg-gray-200 ${w === 2 ? 'w-full h-0.5' : w === 4 ? 'w-full h-1' : 'w-full h-2'} rounded-full mx-2`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Stroke style</span>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-[#1a1a20] p-1 rounded-lg">
              {(['solid', 'dashed', 'dotted'] as const).map(ss => (
                <button
                  key={ss}
                  onClick={() => setStrokeStyle(ss)}
                  className={`flex-1 h-8 flex items-center justify-center rounded-md transition-colors ${strokeStyle === ss ? 'bg-white dark:bg-[#343442] shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-[#404052]'}`}
                >
                  <div className="w-10 flex items-center">
                    {ss === 'solid' && <div className="w-full h-[2px] bg-gray-800 dark:bg-gray-200" />}
                    {ss === 'dashed' && <div className="w-full h-[2px] bg-transparent border-t-2 border-dashed border-gray-800 dark:border-gray-200" />}
                    {ss === 'dotted' && <div className="w-full h-[2px] bg-transparent border-t-2 border-dotted border-gray-800 dark:border-gray-200" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Sloppiness</span>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-[#1a1a20] p-1 rounded-lg">
              {[0, 1, 2].map(r => (
                <button
                  key={r}
                  onClick={() => setRoughness(r)}
                  className={`flex-1 h-8 flex items-center justify-center rounded-md transition-colors ${roughness === r ? 'bg-white dark:bg-[#343442] shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-[#404052]'}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${r === 0 ? 'opacity-40' : r === 1 ? 'opacity-70' : 'opacity-100'} text-gray-800 dark:text-gray-200`}>
                    {r === 0 ? <line x1="4" y1="12" x2="20" y2="12" /> : r === 1 ? <path d="M4 12c4-4 8 4 12 0" /> : <path d="M4 12c3-6 5 6 8 0s5 6 8 0" />}
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Edges</span>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-[#1a1a20] p-1 rounded-lg">
              {(['sharp', 'round'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRoundness(r)}
                  className={`flex-1 h-8 flex items-center justify-center rounded-md font-medium text-xs transition-colors ${roundness === r ? 'bg-white dark:bg-[#343442] shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#404052]'}`}
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
              className="w-full bg-gray-50 dark:bg-[#1a1a20] border border-gray-200 dark:border-[#383845] text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-[#00ffff] focus:border-[#00ffff] block p-2"
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
              className="w-full bg-gray-50 dark:bg-[#1a1a20] border border-gray-200 dark:border-[#383845] text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-[#00ffff] focus:border-[#00ffff] block p-2"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Font Size</span>
            <div className="flex gap-2">
              <div className="flex-1 flex gap-1.5 bg-gray-50 dark:bg-[#1a1a20] p-1 rounded-lg">
                {[16, 24, 32, 48].map(s => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className={`flex-1 h-8 flex items-center justify-center rounded-md font-medium text-xs transition-colors ${fontSize === s ? 'bg-white dark:bg-[#343442] shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#404052]'}`}
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
                className="w-[60px] h-10 bg-gray-50 dark:bg-[#1a1a20] border border-gray-200 dark:border-[#383845] text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-[#00ffff] focus:border-[#00ffff] block px-2 text-center"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Text Align</span>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-[#1a1a20] p-1 rounded-lg">
              {(['left', 'center', 'right'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setTextAlign(a)}
                  className={`flex-1 h-8 flex items-center justify-center rounded-md font-medium text-xs transition-colors capitalize ${textAlign === a ? 'bg-white dark:bg-[#343442] shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#404052]'}`}
                >
                  {a.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Opacity</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-[#343442] rounded-lg appearance-none cursor-pointer accent-[#232329] dark:accent-[#808092]"
          />
        </div>
        <div className="flex justify-between text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Layers</span>
        <div className="flex gap-1.5 bg-gray-50 dark:bg-[#1a1a20] p-1 rounded-lg">
          <button onClick={() => onLayerAction('back')} className="flex-1 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-[#404052] transition-colors" title="Send to back" disabled={activeTool !== 'selection'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300"><path d="M4 22h14a2 2 0 0 0 2-2V6l-3-3H6a2 2 0 0 0-2 2v17Z"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg></button>
          <button onClick={() => onLayerAction('backward')} className="flex-1 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-[#404052] transition-colors" title="Send backward" disabled={activeTool !== 'selection'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300"><path d="M12 21V3"/><path d="m5 14 7 7 7-7"/></svg></button>
          <button onClick={() => onLayerAction('forward')} className="flex-1 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-[#404052] transition-colors" title="Bring forward" disabled={activeTool !== 'selection'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300"><path d="M12 21V3"/><path d="m5 10 7-7 7 7"/></svg></button>
          <button onClick={() => onLayerAction('front')} className="flex-1 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-[#404052] transition-colors" title="Bring to front" disabled={activeTool !== 'selection'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300"><path d="M4 2h14a2 2 0 0 1 2 2v14l-3 3H6a2 2 0 0 1-2-2V2Z"/><path d="M12 6v6"/><path d="m9 9 3-3 3 3"/></svg></button>
        </div>
      </div>

      <div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Actions</span>
        <div className="flex gap-1.5 bg-gray-50 dark:bg-[#1a1a20] p-1 rounded-lg">
          <button onClick={onDuplicate} className="flex-1 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-[#404052] transition-colors" title="Duplicate" disabled={activeTool !== 'selection'}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>
          <button onClick={onDelete} className="flex-1 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-[#404052] transition-colors text-red-500" title="Delete" disabled={activeTool !== 'selection'}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
        </div>
      </div>

    </div>
    </div>
  );
};
