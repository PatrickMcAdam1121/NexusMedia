import { useState } from 'react';
import { Link } from "wouter";
import { type PostWithUser } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Clapperboard, Image as ImageIcon, ExternalLink, MessageSquare, Heart, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DonateModal } from "@/components/layout/DonateModal";

interface PostCardProps {
  post: PostWithUser;
}

const typeConfig = {
  book: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  animation: { icon: Clapperboard, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  comic: { icon: ImageIcon, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

export function PostCard({ post }: PostCardProps) {
  const config = typeConfig[post.mediaType as keyof typeof typeConfig] || typeConfig.book;
  const TypeIcon = config.icon;
  const [showDonate, setShowDonate] = useState(false);

  return (
    <>
      <Card className="group overflow-hidden rounded-2xl border border-border/50 bg-card hover:border-border hover:shadow-xl hover:shadow-black/5 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
        <Link href={`/post/${post.id}`} className="block relative aspect-[16/9] overflow-hidden bg-secondary">
          {post.thumbnailUrl ? (
            <img 
              src={post.thumbnailUrl} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80&blur=50`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
              <TypeIcon className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          <Badge 
            variant="secondary" 
            className={`absolute top-4 left-4 ${config.bg} ${config.color} ${config.border} backdrop-blur-md shadow-sm`}
          >
            <TypeIcon className="w-3 h-3 mr-1.5" />
            <span className="capitalize">{post.mediaType}</span>
          </Badge>
        </Link>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-8 h-8 border border-border/50">
              <AvatarImage src={post.user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {post.user?.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {post.user?.firstName} {post.user?.lastName}
                <Badge variant="outline" className="ml-2 text-[10px] uppercase h-3 px-1">{post.user?.role}</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt || new Date()), { addSuffix: true })}
              </p>
            </div>
          </div>

          <Link href={`/post/${post.id}`} className="block group/title flex-1">
            <h3 className="font-display font-bold text-xl text-foreground mb-2 line-clamp-2 group-hover/title:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
              {post.description}
            </p>
          </Link>

          <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto gap-2">
            <div className="flex items-center gap-2">
              {post.url && (
                <a 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary flex items-center hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                </a>
              )}
              {post.filePath && (
                <a 
                  href={post.filePath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary flex items-center hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-1 ml-auto">
              {post.price && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDonate(true);
                  }}
                  className="rounded-lg text-xs text-primary hover:bg-primary/10 gap-1"
                >
                  <ShoppingCart className="w-3 h-3" />
                  ${post.price}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDonate(true);
                }}
                className="rounded-lg text-xs text-accent hover:bg-accent/10 gap-1"
              >
                <Heart className="w-3 h-3" />
                Tip
              </Button>
              <Link href={`/post/${post.id}`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center text-xs font-medium gap-1 rounded-lg p-2 hover:bg-secondary/50">
                <MessageSquare className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <DonateModal 
        open={showDonate} 
        onOpenChange={setShowDonate} 
        recipientId={post.userId}
        recipientName={`${post.user?.firstName} ${post.user?.lastName}`}
        postId={post.id}
      />
    </>
  );
}
