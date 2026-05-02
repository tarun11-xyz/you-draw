import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import rough from 'roughjs/bin/rough';
import { CanvasElement, ToolType, Point } from '../types';
import { createElement, drawElement, getElementAtPosition, adjustElementCoordinates, cursorForPosition } from '../utils';
import { useHistory } from '../useHistory';
import { Toolbar } from './Toolbar';
import { Sidebar, Controls } from './Sidebar';
import { SettingsPanel } from './SettingsPanel';

export const Canvas: React.FC = () => {
  const [elements, setElements, undo, redo, canUndo, canRedo] = useHistoryWrapper();
  const [actionState, setActionState] = useState<'none' | 'drawing' | 'moving' | 'resizing' | 'writing' | 'panning' | 'selecting_area' | 'erasing'>('none');
  const actionRef = useRef(actionState);
  const setAction = (newAction: any) => {
    const val = typeof newAction === 'function' ? newAction(actionRef.current) : newAction;
    actionRef.current = val;
    setActionState(val);
  };
  const action = actionState;
  const [toolState, setToolState] = useState<ToolType>('selection');
  const [selectedElement, setSelectedElement] = useState<(CanvasElement & { xOffset?: number; yOffset?: number; position?: string }) | null>(null);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const startPanMousePositionRef = useRef<Point>({ x: 0, y: 0 });
  const [lastPointerDown, setLastPointerDown] = useState<Point>({ x: 0, y: 0 });
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [strokeColor, setStrokeColor] = useState<string>('#1e1e1e');
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent');
  const [fillStyle, setFillStyle] = useState<'hachure' | 'cross-hatch' | 'solid'>('solid');
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [roughness, setRoughness] = useState<number>(1);
  const [opacity, setOpacity] = useState<number>(100);
  const [roundness, setRoundness] = useState<'sharp' | 'round'>('round');
  const [fontFamily, setFontFamily] = useState<string>('Caveat, cursive');
  const [fontSize, setFontSize] = useState<number>(32);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [link, setLink] = useState<string>('');

  const setTool = (newTool: ToolType) => {
    if (newTool === 'text') {
       // Find the center of the viewport
       const centerX = (window.innerWidth / 2) / zoomScale - panOffset.x;
       const centerY = (window.innerHeight / 2) / zoomScale - panOffset.y;
       const id = Date.now().toString();
              const element = createElement(theme, id, centerX, centerY, centerX, centerY, 'text', strokeColor, backgroundColor, strokeWidth, roundness, undefined, fontFamily, fontSize, textAlign, fillStyle, strokeStyle, roughness, opacity);
       if (link) element.link = link;
       setElements((prevState: CanvasElement[]) => [...prevState, element]);
       setSelectedElement(element);
       setAction('writing');
       setToolState('selection');
    } else {
       setToolState(newTool);
    }
  };
  const tool = toolState;

  const [canvasBgColor, setCanvasBgColor] = useState<string>('default');
  const [canvasPattern, setCanvasPattern] = useState<'dots' | 'grid' | 'isometric' | 'lines' | 'none'>('dots');

  const updateSetting = (key: keyof CanvasElement, value: any, setter: any) => {
    setter(value);
    if (selectedElement) {
      if (selectedElements.length > 1) {
        setElements(elements.map(el => selectedElements.some(s => s.id === el.id) ? { ...el, [key]: value } as any : el));
        setSelectedElements(prev => prev.map(el => ({ ...el, [key]: value } as any)));
      } else {
        const updated = { ...selectedElement, [key]: value };
        const el = createElement(theme, updated.id, updated.x1, updated.y1, updated.x2, updated.y2, updated.type, updated.strokeColor, updated.backgroundColor, updated.strokeWidth, updated.roundness, updated.imageUrl, updated.fontFamily, updated.fontSize, updated.textAlign, updated.fillStyle, updated.strokeStyle, updated.roughness, updated.opacity);
        if (updated.text) el.text = updated.text;
        if (updated.link) el.link = updated.link;
        if (updated.points) el.points = updated.points;
        setSelectedElement(el);
        setElements(elements.map(e => e.id === el.id ? el : e));
      }
    }
  };

  const handleStrokeColorChange = (c: string) => updateSetting('strokeColor', c, setStrokeColor);
  const handleBackgroundColorChange = (c: string) => updateSetting('backgroundColor', c, setBackgroundColor);
  const handleStrokeWidthChange = (w: number) => updateSetting('strokeWidth', w, setStrokeWidth);
  const handleRoughnessChange = (r: number) => updateSetting('roughness', r, setRoughness);
  const handleOpacityChange = (o: number) => updateSetting('opacity', o, setOpacity);
  const handleFillStyleChange = (s: string) => updateSetting('fillStyle', s, setFillStyle);
  const handleStrokeStyleChange = (s: string) => updateSetting('strokeStyle', s, setStrokeStyle);
  const handleRoundnessChange = (r: string) => updateSetting('roundness', r, setRoundness);
  const handleFontFamilyChange = (f: string) => updateSetting('fontFamily', f, setFontFamily);
  const handleFontSizeChange = (s: number) => updateSetting('fontSize', s, setFontSize);
  const handleTextAlignChange = (a: string) => updateSetting('textAlign', a, setTextAlign);
  const handleLinkChange = (l: string) => updateSetting('link', l, setLink);
  
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [selectionBox, setSelectionBox] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
  const [selectedElements, setSelectedElements] = useState<CanvasElement[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setElements(prevElements => {
      let changed = false;
      const newElements = prevElements.map(el => {
        let newStroke = el.strokeColor;
        let newBg = el.backgroundColor;
        
        if (theme === 'dark') {
          if (el.strokeColor === '#1e1e1e') { newStroke = '#ffffff'; changed = true; }
          if (el.backgroundColor === '#1e1e1e') { newBg = '#ffffff'; changed = true; }
        } else {
          if (el.strokeColor === '#ffffff') { newStroke = '#1e1e1e'; changed = true; }
          if (el.backgroundColor === '#ffffff') { newBg = '#1e1e1e'; changed = true; }
        }

        if (newStroke !== el.strokeColor || newBg !== el.backgroundColor) {
          const newEl = createElement(theme, el.id, el.x1, el.y1, el.x2, el.y2, el.type, newStroke, newBg, el.strokeWidth, el.roundness, el.imageUrl, el.fontFamily, el.fontSize, el.textAlign, el.fillStyle, el.strokeStyle, el.roughness, el.opacity);
          if (el.text) newEl.text = el.text;
          if (el.points) newEl.points = el.points;
          return newEl;
        }
        return el;
      });
      return changed ? newElements : prevElements;
    }, true);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;

      switch(e.key) {
        case '1': setTool('selection'); break;
        case '2': setTool('hand'); break;
        case '3': setTool('rectangle'); break;
        case '4': setTool('diamond'); break;
        case '5': setTool('ellipse'); break;
        case 't': setTool('triangle'); break;
        case '6': setTool('arrow'); break;
        case '7': setTool('line'); break;
        case '8': setTool('pencil'); break;
        case '9': setTool('text'); break;
        case 'f': setTool('frame'); break;
        case '0': setTool('image'); fileInputRef.current?.click(); break;
        case 'e': setTool('eraser'); break;
        case 'z': if (e.ctrlKey || e.metaKey) undo(); break;
        case 'y': if (e.ctrlKey || e.metaKey) redo(); break;
        case 'Delete':
        case 'Backspace':
          handleDelete();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Scale for retina displays
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio * zoomScale, window.devicePixelRatio * zoomScale);
    ctx.clearRect(0, 0, canvas.width / zoomScale, canvas.height / zoomScale);

    const roughCanvas = rough.canvas(canvas);

    // Apply pan offset
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);

    elements.forEach(element => {
      if (action === 'writing' && selectedElement && selectedElement.id === element.id) return;
      drawElement(roughCanvas, ctx, element);
    });
    
    if (selectedElement && tool === 'selection' && action !== 'writing') {
      const { x1, y1, x2, y2 } = selectedElement;
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1 / zoomScale;
      
      const minX = Math.min(x1, x2) - 5 / zoomScale;
      const minY = Math.min(y1, y2) - 5 / zoomScale;
      const widthBox = Math.max(x1, x2) - Math.min(x1, x2) + 10 / zoomScale;
      const heightBox = Math.max(y1, y2) - Math.min(y1, y2) + 10 / zoomScale;
      
      ctx.strokeRect(minX, minY, widthBox, heightBox);
      
      const renderHandle = (x: number, y: number) => {
        ctx.fillStyle = '#fff';
        const handleSize = 8 / zoomScale;
        ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
        ctx.strokeRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
      };
      
      renderHandle(minX, minY);
      renderHandle(minX + widthBox, minY);
      renderHandle(minX, minY + heightBox);
      renderHandle(minX + widthBox, minY + heightBox);
    }
    
    if (selectedElements.length > 0 && tool === 'selection') {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1 / zoomScale;
      
      selectedElements.forEach(el => {
        const minX = Math.min(el.x1, el.x2) - 2 / zoomScale;
        const minY = Math.min(el.y1, el.y2) - 2 / zoomScale;
        const widthBox = Math.max(el.x1, el.x2) - Math.min(el.x1, el.x2) + 4 / zoomScale;
        const heightBox = Math.max(el.y1, el.y2) - Math.min(el.y1, el.y2) + 4 / zoomScale;
        ctx.strokeRect(minX, minY, widthBox, heightBox);
      });
    }

    if (selectionBox) {
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.5)';
      ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
      ctx.lineWidth = 1 / zoomScale;
      const minX = Math.min(selectionBox.x1, selectionBox.x2);
      const minY = Math.min(selectionBox.y1, selectionBox.y2);
      const widthBox = Math.max(selectionBox.x1, selectionBox.x2) - minX;
      const heightBox = Math.max(selectionBox.y1, selectionBox.y2) - minY;
      ctx.fillRect(minX, minY, widthBox, heightBox);
      ctx.strokeRect(minX, minY, widthBox, heightBox);
    }
    
    ctx.restore();
  }, [elements, action, selectedElement, selectedElements, selectionBox, panOffset, tool, zoomScale]);

  useEffect(() => {
    const handleUp = () => {
      if (actionRef.current === 'writing') return;
      setAction('none');
    };
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, []);

  const zoomRef = useRef(zoomScale);
  const panRef = useRef(panOffset);
  
  useEffect(() => { zoomRef.current = zoomScale; }, [zoomScale]);
  useEffect(() => { panRef.current = panOffset; }, [panOffset]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.target !== canvasRef.current) return;
      e.preventDefault();
      // user wants normal mouse scroll to zoom from the middle
      if (!e.ctrlKey && !e.metaKey) {
        const delta = e.deltaY;
        const prevZoom = zoomRef.current;
        const newZoom = Math.min(Math.max(0.1, prevZoom - delta / 1000), 10);
        
        if (newZoom !== prevZoom) {
          const pointerX = e.clientX;
          const pointerY = e.clientY;
          
          const newPan = {
            x: panRef.current.x + (pointerX / newZoom) - (pointerX / prevZoom),
            y: panRef.current.y + (pointerY / newZoom) - (pointerY / prevZoom)
          };
          
          zoomRef.current = newZoom;
          panRef.current = newPan;
          
          setZoomScale(newZoom);
          setPanOffset(newPan);
        }
      } else {
        // With ctrl/meta, pan.
        const prevZoom = zoomRef.current;
        const newPan = { 
          x: panRef.current.x - e.deltaX / prevZoom, 
          y: panRef.current.y - e.deltaY / prevZoom 
        };
        panRef.current = newPan;
        setPanOffset(newPan);
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let initialDistance: number | null = null;
    let initialZoom: number = 1;
    let initialPan = { x: 0, y: 0 };
    let initialCenter = { x: 0, y: 0 };

    const getDistance = (touches: TouchList) => {
      const t1 = touches[0];
      const t2 = touches[1];
      return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    };

    const getCenter = (touches: TouchList) => {
      const t1 = touches[0];
      const t2 = touches[1];
      return { 
        x: (t1.clientX + t2.clientX) / 2, 
        y: (t1.clientY + t2.clientY) / 2 
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getDistance(e.touches);
        initialZoom = zoomRef.current;
        initialPan = { ...panRef.current };
        initialCenter = getCenter(e.touches);
        
        if (actionRef.current === 'drawing') {
            setElements(prev => prev.slice(0, -1)); // Cancel drawing shape
        }
        setAction('none');
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance !== null) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        const currentCenter = getCenter(e.touches);
        
        const scaleChange = currentDistance / initialDistance;
        let newZoom = initialZoom * scaleChange;
        newZoom = Math.min(Math.max(0.1, newZoom), 10);

        const newPan = {
          x: initialPan.x + (currentCenter.x / newZoom) - (initialCenter.x / initialZoom),
          y: initialPan.y + (currentCenter.y / newZoom) - (initialCenter.y / initialZoom)
        };
        
        zoomRef.current = newZoom;
        panRef.current = newPan;
        
        setZoomScale(newZoom);
        setPanOffset(newPan);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDistance = null;
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const getMouseCoordinates = (event: React.PointerEvent) => {
    // Canvas transform is scale(zoom) then translate(pan.x, pan.y)
    // So point in canvas = clientPoint / zoom - panOffset
    const clientX = event.clientX / zoomScale - panOffset.x;
    const clientY = event.clientY / zoomScale - panOffset.y;
    return { clientX, clientY };
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (actionRef.current === 'writing') return;
    
    const { clientX, clientY } = getMouseCoordinates(event);
    setLastPointerDown({ x: clientX, y: clientY });

    if (tool === 'hand' || event.button === 1 || (event.button === 0 && (event.altKey || event.ctrlKey || event.metaKey))) {
      setAction('panning');
      startPanMousePositionRef.current = { x: event.clientX, y: event.clientY };
      return;
    }

    const hitElement = getElementAtPosition(clientX, clientY, elements);

    if (tool === 'eraser') {
      setAction('erasing');
      if (hitElement) {
        setElements(prev => prev.filter(el => el.id !== hitElement.id));
      }
      return;
    }

    if (tool === 'selection') {
      if (hitElement) {
        if (hitElement.strokeColor) setStrokeColor(hitElement.strokeColor);
        if (hitElement.backgroundColor) setBackgroundColor(hitElement.backgroundColor);
        if (hitElement.strokeWidth) setStrokeWidth(hitElement.strokeWidth);
        if (hitElement.roundness) setRoundness(hitElement.roundness);
        if (hitElement.fontFamily) setFontFamily(hitElement.fontFamily);
        if (hitElement.fontSize) setFontSize(hitElement.fontSize);
        if (hitElement.textAlign) setTextAlign(hitElement.textAlign);
        
        if (hitElement.type === 'pencil' || hitElement.type === 'line' || hitElement.type === 'arrow') {
           const xOffset = clientX - hitElement.x1;
           const yOffset = clientY - hitElement.y1;
           setSelectedElement({ ...hitElement, xOffset, yOffset });
        } else {
           const offsetX = clientX - hitElement.x1;
           const offsetY = clientY - hitElement.y1;
           setSelectedElement({ ...hitElement, xOffset: offsetX, yOffset: offsetY });
        }
        setElements(prevState => prevState); // Ensure state isn't overwritten
        
        if (hitElement.position === 'inside') {
          // If moving a frame, auto-select all enclosed elements for group moving
          if (hitElement.type === 'frame' && !selectedElements.some(e => e.id === hitElement.id)) {
             const minX = Math.min(hitElement.x1, hitElement.x2);
             const maxX = Math.max(hitElement.x1, hitElement.x2);
             const minY = Math.min(hitElement.y1, hitElement.y2);
             const maxY = Math.max(hitElement.y1, hitElement.y2);

             const containedElements = elements.filter(el => {
                if (el.id === hitElement.id) return false;
                const eMinX = Math.min(el.x1, el.x2);
                const eMaxX = Math.max(el.x1, el.x2);
                const eMinY = Math.min(el.y1, el.y2);
                const eMaxY = Math.max(el.y1, el.y2);
                return eMinX >= minX && eMaxX <= maxX && eMinY >= minY && eMaxY <= maxY;
             });
             setSelectedElements([hitElement, ...containedElements]);
          }
          setAction('moving');
        } else {
          setAction('resizing');
        }
      } else {
        setSelectedElement(null);
        setSelectedElements([]);
        setAction('selecting_area');
        setSelectionBox({ x1: clientX, y1: clientY, x2: clientX, y2: clientY });
      }
    } else if (tool !== 'image') {
      const id = Date.now().toString();
            const element = createElement(theme, id, clientX, clientY, clientX, clientY, tool, strokeColor, backgroundColor, strokeWidth, roundness, undefined, fontFamily, fontSize, textAlign, fillStyle, strokeStyle, roughness, opacity);
      
      setElements((prevState: CanvasElement[]) => [...prevState, element]);
      setSelectedElement(element);
      
      if (tool === 'text') {
        setAction('writing');
        setTool('selection');
      } else {
        setAction('drawing');
      }
    }
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const { clientX, clientY } = getMouseCoordinates(event);
    
    if (actionRef.current === 'panning') {
      const deltaX = event.clientX - startPanMousePositionRef.current.x;
      const deltaY = event.clientY - startPanMousePositionRef.current.y;
      const newPan = {
        x: panRef.current.x + deltaX / zoomScale,
        y: panRef.current.y + deltaY / zoomScale
      };
      panRef.current = newPan;
      setPanOffset(newPan);
      startPanMousePositionRef.current = { x: event.clientX, y: event.clientY };
      return;
    }

    if (tool === 'eraser') {
      if (canvasRef.current) {
        // SVG eraser icon
        canvasRef.current.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'/><path d='M22 21H7'/><path d='m5 11 9 9'/></svg>") 0 24, auto`;
      }
    } else if (tool === 'selection' || tool === 'hand') {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element && element.type === 'text' && element.link && (tool === 'hand' || event.ctrlKey || event.metaKey || event.altKey)) {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'pointer';
        }
      } else if (tool === 'selection') {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = element ? cursorForPosition(element.position!) : 'default';
        }
      } else if (tool === 'hand') {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = actionRef.current === 'panning' ? 'grabbing' : 'grab';
        }
      }
    } else {
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'crosshair';
      }
    }

    if (actionRef.current === 'erasing') {
      setElements(prev => {
        const element = getElementAtPosition(clientX, clientY, prev);
        if (element) {
          return prev.filter(el => el.id !== element.id);
        }
        return prev;
      });
      return;
    }

    if (actionRef.current === 'selecting_area' && selectionBox) {
      setSelectionBox({ ...selectionBox, x2: clientX, y2: clientY });
      return;
    }

    if (actionRef.current === 'drawing' && selectedElement) {
      const index = elements.length - 1;
      const { x1, y1, strokeColor, backgroundColor, strokeWidth, roundness, imageUrl } = elements[index];
      
      if (tool === 'pencil') {
        const newPoints = [...(elements[index].points || []), { x: clientX, y: clientY }];
        const element = { ...elements[index], points: newPoints };
        const elementsCopy = [...elements];
        elementsCopy[index] = element;
        setElements(elementsCopy, true);
      } else {
        const element = createElement(theme, selectedElement.id, x1, y1, clientX, clientY, tool, strokeColor, backgroundColor, strokeWidth, roundness, imageUrl, selectedElement?.fontFamily || fontFamily, selectedElement?.fontSize || fontSize, selectedElement?.textAlign || textAlign, selectedElement?.fillStyle || fillStyle, selectedElement?.strokeStyle || strokeStyle, selectedElement?.roughness ?? roughness, selectedElement?.opacity ?? opacity);
        const elementsCopy = [...elements];
        elementsCopy[index] = element;
        setElements(elementsCopy, true);
      }
    } else if (actionRef.current === 'moving' && selectedElement) {
      const isMultiMove = selectedElements.length > 1 && selectedElements.some(el => el.id === selectedElement.id);
      
      if (isMultiMove) {
        // Here selectedElement and selectedElements reflect the state AT THE START of the drag.
        // clientX - xOffset gives us the intended newX1 for selectedElement.
        const intendedNewX1 = clientX - (selectedElement.xOffset || 0);
        const intendedNewY1 = clientY - (selectedElement.yOffset || 0);
        const deltaX = intendedNewX1 - selectedElement.x1;
        const deltaY = intendedNewY1 - selectedElement.y1;
        
        const elementsCopy = [...elements];
        selectedElements.forEach(selEl => {
          const index = elementsCopy.findIndex(el => el.id === selEl.id);
          if (index === -1) return;
          const movingElement = elementsCopy[index];
          
          if (selEl.type === 'pencil' && selEl.points) {
            const newPoints = selEl.points.map(p => ({
              x: p.x + deltaX,
              y: p.y + deltaY
            }));
            elementsCopy[index] = { ...selEl, points: newPoints, x1: selEl.x1 + deltaX, y1: selEl.y1 + deltaY, x2: selEl.x2 + deltaX, y2: selEl.y2 + deltaY };
          } else {
            const width = selEl.x2 - selEl.x1;
            const height = selEl.y2 - selEl.y1;
            const newX1 = selEl.x1 + deltaX;
            const newY1 = selEl.y1 + deltaY;
            const text = selEl.text;
            const linkProp = selEl.link;
            const element = createElement(theme, selEl.id, newX1, newY1, newX1 + width, newY1 + height, selEl.type as ToolType, selEl.strokeColor, selEl.backgroundColor, selEl.strokeWidth, selEl.roundness, selEl.imageUrl, selEl.fontFamily, selEl.fontSize, selEl.textAlign, selEl.fillStyle, selEl.strokeStyle, selEl.roughness, selEl.opacity);
            if (text) element.text = text;
            if (linkProp) element.link = linkProp;
            elementsCopy[index] = element;
          }
        });
        
        setElements(elementsCopy, true);
        
      } else if (selectedElement.type === 'pencil' && selectedElement.points) {
        const newPoints = selectedElement.points.map(p => ({
          x: clientX - (selectedElement.xOffset || 0) + (p.x - selectedElement.x1),
          y: clientY - (selectedElement.yOffset || 0) + (p.y - selectedElement.y1)
        }));
        
        const elementsCopy = [...elements];
        const index = elementsCopy.findIndex(el => el.id === selectedElement.id);
        const movingElement = elementsCopy[index];
        const newX1 = clientX - (selectedElement.xOffset || 0);
        const newY1 = clientY - (selectedElement.yOffset || 0);
        const newX2 = newX1 + (movingElement.x2 - movingElement.x1);
        const newY2 = newY1 + (movingElement.y2 - movingElement.y1);
        
        elementsCopy[index] = { ...movingElement, points: newPoints, x1: newX1, y1: newY1, x2: newX2, y2: newY2 };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, x2, y1, y2, type, strokeColor, backgroundColor, strokeWidth, roundness, imageUrl } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const newX1 = clientX - (selectedElement.xOffset || 0);
        const newY1 = clientY - (selectedElement.yOffset || 0);
        const text = selectedElement.text;
        const linkProp = selectedElement.link;
        const element = createElement(theme, id, newX1, newY1, newX1 + width, newY1 + height, type as ToolType, strokeColor, backgroundColor, strokeWidth, roundness, imageUrl, selectedElement?.fontFamily, selectedElement?.fontSize, selectedElement?.textAlign, selectedElement?.fillStyle, selectedElement?.strokeStyle, selectedElement?.roughness, selectedElement?.opacity);
        if (text) element.text = text;
        if (linkProp) element.link = linkProp;
        const elementsCopy = [...elements];
        const index = elementsCopy.findIndex(el => el.id === id);
        elementsCopy[index] = element;
        setElements(elementsCopy, true);
      }
    } else if (actionRef.current === 'resizing' && selectedElement) {
      const { id, type, position, strokeColor, backgroundColor, strokeWidth, roundness, imageUrl, ...coordinates } = selectedElement;
      let { x1, y1, x2, y2 } = coordinates;
      if (position === 'tl' || position === 'start') {
        x1 = clientX;
        y1 = clientY;
      } else if (position === 'tr') {
        x2 = clientX;
        y1 = clientY;
      } else if (position === 'bl') {
        x1 = clientX;
        y2 = clientY;
      } else if (position === 'br' || position === 'end') {
        x2 = clientX;
        y2 = clientY;
      }

      let fontSize = selectedElement.fontSize;
      if (type === 'text') {
         const oldWidth = Math.abs(selectedElement.x2 - selectedElement.x1);
         const oldHeight = Math.abs(selectedElement.y2 - selectedElement.y1);
         const oldDiagonal = Math.sqrt(oldWidth * oldWidth + oldHeight * oldHeight);
         
         let oppX = selectedElement.x1;
         let oppY = selectedElement.y1;
         if (position === 'tl' || position === 'start') { oppX = selectedElement.x2; oppY = selectedElement.y2; }
         else if (position === 'tr') { oppX = selectedElement.x1; oppY = selectedElement.y2; }
         else if (position === 'bl') { oppX = selectedElement.x2; oppY = selectedElement.y1; }
         else if (position === 'br' || position === 'end') { oppX = selectedElement.x1; oppY = selectedElement.y1; }
         
         const newDiagonal = Math.sqrt(Math.pow(clientX - oppX, 2) + Math.pow(clientY - oppY, 2));

         if (oldDiagonal > 0) {
           const scale = newDiagonal / oldDiagonal;
           fontSize = (fontSize || 32) * scale;
           fontSize = Math.max(8, Math.min(400, fontSize));
           
           // Based on the clamped fontSize, we recompute the exact scale
           // so that the bounding box (x2, y2) perfectly matches the clamped size
           const effectiveScale = fontSize / (selectedElement.fontSize || 32);
           
           const newWidth = oldWidth * effectiveScale;
           const newHeight = oldHeight * effectiveScale;
           
           const signX = Math.sign(selectedElement.x2 - selectedElement.x1) || 1;
           const signY = Math.sign(selectedElement.y2 - selectedElement.y1) || 1;
           
           if (position === 'tl') {
             x1 = selectedElement.x2 - newWidth * signX;
             y1 = selectedElement.y2 - newHeight * signY;
           } else if (position === 'tr') {
             x2 = selectedElement.x1 + newWidth * signX;
             y1 = selectedElement.y2 - newHeight * signY;
           } else if (position === 'bl') {
             x1 = selectedElement.x2 - newWidth * signX;
             y2 = selectedElement.y1 + newHeight * signY;
           } else if (position === 'br') {
             x2 = selectedElement.x1 + newWidth * signX;
             y2 = selectedElement.y1 + newHeight * signY;
           }
         }
      }
      
      const elementsCopy = [...elements];
      const index = elementsCopy.findIndex(el => el.id === id);
      const element = createElement(theme, id, x1, y1, x2, y2, type as ToolType, strokeColor, backgroundColor, strokeWidth, roundness, imageUrl, selectedElement?.fontFamily, fontSize, selectedElement?.textAlign, selectedElement?.fillStyle || fillStyle, selectedElement?.strokeStyle || strokeStyle, selectedElement?.roughness ?? roughness, selectedElement?.opacity ?? opacity);
      if (selectedElement.text) element.text = selectedElement.text;
      if (selectedElement.link) element.link = selectedElement.link;
      elementsCopy[index] = element;
      setElements(elementsCopy, true);
    }
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    const { clientX, clientY } = getMouseCoordinates(event);
    
    // Check for link click
    if (Math.abs(clientX - lastPointerDown.x) < 2 && Math.abs(clientY - lastPointerDown.y) < 2) {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element && element.type === 'text' && element.link) {
        if (tool === 'hand' || event.ctrlKey || event.metaKey || event.altKey) {
           window.open(element.link.startsWith('http') ? element.link : `https://${element.link}`, '_blank');
           // Don't change action State so we don't select it unexpectedly if in hand tool
           if (tool === 'hand') return; 
        }
      }
    }

    if (actionRef.current === 'selecting_area') {
      if (selectionBox) {
        const minX = Math.min(selectionBox.x1, selectionBox.x2);
        const maxX = Math.max(selectionBox.x1, selectionBox.x2);
        const minY = Math.min(selectionBox.y1, selectionBox.y2);
        const maxY = Math.max(selectionBox.y1, selectionBox.y2);
        
        const selected = elements.filter(el => {
          const elMinX = Math.min(el.x1, el.x2);
          const elMaxX = Math.max(el.x1, el.x2);
          const elMinY = Math.min(el.y1, el.y2);
          const elMaxY = Math.max(el.y1, el.y2);
          return elMinX >= minX && elMaxX <= maxX && elMinY >= minY && elMaxY <= maxY;
        });
        
        setSelectedElements(selected);
      }
      setSelectionBox(null);
      setAction('none');
      return;
    }

    if (actionRef.current === 'drawing' || actionRef.current === 'resizing' || actionRef.current === 'moving') {
      const index = elements.length - 1;
      const element = elements[actionRef.current !== 'drawing' && selectedElement ? elements.findIndex(e => e.id === selectedElement.id) : index];
      if (element && element.type !== 'pencil' && element.type !== 'text') {
         const adjustedElement = adjustElementCoordinates(element);
         const elementsCopy = [...elements];
         const elIndex = actionRef.current !== 'drawing' && selectedElement ? elements.findIndex(e => e.id === selectedElement.id) : index;
         elementsCopy[elIndex] = adjustedElement;
         setElements(elementsCopy, true);
         
         if (selectedElement) {
            setSelectedElement({ ...adjustedElement, xOffset: selectedElement.xOffset, yOffset: selectedElement.yOffset });
         }
      } else if (element && selectedElement) {
         setSelectedElement({ ...element, xOffset: selectedElement.xOffset, yOffset: selectedElement.yOffset });
      }
      
      if (selectedElements.length > 1) {
         setSelectedElements(elements.filter(el => selectedElements.some(s => s.id === el.id)));
      }
      
      if (actionRef.current === 'drawing') setElements(elements); // Commit for history
    }
    if (actionRef.current !== 'writing') setAction('none');
  };

  const handleTextBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!selectedElement) return;
    const text = e.target.value;
    const elementsCopy = [...elements];
    const index = elementsCopy.findIndex(el => el.id === selectedElement.id);
    if (text && text.trim() !== '') {
      const el = elementsCopy[index];
      // compute approx width/height based on text length and newlines
      const lines = text.split('\n');
      const maxLineLength = Math.max(...lines.map(l => l.length));
      const width = Math.max(maxLineLength * (el.fontSize || 32) * 0.6, 20);
      const height = lines.length * (el.fontSize || 32) * 1.2;

      elementsCopy[index] = { 
        ...el, 
        text, 
        x2: el.x1 + width,
        y2: el.y1 + height 
      };
      setElements(elementsCopy, true);
    } else {
      elementsCopy.splice(index, 1);
      setElements(elementsCopy, true);
    }
    setAction('none');
    setSelectedElement(null);
  };

  const exportCanvas = () => {
    // Determine bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach(el => {
      const eMinX = Math.min(el.x1, el.x2);
      const eMinY = Math.min(el.y1, el.y2);
      const eMaxX = Math.max(el.x1, el.x2);
      const eMaxY = Math.max(el.y1, el.y2);
      if (eMinX < minX) minX = eMinX;
      if (eMinY < minY) minY = eMinY;
      if (eMaxX > maxX) maxX = eMaxX;
      if (eMaxY > maxY) maxY = eMaxY;
      
      if (el.points) {
        el.points.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });
      }
    });
    
    if (minX === Infinity) return;
    
    const padding = 20;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    
    const exportCanv = document.createElement('canvas');
    exportCanv.width = width * 2;
    exportCanv.height = height * 2;
    const ctx = exportCanv.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(2, 2);
    ctx.translate(-minX + padding, -minY + padding);
    
    // Background
    ctx.fillStyle = getCanvasBackground();
    ctx.fillRect(minX - padding, minY - padding, width, height);
    
    // Pattern
    if (canvasPattern === 'dots') {
      ctx.fillStyle = theme === 'dark' ? 'rgba(55, 65, 81, 0.4)' : 'rgba(209, 213, 219, 0.5)';
      for (let x = (minX - padding) - ((minX - padding) % 20); x < minX + width; x += 20) {
        for (let y = (minY - padding) - ((minY - padding) % 20); y < minY + height; y += 20) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    } else if (canvasPattern === 'grid' || canvasPattern === 'lines' || canvasPattern === 'isometric') {
      ctx.strokeStyle = theme === 'dark' ? 'rgba(55, 65, 81, 0.08)' : 'rgba(209, 213, 219, 0.15)';
      ctx.lineWidth = 1;
      
      if (canvasPattern === 'grid' || canvasPattern === 'isometric') {
        for (let x = (minX - padding) - ((minX - padding) % 20); x < minX + width; x += 20) {
          ctx.beginPath(); ctx.moveTo(x, minY - padding); ctx.lineTo(x, minY - padding + height); ctx.stroke();
        }
      }
      
      if (canvasPattern === 'grid' || canvasPattern === 'lines' || canvasPattern === 'isometric') {
        for (let y = (minY - padding) - ((minY - padding) % 20); y < minY + height; y += 20) {
          ctx.beginPath(); ctx.moveTo(minX - padding, y); ctx.lineTo(minX - padding + width, y); ctx.stroke();
        }
      }

      if (canvasPattern === 'isometric') {
        // Draw diagonals for isometric (approximate representation)
        const diagStripe = 20 * Math.cos(Math.PI / 6); // roughly 17.32
        for (let x = (minX - padding) - ((minX - padding) % diagStripe) - width; x < minX + width * 2; x += diagStripe) {
           ctx.beginPath();
           ctx.moveTo(x, minY - padding);
           ctx.lineTo(x - height * Math.tan(Math.PI / 6), minY - padding + height);
           ctx.stroke();

           ctx.beginPath();
           ctx.moveTo(x, minY - padding);
           ctx.lineTo(x + height * Math.tan(Math.PI / 6), minY - padding + height);
           ctx.stroke();
        }
      }
    }
    
    const rc = rough.canvas(exportCanv);
    
    elements.forEach(el => {
      drawElement(rc, ctx, el);
    });
    
    const elLink = document.createElement('a');
    elLink.href = exportCanv.toDataURL('image/png');
    elLink.download = 'YouDraw.png';
    elLink.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const id = Date.now().toString();
        const element = createElement(theme, id, 100, 100, 300, 300, 'image', strokeColor, backgroundColor, strokeWidth, roundness, imageUrl, undefined, undefined, undefined, fillStyle, strokeStyle, roughness, opacity);
        setElements((prevState: CanvasElement[]) => [...prevState, element]);
        setSelectedElement(element);
        setTool('selection');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (action === 'writing' && textAreaRef.current) {
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          // Put cursor at the end
          textAreaRef.current.selectionStart = textAreaRef.current.value.length;
          textAreaRef.current.selectionEnd = textAreaRef.current.value.length;
        }
      }, 10);
    }
  }, [action]);

  const getCanvasBackground = () => {
    let bg = theme === 'dark' ? '#121212' : '#fdfdfd'; // default
    if (canvasBgColor !== 'default') {
      bg = canvasBgColor;
    }
    return bg;
  };

  const handleDuplicate = () => {
    if (selectedElement) {
      if (selectedElements.length > 1) {
        const offset = 20 / zoomScale;
        const newElements = selectedElements.map(el => {
          const newEl = { ...el, id: Date.now().toString() + Math.random(), x1: el.x1 + offset, y1: el.y1 + offset, x2: el.x2 + offset, y2: el.y2 + offset };
          return createElement(theme, newEl.id, newEl.x1, newEl.y1, newEl.x2, newEl.y2, newEl.type, newEl.strokeColor, newEl.backgroundColor, newEl.strokeWidth, newEl.roundness, newEl.imageUrl, newEl.fontFamily, newEl.fontSize, newEl.textAlign, newEl.fillStyle, newEl.strokeStyle, newEl.roughness, newEl.opacity);
        });
        setElements(prev => [...prev, ...newElements]);
        setSelectedElements(newElements);
      } else {
        const offset = 20 / zoomScale;
        const newEl = { ...selectedElement, id: Date.now().toString(), x1: selectedElement.x1 + offset, y1: selectedElement.y1 + offset, x2: selectedElement.x2 + offset, y2: selectedElement.y2 + offset };
        const el = createElement(theme, newEl.id, newEl.x1, newEl.y1, newEl.x2, newEl.y2, newEl.type, newEl.strokeColor, newEl.backgroundColor, newEl.strokeWidth, newEl.roundness, newEl.imageUrl, newEl.fontFamily, newEl.fontSize, newEl.textAlign, newEl.fillStyle, newEl.strokeStyle, newEl.roughness, newEl.opacity);
        if (selectedElement.text) el.text = selectedElement.text;
        if (selectedElement.link) el.link = selectedElement.link;
        if (selectedElement.points) {
          el.points = selectedElement.points.map(p => ({ x: p.x + offset, y: p.y + offset }));
        }
        setElements(prev => [...prev, el]);
        setSelectedElement(el);
      }
    }
  };

  const handleDelete = () => {
    if (selectedElements.length > 0) {
      setElements(elements.filter(el => !selectedElements.some(s => s.id === el.id)));
      setSelectedElements([]);
      setSelectedElement(null);
    } else if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement.id));
      setSelectedElement(null);
    }
  };

  const handleLayerAction = (actionType: 'front' | 'back' | 'forward' | 'backward') => {
    if (selectedElement && selectedElements.length <= 1) {
      setElements(prevElements => {
        const index = prevElements.findIndex(el => el.id === selectedElement.id);
        if (index === -1) return prevElements;
        const newElements = [...prevElements];
        const [el] = newElements.splice(index, 1);
        
        switch (actionType) {
          case 'front': newElements.push(el); break;
          case 'back': newElements.unshift(el); break;
          case 'forward': newElements.splice(Math.min(newElements.length, index + 1), 0, el); break;
          case 'backward': newElements.splice(Math.max(0, index - 1), 0, el); break;
        }
        return newElements;
      });
    }
  };

  const getCanvasPattern = () => {
    if (canvasPattern === 'none') return 'none';
    
    if (canvasPattern === 'dots') {
      const patternColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.4)' : 'rgba(209, 213, 219, 0.5)';
      return `radial-gradient(${patternColor} 1px, transparent 1px)`;
    }
    
    if (canvasPattern === 'lines') {
      const lineColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(209, 213, 219, 0.4)';
      return `linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`;
    }

    if (canvasPattern === 'isometric') {
      const isoColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.15)' : 'rgba(209, 213, 219, 0.25)';
      // A simple repeating pattern for isometric (using combination of lines)
      return `linear-gradient(150deg, ${isoColor} 1px, transparent 1px), linear-gradient(30deg, ${isoColor} 1px, transparent 1px), linear-gradient(90deg, ${isoColor} 1px, transparent 1px)`;
    }
    
    // grid
    const gridColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.08)' : 'rgba(209, 213, 219, 0.15)';
    return `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`;
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const { clientX, clientY } = getMouseCoordinates(event as any);
    const element = getElementAtPosition(clientX, clientY, elements);
    if (element && element.type === 'text') {
      setSelectedElement(element);
      setAction('writing');
      setTool('selection');
    }
  };

  return (
    <div className={`relative w-full h-full font-sans select-none overflow-hidden touch-none`} 
         style={{ 
           backgroundColor: getCanvasBackground(),
           backgroundImage: getCanvasPattern(), 
           backgroundSize: `20px 20px`, 
           backgroundPosition: `${panOffset.x * zoomScale}px ${panOffset.y * zoomScale}px` 
         }}>
      <Toolbar activeTool={tool} setActiveTool={setTool} onImageClick={() => fileInputRef.current?.click()} />
      
      <div className="fixed top-4 right-4 flex gap-2 z-10 w-fit">
        <button 
          onClick={exportCanvas}
          className="p-2 px-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      <SettingsPanel
        strokeColor={strokeColor}
        setStrokeColor={handleStrokeColorChange}
        backgroundColor={backgroundColor}
        setBackgroundColor={handleBackgroundColorChange}
        fillStyle={fillStyle}
        setFillStyle={handleFillStyleChange as any}
        strokeStyle={strokeStyle}
        setStrokeStyle={handleStrokeStyleChange as any}
        strokeWidth={strokeWidth}
        setStrokeWidth={handleStrokeWidthChange}
        roughness={roughness}
        setRoughness={handleRoughnessChange as any}
        opacity={opacity}
        setOpacity={handleOpacityChange}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onLayerAction={handleLayerAction}
        roundness={roundness}
        setRoundness={handleRoundnessChange as any}
        fontFamily={fontFamily}
        setFontFamily={handleFontFamilyChange}
        fontSize={fontSize}
        setFontSize={handleFontSizeChange}
        textAlign={textAlign}
        setTextAlign={handleTextAlignChange as any}
        link={selectedElement?.type === 'text' ? (selectedElement.link || '') : link}
        setLink={handleLinkChange}
        activeTool={selectedElement?.type === 'text' || actionState === 'writing' ? 'text' : tool}
      />
      <Sidebar 
        onReset={() => {
          setElements([], false);
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        }} 
        onNewCanvas={() => {
          setElements([], false);
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        }}
        onDeleteCanvas={() => {
          setElements([], false);
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        }}
        theme={theme} 
        toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
        canvasBgColor={canvasBgColor}
        setCanvasBgColor={setCanvasBgColor}
        canvasPattern={canvasPattern}
        setCanvasPattern={setCanvasPattern}
      />
      <Controls onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} zoomScale={zoomScale} setZoomScale={setZoomScale} />
      
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageFileChange} style={{ display: 'none' }} />

      {actionState === 'writing' && selectedElement ? (
        <textarea
          ref={textAreaRef}
          autoFocus={true}
          onBlur={handleTextBlur}
          defaultValue={selectedElement.text}
          onChange={(e) => {
             e.target.style.height = 'auto';
             e.target.style.height = (e.target.scrollHeight) + 'px';
             e.target.style.width = 'auto';
             e.target.style.width = (e.target.scrollWidth + 10) + 'px';
          }}
          placeholder="Type here..."
          style={{
            position: 'absolute',
            top: `${(Math.min(selectedElement.y1, selectedElement.y2) + panOffset.y) * zoomScale - 8 * zoomScale}px`,
            left: `${(Math.min(selectedElement.x1, selectedElement.x2) + panOffset.x) * zoomScale - 8 * zoomScale}px`,
            font: `${selectedElement.fontSize ? selectedElement.fontSize * zoomScale : 32 * zoomScale}px ${selectedElement.fontFamily || 'sans-serif'}`,
            textAlign: selectedElement.textAlign || 'left',
            margin: 0,
            padding: `${8 * zoomScale}px`,
            border: '2px dashed #2563eb', // Always visible indicator for editing mode
            outline: 'none',
            resize: 'auto',
            overflow: 'hidden',
            whiteSpace: 'pre',
            background: selectedElement.backgroundColor && selectedElement.backgroundColor !== 'transparent' ? selectedElement.backgroundColor : 'transparent',
            color: (theme === 'dark' && selectedElement.strokeColor === '#1e1e1e') ? '#ffffff' : selectedElement.strokeColor,
            zIndex: 9999,
          }}
          className="min-w-[150px] min-h-[40px] shadow-lg"
        />
      ) : null}

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full block touch-none"
      />
    </div>
  );
}

