import rough from 'roughjs/bin/rough';
import { getStroke } from 'perfect-freehand';
import { CanvasElement, Point, ToolType } from './types';

const generator = rough.generator();

function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );
  d.push('Z');
  return d.join(' ');
}

// Global image cache
export const imageCache = new Map<string, HTMLImageElement>();

export const createElement = (
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: ToolType,
  strokeColor: string,
  backgroundColor: string = 'transparent',
  strokeWidth: number = 2,
  roundness: 'sharp' | 'round' = 'round',
  imageUrl?: string,
  fontFamily: string = 'Caveat, cursive',
  fontSize: number = 32,
  textAlign: 'left' | 'center' | 'right' = 'left',
): CanvasElement => {
  let roughElement = null;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const width = x2 - x1;
  const height = y2 - y1;

  const options = {
    stroke: strokeColor,
    strokeWidth,
    fill: backgroundColor === 'transparent' ? undefined : backgroundColor,
    fillStyle: 'solid',
    roughness: 0.2, // Improved quality
    bowing: 0.5,
  };

  switch (type) {
    case 'line':
      roughElement = generator.line(x1, y1, x2, y2, options);
      break;
    case 'rectangle':
      if (roundness === 'round') {
        const minX = Math.min(x1, x2);
        const minY = Math.min(y1, y2);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);
        const r = Math.min(24, w / 2, h / 2); // More rounded
        const path = `M ${minX + r} ${minY} H ${minX + w - r} A ${r} ${r} 0 0 1 ${minX + w} ${minY + r} V ${minY + h - r} A ${r} ${r} 0 0 1 ${minX + w - r} ${minY + h} H ${minX + r} A ${r} ${r} 0 0 1 ${minX} ${minY + h - r} V ${minY + r} A ${r} ${r} 0 0 1 ${minX + r} ${minY} Z`;
        roughElement = generator.path(path, options);
      } else {
        roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, options);
      }
      break;
    case 'frame':
      // Frames are usually transparent or slightly tinted rectangles with dashed borders, but with rough we can use a specific style
      const frameOptions = {
         ...options,
         strokeLineDash: [10, 10],
         stroke: strokeColor,
         fill: backgroundColor === 'transparent' ? undefined : backgroundColor,
         fillStyle: 'solid',
         strokeWidth: 2
      };
      roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, frameOptions);
      break;
    case 'ellipse':
      roughElement = generator.ellipse(cx, cy, width, height, options);
      break;
    case 'diamond':
      roughElement = generator.polygon(
        [
          [cx, y1],
          [x2, cy],
          [cx, y2],
          [x1, cy],
        ],
        options
      );
      break;
    case 'triangle':
      roughElement = generator.polygon(
        [
          [cx, y1],
          [x2, y2],
          [x1, y2],
        ],
        options
      );
      break;
    case 'arrow':
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headlen = 15;
      roughElement = [
        generator.line(x1, y1, x2, y2, options),
        generator.line(
          x2,
          y2,
          x2 - headlen * Math.cos(angle - Math.PI / 6),
          y2 - headlen * Math.sin(angle - Math.PI / 6),
          options
        ),
        generator.line(
          x2,
          y2,
          x2 - headlen * Math.cos(angle + Math.PI / 6),
          y2 - headlen * Math.sin(angle + Math.PI / 6),
          options
        ),
      ];
      break;
    case 'pencil':
      return { id, type, x: x1, y: y1, width: 0, height: 0, x1, y1, x2, y2, strokeColor, strokeWidth, points: [{ x: x1, y: y1 }] };
    case 'text':
      return { id, type, x: x1, y: y1, width: x2-x1, height: y2-y1, x1, y1, x2, y2, strokeColor, backgroundColor, text: '', fontFamily, fontSize, textAlign };
    case 'image':
      if (imageUrl && !imageCache.has(id)) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          imageCache.set(id, img);
        };
      }
      return { id, type, x: x1, y: y1, width: x2-x1, height: y2-y1, x1, y1, x2, y2, strokeColor, imageUrl };
    case 'eraser':
      return { id, type, x: x1, y: y1, width: 0, height: 0, x1, y1, x2, y2, strokeColor: 'transparent' };
    default:
      break;
  }
  return { id, type, x: x1, y: y1, width, height, x1, y1, x2, y2, strokeColor, backgroundColor, strokeWidth, roundness, roughness: 0.2, roughElement };
};

const distance = (a: Point, b: Point) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const nearPoint = (x: number, y: number, x1: number, y1: number, name: string) => {
  return Math.abs(x - x1) < 10 && Math.abs(y - y1) < 10 ? name : null;
};

const onLine = (x1: number, y1: number, x2: number, y2: number, x: number, y: number, maxDistance = 1) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? 'inside' : null;
};

