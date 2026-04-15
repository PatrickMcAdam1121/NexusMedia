import { Layers } from "lucide-react";
import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-6"
      >
        <Layers className="w-8 h-8" />
      </motion.div>
      <h2 className="font-display text-xl font-medium text-foreground tracking-tight">Loading Nexus...</h2>
      <p className="text-muted-foreground mt-2 text-sm">Preparing your content feed</p>
    </div>
  );
}
