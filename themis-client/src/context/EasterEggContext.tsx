import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useKonamiCode } from '../hooks/useKonamiCode';

interface EasterEggContextType {
  easterEggActive: boolean;
  toggleEasterEgg: () => void;
}

const EasterEggContext = createContext<EasterEggContextType | undefined>(undefined);

export const useEasterEgg = (): EasterEggContextType => {
  const context = useContext(EasterEggContext);
  if (!context) {
    throw new Error('useEasterEgg must be used within an EasterEggProvider');
  }
  return context;
};

interface EasterEggProviderProps {
  children: ReactNode;
}

export const EasterEggProvider: React.FC<EasterEggProviderProps> = ({ children }) => {
  // Check if easter egg state was saved in localStorage
  const [easterEggActive, setEasterEggActive] = useState<boolean>(() => {
    const savedState = localStorage.getItem('themis-easter-egg');
    return savedState === 'true';
  });

  // Save easter egg state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('themis-easter-egg', easterEggActive.toString());
    
    // Apply/remove easter egg class to body
    if (easterEggActive) {
      document.body.classList.add('easter-egg-mode');
    } else {
      document.body.classList.remove('easter-egg-mode');
    }
  }, [easterEggActive]);

  const toggleEasterEgg = () => {
    setEasterEggActive(prev => !prev);
    // Play a sound effect when activated
    if (!easterEggActive)
      // Create a simple beep sound instead of relying on an audio file
      try {
        // Create audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          // Configure oscillator
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          // Configure gain (volume)
          gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
          
          // Start and stop the sound
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Up to A5
            setTimeout(() => {
              oscillator.stop();
            }, 100);
          }, 100);
        } else {
          console.log('Web Audio API not supported in this browser');
        }
      } catch (err) {
        console.log('Error playing sound:', err);
      }
  };

  // Setup Konami code detector
  useKonamiCode(toggleEasterEgg);

  return (
    <EasterEggContext.Provider value={{ easterEggActive, toggleEasterEgg }}>
      {children}
    </EasterEggContext.Provider>
  );
}; 