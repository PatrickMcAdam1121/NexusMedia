import { useState } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Type, Palette, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, toggleDarkMode, toggleDyslexiaFont, toggleHighContrast, setFontSize, toggleReduceMotion } = useAccessibility();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-xl text-muted-foreground hover:text-foreground"
        title="Accessibility settings"
      >
        <Palette className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 bg-card border border-border/50 rounded-2xl shadow-lg z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-foreground">Accessibility</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Dark Mode
                  </label>
                  <Button
                    onClick={toggleDarkMode}
                    variant={settings.darkMode ? 'default' : 'outline'}
                    className="w-full rounded-xl"
                  >
                    {settings.darkMode ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                    {settings.darkMode ? 'Dark' : 'Light'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Dyslexia-Friendly Font
                  </label>
                  <Button
                    onClick={toggleDyslexiaFont}
                    variant={settings.dyslexiaFont ? 'default' : 'outline'}
                    className="w-full rounded-xl"
                  >
                    {settings.dyslexiaFont ? 'OpenDyslexic' : 'Standard'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">Font Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'lg', 'xl'] as const).map(size => (
                      <Button
                        key={size}
                        onClick={() => setFontSize(size)}
                        variant={settings.fontSize === size ? 'default' : 'outline'}
                        className="rounded-xl text-xs"
                      >
                        {size === 'normal' ? 'A' : size === 'lg' ? 'A+' : 'A++'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    High Contrast
                  </label>
                  <Button
                    onClick={toggleHighContrast}
                    variant={settings.highContrast ? 'default' : 'outline'}
                    className="w-full rounded-xl"
                  >
                    {settings.highContrast ? 'High Contrast' : 'Standard'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Reduce Motion
                  </label>
                  <Button
                    onClick={toggleReduceMotion}
                    variant={settings.reduceMotion ? 'default' : 'outline'}
                    className="w-full rounded-xl"
                  >
                    {settings.reduceMotion ? 'Reduced' : 'Full'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