// Ensure useHistoryWrapper fetches and persists data to localStorage
const useHistoryWrapper = () => {
  const LOCAL_STORAGE_KEY = 'drawingElements';

  const retrieveElements = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // roughElement needs to be regenerated
      return parsed.map((el: any) => {
        if (el.type === 'pencil' || el.type === 'text') return el;
        const regeneratedElement = createElement(theme, el.id, el.x1, el.y1, el.x2, el.y2, el.type, el.strokeColor, el.backgroundColor, el.strokeWidth, el.roundness, el.imageUrl, el.fontFamily, el.fontSize, el.textAlign, el.fillStyle, el.strokeStyle, el.roughness, el.opacity);
        if (el.text) regeneratedElement.text = el.text;
        return regeneratedElement;
      });
    } catch {
      return [];
    }
  };

  const initialElements = retrieveElements();
  const { elements, setElements, undo, redo, canUndo, canRedo } = useHistory(initialElements);

  // Expose a custom setElements that also updates localStorage
  const setPersistedElements = (action: React.SetStateAction<CanvasElement[]>, overwrite = false) => {
    setElements(action, overwrite);
  };
  
  // Actually we need to set local storage AFTER setElements resolves, so useEffect is better.
  useEffect(() => {
    // Strip roughElement before saving to save space and avoid cyclical structures if any
    const toSave = elements.map(el => {
      const { roughElement, ...rest } = el;
      return rest;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toSave));
  }, [elements]);

  return [elements, setPersistedElements, undo, redo, canUndo, canRedo] as const;
};

