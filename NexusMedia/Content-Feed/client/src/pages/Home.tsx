import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/posts/PostCard";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";

export function Home() {
  const [location] = useLocation();
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const type = params.get("type") || "all";
    setFilter(type);
  }, [location]);

  const { data: posts, isLoading } = usePosts(filter === "all" ? undefined : filter);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-2 mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Your Feed
          </h1>
          <p className="text-muted-foreground text-lg">
            {filter === "all"
              ? "Discover the latest cultural gems from your network."
              : `Explore ${filter === "book" ? "Books" : filter === "animation" ? "Animations" : "Comics"}`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[380px] rounded-2xl bg-secondary/50 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : !posts?.length ? (
          <div className="py-32 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
              <SearchX className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">Nothing found</h3>
            <p className="text-muted-foreground max-w-sm">
              We couldn't find any content matching your current filter. Try adjusting your view or be the first to post!
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {posts.map((post) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
