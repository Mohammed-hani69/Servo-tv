import { useEffect, useRef } from 'react';
import { KEY_CODES } from '../constants';
import { useLocation } from 'react-router-dom';

export const useTVNavigation = () => {
  const location = useLocation();
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Helper: Calculate distance between two rects
  const getDistance = (rect1: DOMRect, rect2: DOMRect, direction: number) => {
    const center1 = { x: rect1.left + rect1.width / 2, y: rect1.top + rect1.height / 2 };
    const center2 = { x: rect2.left + rect2.width / 2, y: rect2.top + rect2.height / 2 };

    if (direction === KEY_CODES.LEFT && center2.x >= center1.x) return Infinity;
    if (direction === KEY_CODES.RIGHT && center2.x <= center1.x) return Infinity;
    if (direction === KEY_CODES.UP && center2.y >= center1.y) return Infinity;
    if (direction === KEY_CODES.DOWN && center2.y <= center1.y) return Infinity;

    return Math.sqrt(Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      const activeTag = activeElement?.tagName.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea';

      // Input Handling:
      // Allow default browser behavior for typing and horizontal cursor movement (Left/Right).
      // Intercept UP/DOWN/ENTER/ESCAPE for navigation.
      if (isInput) {
        if (
          e.keyCode !== KEY_CODES.UP && 
          e.keyCode !== KEY_CODES.DOWN && 
          e.keyCode !== KEY_CODES.ENTER && 
          e.keyCode !== KEY_CODES.ESCAPE
        ) {
          return; 
        }
      }

      if (!Object.values(KEY_CODES).includes(e.keyCode)) return;

      const focusableElements = Array.from(document.querySelectorAll('.tv-interactive')) as HTMLElement[];

      // Handle Back
      if (e.keyCode === KEY_CODES.BACK || e.keyCode === KEY_CODES.ESCAPE) {
        e.preventDefault();
        // If in input, blur it first
        if (isInput) {
            activeElement.blur();
        } else {
            window.history.back();
        }
        return;
      }

      // Handle Enter (Click)
      if (e.keyCode === KEY_CODES.ENTER) {
        // Let the default action happen (onClick), but prevent form submission if needed
        // e.preventDefault(); 
        if(activeElement && activeElement.click) {
            activeElement.click();
        }
        return;
      }

      // SPATIAL NAVIGATION LOGIC
      e.preventDefault(); // Prevent scroll

      if (!activeElement || !activeElement.classList.contains('tv-interactive')) {
        // If nothing focused, focus the first element or the last known one
        const fallback = lastFocusedElement.current && document.body.contains(lastFocusedElement.current) 
            ? lastFocusedElement.current 
            : focusableElements[0];
        fallback?.focus();
        return;
      }

      const currentRect = activeElement.getBoundingClientRect();
      let bestCandidate: HTMLElement | null = null;
      let minDistance = Infinity;

      focusableElements.forEach((el) => {
        if (el === activeElement) return;

        // Optimization: Skip hidden elements
        if (el.offsetParent === null) return; 

        const rect = el.getBoundingClientRect();
        const dist = getDistance(currentRect, rect, e.keyCode);

        if (dist < minDistance) {
          minDistance = dist;
          bestCandidate = el;
        }
      });

      if (bestCandidate) {
        (bestCandidate as HTMLElement).focus();
        (bestCandidate as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        lastFocusedElement.current = bestCandidate;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial Focus Logic on Route Change
    const timer = setTimeout(() => {
        const autoFocusElement = document.querySelector('[autofocus]') as HTMLElement;
        if (autoFocusElement) {
            autoFocusElement.focus();
        } else {
            // Find the first interactive element in the main content area first, fallback to sidebar
            const firstContent = document.querySelector('main .tv-interactive') as HTMLElement;
            if (firstContent) {
                firstContent.focus();
            } else {
                const firstAny = document.querySelector('.tv-interactive') as HTMLElement;
                firstAny?.focus();
            }
        }
    }, 300); // Slight delay for React rendering

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [location]); // Re-run on route change
};