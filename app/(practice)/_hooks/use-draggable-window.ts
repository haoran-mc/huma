import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export function useDraggableWindow() {
  const windowFrameRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [windowOffset, setWindowOffset] = useState({ x: 0, y: 0 });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);

  const clampWindowOffset = useCallback((nextX: number, nextY: number) => {
    const windowRect = windowFrameRef.current?.getBoundingClientRect();

    if (!windowRect) {
      return { x: nextX, y: nextY };
    }

    const maxX = Math.max((window.innerWidth - windowRect.width - 32) / 2, 0);
    const maxY = Math.max((window.innerHeight - windowRect.height - 72) / 2, 0);

    return {
      x: Math.min(maxX, Math.max(-maxX, nextX)),
      y: Math.min(maxY, Math.max(-maxY, nextY)),
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragStateRef.current) {
        return;
      }

      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;
      const nextOffset = clampWindowOffset(
        dragStateRef.current.originX + deltaX,
        dragStateRef.current.originY + deltaY
      );

      setWindowOffset(nextOffset);
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      setIsDraggingWindow(false);
    };

    const handleResize = () => {
      setWindowOffset((currentOffset) => clampWindowOffset(currentOffset.x, currentOffset.y));
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", handleResize);
    };
  }, [clampWindowOffset]);

  const handleTitlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: windowOffset.x,
      originY: windowOffset.y,
    };

    setIsDraggingWindow(true);
  };

  return {
    windowFrameRef,
    windowOffset,
    isDraggingWindow,
    handleTitlePointerDown,
  };
}
