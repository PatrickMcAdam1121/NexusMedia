import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Video, Palette, Sparkles, Share2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export function Landing() {
  const { data: stats, isLoading } = useQuery<{ books: number; videos: number; comics: number }>({
    queryKey: ["/api/posts/stats"],
  });

  const statsConfig = [
    { icon: BookOpen, label: "Books", count: stats?.books ?? 0 },
    { icon: Video, label: "Animations", count: stats?.animations ?? 0 },
    { icon: Palette, label: "Comics", count: stats?.comics ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <nav className="w-full absolute top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">Nexus</span>
          </div>
          <Button asChild variant="ghost" className="font-medium rounded-xl">
            <a href="/api/login">Sign in</a>
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 text-secondary-foreground border border-border/50 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              The modern network for culture
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-foreground leading-[1.1] tracking-tight text-balance">
              Discover media that <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">inspires you.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl text-balance">
              Join a curated community sharing the best books, thought-provoking animations, and stunning comics. Your next favorite story is waiting.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="rounded-xl h-14 px-8 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background shadow-xl hover-elevate">
                <a href="/api/login">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
              {statsConfig.map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="font-display font-bold text-xl text-foreground">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                      `${stat.count}${stat.count >= 1000 ? '+' : ''}`
                    )}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl transform rotate-3 scale-105" />
            {/* abstract pastel colorful creative 3d shapes landscape unsplash */}
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2400&auto=format&fit=crop" 
              alt="Platform preview" 
              className="relative rounded-3xl shadow-2xl border border-border/50 object-cover aspect-[4/5] hover:scale-[1.02] transition-transform duration-500 ease-out"
            />
            
            {/* Floating UI Element */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 bg-card/90 backdrop-blur-xl border border-border/50 p-6 rounded-2xl shadow-xl w-72"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
                <div>
                  <p className="font-bold text-foreground text-sm">Sarah Jenkins</p>
                  <p className="text-xs text-muted-foreground">Shared a Masterpiece</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-secondary/50 p-3 rounded-xl">
                <Share2 className="w-4 h-4 text-primary" />
                "This completely changed my perspective."
              </div>
            </motion.div>
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}
