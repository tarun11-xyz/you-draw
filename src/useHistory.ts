import { useState } from 'react';
import { CanvasElement } from './types';

export const useHistory = (initialState: CanvasElement[]) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<CanvasElement[][]>([initialState]);

  const setState = (
    action: CanvasElement[] | ((current: CanvasElement[]) => CanvasElement[]),
    overwrite = false
  ) => {
    const newState =
      typeof action === 'function' ? action(history[index]) : action;

    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex(updatedState.length);
    }
  };

  const undo = () => index > 0 && setIndex((prevState) => prevState - 1);
  const redo = () =>
    index < history.length - 1 && setIndex((prevState) => prevState + 1);

  return {
    elements: history[index],
    setElements: setState,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
};
