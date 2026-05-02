export type ToolType =
  | 'selection'
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'arrow'
  | 'line'
  | 'pencil'
  | 'text'
  | 'image'
  | 'eraser'
  | 'hand'
  | 'frame'
  | 'triangle';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface CanvasElement {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeColor: string;
  backgroundColor?: string;
  strokeWidth?: number;
  roundness?: 'sharp' | 'round';
  fillStyle?: 'hachure' | 'cross-hatch' | 'solid';
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  roughness?: number;
  opacity?: number;
  roughElement?: any;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  points?: Point[];
  imageUrl?: string;
  link?: string;
}
