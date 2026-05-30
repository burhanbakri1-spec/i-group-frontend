import React, { useEffect, useRef, useState } from 'react';

interface SwipeRailProps {
  children: React.ReactNode;
  ariaLabel: string;
  cursorLabel?: React.ReactNode;
  className?: string;
  viewportClassName?: string;
  trackClassName?: string;
}

interface DragState {
  active: boolean;
  pointerId: number | null;
  startX: number;
  scrollLeft: number;
  dragged: boolean;
}

const DRAG_THRESHOLD_PX = 4;
const CLICK_SUPPRESSION_MS = 80;

export const SwipeRail: React.FC<SwipeRailProps> = ({
  children,
  ariaLabel,
  cursorLabel,
  className = '',
  viewportClassName = '',
  trackClassName = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const boundsRef = useRef<DOMRect | null>(null);
  const cursorFrameRef = useRef<number | null>(null);
  const cursorPositionRef = useRef({ x: 0, y: 0 });
  const dragStateRef = useRef<DragState>({
    active: false,
    pointerId: null,
    startX: 0,
    scrollLeft: 0,
    dragged: false,
  });
  const suppressClickRef = useRef(false);
  const suppressTimerRef = useRef<number | null>(null);
  const touchRef = useRef({ startX: 0, startY: 0, decided: false, isHorizontal: false, scrollLeft: 0 });
  const [cursorActive, setCursorActive] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        decided: false,
        isHorizontal: false,
        scrollLeft: viewport.scrollLeft,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const state = touchRef.current;
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;

      if (!state.decided) {
        if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
          state.decided = true;
          state.isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        }
        return;
      }

      if (state.isHorizontal) {
        e.preventDefault();
        viewport.scrollLeft = state.scrollLeft - deltaX;
      }
      // Vertical: no preventDefault → browser scrolls page naturally
    };

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (suppressTimerRef.current !== null) {
        window.clearTimeout(suppressTimerRef.current);
      }
      if (cursorFrameRef.current !== null) {
        window.cancelAnimationFrame(cursorFrameRef.current);
      }
    };
  }, []);

  const measureContainer = () => {
    const container = containerRef.current;
    boundsRef.current = container ? container.getBoundingClientRect() : null;
  };

  const flushCursorPosition = () => {
    cursorFrameRef.current = null;

    const cursor = cursorRef.current;
    if (!cursor) {
      return;
    }

    const { x, y } = cursorPositionRef.current;
    const scale = dragStateRef.current.active ? 0.92 : 1;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
  };

  const queueCursorPosition = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = boundsRef.current;
    if (!bounds) {
      measureContainer();
    }

    const currentBounds = boundsRef.current;
    if (!currentBounds) {
      return;
    }

    const newX = event.clientX - currentBounds.left;
    const newY = event.clientY - currentBounds.top;
    const prev = cursorPositionRef.current;

    // Skip update if cursor moved less than 1px — saves rAF cycles
    if (Math.abs(newX - prev.x) < 1 && Math.abs(newY - prev.y) < 1) {
      return;
    }

    cursorPositionRef.current = { x: newX, y: newY };

    if (cursorFrameRef.current === null) {
      cursorFrameRef.current = window.requestAnimationFrame(flushCursorPosition);
    }
  };

  const showCursor = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      return;
    }

    measureContainer();
    queueCursorPosition(event);
    setCursorActive(true);
  };

  const isPointerInsideRail = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = boundsRef.current;
    if (!bounds) {
      return false;
    }

    return (
      event.clientX >= bounds.left
      && event.clientX <= bounds.right
      && event.clientY >= bounds.top
      && event.clientY <= bounds.bottom
    );
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      return;
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    measureContainer();
    queueCursorPosition(event);
    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: viewport.scrollLeft,
      dragged: false,
    };
    setDragging(true);
    setCursorActive(true);
    // Pointer capture deferred to handlePointerMove — only after drag threshold
    // to allow click events to pass through to child elements on tap.
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') {
      queueCursorPosition(event);
    }

    const viewport = viewportRef.current;
    const dragState = dragStateRef.current;
    if (!viewport || !dragState.active) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    if (Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
      if (!dragState.dragged) {
        dragState.dragged = true;
        suppressClickRef.current = true;
        // Capture pointer only once we've confirmed this is a drag gesture.
        // This lets quick taps reach child elements (product cards, links).
        if (!viewport.hasPointerCapture(dragState.pointerId!)) {
          viewport.setPointerCapture(dragState.pointerId!);
        }
      }
    }

    if (dragState.dragged) {
      event.preventDefault();
      viewport.scrollLeft = dragState.scrollLeft - deltaX;
    }
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) {
      return;
    }

    const viewport = viewportRef.current;
    const dragState = dragStateRef.current;
    if (viewport && dragState.pointerId !== null && viewport.hasPointerCapture(dragState.pointerId)) {
      viewport.releasePointerCapture(dragState.pointerId);
    }

    if (dragState.dragged) {
      if (suppressTimerRef.current !== null) {
        window.clearTimeout(suppressTimerRef.current);
      }
      suppressTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        suppressTimerRef.current = null;
      }, CLICK_SUPPRESSION_MS);
    }

    dragStateRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      scrollLeft: 0,
      dragged: false,
    };
    setDragging(false);
    queueCursorPosition(event);
    setCursorActive(event.pointerType !== 'touch' && isPointerInsideRail(event));
  };

  const handlePointerLeave = () => {
    if (!dragStateRef.current.active) {
      setCursorActive(false);
    }
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const direction = window.getComputedStyle(viewport).direction === 'rtl' ? -1 : 1;
    const step = viewport.clientWidth * 0.82;
    const nextLeft = event.key === 'ArrowRight' ? step * direction : -step * direction;
    event.preventDefault();
    viewport.scrollBy({ left: nextLeft, behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      className={`icare-swipe-rail ${cursorActive ? 'is-cursor-active' : ''} ${dragging ? 'is-dragging' : ''} ${className}`}
    >
      <div
        ref={viewportRef}
        className={`icare-swipe-rail__viewport no-scrollbar ${viewportClassName}`}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onPointerEnter={showCursor}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={handlePointerLeave}
        onClickCapture={handleClickCapture}
        onKeyDown={handleKeyDown}
      >
        <div className={`icare-swipe-rail__track ${trackClassName}`}>{children}</div>
      </div>
      <div ref={cursorRef} className="icare-swipe-rail__cursor" aria-hidden="true">
        {cursorLabel && (
          <span className="icare-swipe-rail__cursor-label">{cursorLabel}</span>
        )}
      </div>
    </div>
  );
};
