import { useEffect, useState } from 'react';

// Konami code sequence: up, up, down, down, left, right, left, right, b, a
const KONAMI_CODE = [
  'ArrowUp', 
  'ArrowUp', 
  'ArrowDown', 
  'ArrowDown', 
  'ArrowLeft', 
  'ArrowRight', 
  'ArrowLeft', 
  'ArrowRight', 
  'KeyB', 
  'KeyA'
];

export const useKonamiCode = (callback: () => void): void => {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Use event.code for more consistent key detection across different keyboard layouts
      const keyPressed = event.code;
      
      // Add the key to the sequence (keeping only the last N keys where N is the length of the Konami code)
      const updatedKeys = [...keys, keyPressed].slice(-KONAMI_CODE.length);
      setKeys(updatedKeys);
      
      // Check if the sequence matches the Konami code
      const isKonamiCode = updatedKeys.length === KONAMI_CODE.length && 
        updatedKeys.every((key, index) => key === KONAMI_CODE[index]);
      
      if (isKonamiCode) {
        // Execute the callback when Konami code is detected
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keys, callback]);
}; 