export const positionWithinElement = (x: number, y: number, element: CanvasElement) => {
  const { type, x1, x2, y1, y2 } = element;

  switch (type) {
    case 'line':
    case 'arrow':
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, 'start');
      const end = nearPoint(x, y, x2, y2, 'end');
      return start || end || on;
    case 'rectangle':
    case 'frame':
    case 'ellipse':
    case 'diamond':
    case 'triangle':
    case 'image':
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      
      const topLeft = nearPoint(x, y, minX, minY, 'tl');
      const topRight = nearPoint(x, y, maxX, minY, 'tr');
      const bottomLeft = nearPoint(x, y, minX, maxY, 'bl');
      const bottomRight = nearPoint(x, y, maxX, maxY, 'br');
      const inside = x >= minX && x <= maxX && y >= minY && y <= maxY ? 'inside' : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    case 'pencil':
      const betweenAnyPoint = element.points?.some((point, index) => {
        const nextPoint = element.points![index + 1];
        if (!nextPoint) return false;
        return onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null;
      });
      return betweenAnyPoint ? 'inside' : null;
    case 'text':
      const minXText = Math.min(x1, x2);
      const maxXText = Math.max(x1, x2);
      const minYText = Math.min(y1, y2);
      const maxYText = Math.max(y1, y2);
      
      const tlText = nearPoint(x, y, minXText, minYText, 'tl');
      const trText = nearPoint(x, y, maxXText, minYText, 'tr');
      const blText = nearPoint(x, y, minXText, maxYText, 'bl');
      const brText = nearPoint(x, y, maxXText, maxYText, 'br');
      const insideText = x >= minXText - 8 && x <= maxXText + 8 && y >= minYText - 8 && y <= maxYText + 8 ? 'inside' : null;
      return tlText || trText || blText || brText || insideText;
    default:
      return null;
  }
};

export const getElementAtPosition = (x: number, y: number, elements: CanvasElement[]) => {
  // Return the topmost element (iterate backwards)
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    const position = positionWithinElement(x, y, element);
    if (position !== null) {
      return { ...element, position };
    }
  }
  return undefined;
};

export const cursorForPosition = (position: string) => {
  switch (position) {
    case 'tl':
    case 'br':
    case 'start':
    case 'end':
      return 'nwse-resize';
    case 'tr':
    case 'bl':
      return 'nesw-resize';
    case 'inside':
      return 'move';
    default:
      return 'default';
  }
};

export const drawElement = (
  roughCanvas: any,
  context: CanvasRenderingContext2D,
  element: CanvasElement
) => {
  switch (element.type) {
    case 'line':
    case 'rectangle':
    case 'frame':
    case 'ellipse':
    case 'diamond':
    case 'triangle':
      if (element.roughElement) {
         roughCanvas.draw(element.roughElement);
      }
      break;
    case 'arrow':
      if (element.roughElement) {
         element.roughElement.forEach((line: any) => roughCanvas.draw(line));
      }
      break;
    case 'pencil':
      if (element.points && element.points.length > 0) {
        const stroke = getStroke(element.points, {
          size: element.strokeWidth ? element.strokeWidth * 3 : 12,
          thinning: 0.6,
          smoothing: 0.8,
          streamline: 0.8,
        });
        const pathData = getSvgPathFromStroke(stroke);
        const path = new Path2D(pathData);
        context.fillStyle = element.strokeColor;
        context.fill(path);
      }
      break;
    case 'text':
      const minTextX = Math.min(element.x1, element.x2);
      const minTextY = Math.min(element.y1, element.y2);
      const textWidth = Math.abs(element.x2 - element.x1);
      const textHeight = Math.abs(element.y2 - element.y1);
      
      const padding = 8;
      
      if (element.backgroundColor && element.backgroundColor !== 'transparent') {
        context.fillStyle = element.backgroundColor;
        // Draw background rect with padding
        context.fillRect(minTextX - padding, minTextY - padding, textWidth + padding * 2, textHeight + padding * 2);
      }

      context.textBaseline = 'top';
      context.font = `${element.fontSize || 32}px ${element.fontFamily || 'sans-serif'}`;
      context.fillStyle = element.strokeColor;
      context.textAlign = element.textAlign || 'left';
      
      let drawX = minTextX;
      if (element.textAlign === 'center') {
        drawX = minTextX + textWidth / 2;
      } else if (element.textAlign === 'right') {
        drawX = minTextX + textWidth;
      }

      const lines = (element.text || '').split('\n');
      const lineHeight = (element.fontSize || 32) * 1.2;
      lines.forEach((line, index) => {
        const textY = minTextY + (index * lineHeight);
        context.fillText(line, drawX, textY);
        
        if (element.link) {
           const metrics = context.measureText(line);
           let lineStartX = drawX;
           if (element.textAlign === 'center') {
             lineStartX -= metrics.width / 2;
           } else if (element.textAlign === 'right') {
             lineStartX -= metrics.width;
           }
           const underlineY = textY + (element.fontSize || 32) * 1.1;
           context.beginPath();
           context.moveTo(lineStartX, underlineY);
           context.lineTo(lineStartX + metrics.width, underlineY);
           context.lineWidth = Math.max(1, (element.fontSize || 32) * 0.08);
           context.strokeStyle = element.strokeColor;
           context.setLineDash([Math.max(2, (element.fontSize || 32) * 0.15)]);
           context.stroke();
           context.setLineDash([]);
        }
      });
      context.textAlign = 'left'; // reset
      break;
    case 'image':
      if (element.imageUrl) {
         const img = imageCache.get(element.id);
         if (img) {
            context.drawImage(img, Math.min(element.x1, element.x2), Math.min(element.y1, element.y2), Math.abs(element.x2 - element.x1), Math.abs(element.y2 - element.y1));
         } else {
            // Initiate load if not in cache (already handled partially in createElement)
            const newImg = new Image();
            newImg.src = element.imageUrl;
            newImg.onload = () => {
              imageCache.set(element.id, newImg);
            };
         }
      }
      break;
    default:
      break;
  }
};

export const adjustElementCoordinates = (element: CanvasElement) => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === 'rectangle' || type === 'ellipse' || type === 'diamond' || type === 'text' || type === 'image') {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { ...element, x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    // For line and arrow, we keep the order of points since start/end matters
    return element;
  }
};
