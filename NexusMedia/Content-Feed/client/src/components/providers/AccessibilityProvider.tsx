import { ReactNode } from 'react';
import { AccessibilityContext, useAccessibilityProvider } from '@/hooks/use-accessibility';

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const accessibility = useAccessibilityProvider();

  return (
    <AccessibilityContext.Provider value={accessibility}>
      {children}
    </AccessibilityContext.Provider>
  );
}
