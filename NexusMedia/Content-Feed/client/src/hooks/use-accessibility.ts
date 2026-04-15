import { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilitySettings {
  darkMode: boolean;
  dyslexiaFont: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'lg' | 'xl';
  reduceMotion: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  toggleDarkMode: () => void;
  toggleDyslexiaFont: () => void;
  toggleHighContrast: () => void;
  setFontSize: (size: 'normal' | 'lg' | 'xl') => void;
  toggleReduceMotion: () => void;
}

export const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

const DEFAULT_SETTINGS: AccessibilitySettings = {
  darkMode: false,
  dyslexiaFont: false,
  highContrast: false,
  fontSize: 'normal',
  reduceMotion: false,
};

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

export function useAccessibilityProvider() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings, mounted]);

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const toggleDyslexiaFont = () => {
    setSettings(prev => ({ ...prev, dyslexiaFont: !prev.dyslexiaFont }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const setFontSize = (size: 'normal' | 'lg' | 'xl') => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const toggleReduceMotion = () => {
    setSettings(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  };

  return {
    settings,
    toggleDarkMode,
    toggleDyslexiaFont,
    toggleHighContrast,
    setFontSize,
    toggleReduceMotion,
  };
}

function applySettings(settings: AccessibilitySettings) {
  const html = document.documentElement;
  const body = document.body;

  if (settings.darkMode) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  if (settings.highContrast) {
    html.classList.add('high-contrast');
  } else {
    html.classList.remove('high-contrast');
  }

  if (settings.dyslexiaFont) {
    body.classList.add('font-dyslexia');
  } else {
    body.classList.remove('font-dyslexia');
  }

  if (settings.fontSize === 'normal') {
    html.classList.remove('font-size-lg', 'font-size-xl');
  } else {
    html.classList.remove('font-size-lg', 'font-size-xl');
    html.classList.add(`font-size-${settings.fontSize}`);
  }

  if (settings.reduceMotion) {
    html.classList.add('reduce-motion');
  } else {
    html.classList.remove('reduce-motion');
  }
}
