import { useParams, Link } from "wouter";
import { usePost, useDeletePost } from "@/hooks/use-posts";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/use-comments";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, ArrowLeft, Trash2, Send, MessageSquare, Palette, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function PostDetail() {
  const { id } = useParams();
  const postId = Number(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: post, isLoading: postLoading } = usePost(postId);
  const { data: comments, isLoading: commentsLoading } = useComments(postId);
  
  const createComment = useCreateComment(postId);
  const deleteComment = useDeleteComment();
  const deletePost = useDeletePost();
  
  const [commentText, setCommentText] = useState("");
  const [showCoverForm, setShowCoverForm] = useState(false);
  const [coverUrl, setArtUrl] = useState("");

  const createCoverRequest = useMutation({
    mutationFn: async (data: { artUrl: string }) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/cover-requests`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Request sent!", description: "The author will review your cover art." });
      setShowCoverForm(false);
      setArtUrl("");
      queryClient.invalidateQueries({ queryKey: [post?.id ? `/api/posts/${post.id}` : 'post'] });
    }
  });

  if (postLoading) return <LoadingScreen />;
  if (!post) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Post not found</h2>
        <Button asChild variant="outline" className="rounded-xl"><Link href="/">Back to Home</Link></Button>
      </div>
    </div>
  );

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createComment.mutate({ content: commentText.trim() }, {
      onSuccess: () => setCommentText("")
    });
  };

  const handleDeletePost = () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    deletePost.mutate(postId, {
      onSuccess: () => {
        toast({ title: "Post deleted" });
        window.location.href = "/";
      }
    });
  };

  const handleCoverRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverUrl.trim()) return;
    createCoverRequest.mutate({ artUrl: coverUrl.trim() });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <Button asChild variant="ghost" className="mb-8 rounded-xl -ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Feed
          </Link>
        </Button>

        <article className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden mb-12">
          {post.thumbnailUrl && (
            <div className="w-full aspect-[21/9] bg-secondary relative overflow-hidden">
              <img 
                src={post.thumbnailUrl} 
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80&blur=50`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-10 relative">
            {!post.thumbnailUrl && post.mediaType === 'book' && (
              <div className="w-full aspect-[21/9] bg-secondary/30 rounded-2xl border-2 border-dashed border-border flex items-center justify-center mb-8">
                <div className="text-center">
                  <Palette className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Cover space waiting for Artist editions</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
              <div>
                <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
                  {post.title}
                </h1>
                
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                    <AvatarImage src={post.user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-secondary text-foreground font-semibold">
                      {post.user?.firstName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {post.user?.firstName} {post.user?.lastName}
                      <Badge variant="outline" className="ml-2 text-[10px] uppercase h-4 px-1">{post.user?.role}</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt || new Date()), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {post.url ? (
                    <Button asChild size="lg" className="rounded-xl font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-none hover-elevate">
                      <a href={post.url} target="_blank" rel="noopener noreferrer">
                        View Original <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  ) : post.filePath ? (
                    <Button asChild size="lg" className="rounded-xl font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-none hover-elevate">
                      <a href={post.filePath} target="_blank" rel="noopener noreferrer">
                        View File <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  ) : null}
                  
                  {user?.id === post.userId && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleDeletePost}
                      disabled={deletePost.isPending}
                      className="rounded-xl h-11 w-11 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {post.mediaType === 'book' && user?.role === 'Artist' && (
                  <Button 
                    onClick={() => setShowCoverForm(!showCoverForm)}
                    variant="outline"
                    className="rounded-xl font-semibold border-accent text-accent hover:bg-accent hover:text-white"
                  >
                    <Palette className="w-4 h-4 mr-2" /> Contribute Cover Art
                  </Button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {showCoverForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-8"
                >
                  <Card className="bg-accent/5 border-accent/20">
                    <CardContent className="p-6">
                      <form onSubmit={handleCoverRequest} className="space-y-4">
                        <Label className="text-sm font-bold text-accent uppercase tracking-wider">Submit your cover edition</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Link to your art (image URL)..."
                            value={coverUrl}
                            onChange={(e) => setArtUrl(e.target.value)}
                            className="rounded-xl border-accent/30 focus-visible:ring-accent/20"
                          />
                          <Button disabled={createCoverRequest.isPending} type="submit" className="rounded-xl bg-accent hover:bg-accent/90">
                            {createCoverRequest.isPending ? "Sending..." : "Submit"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed mb-10">
              {post.mediaType === 'animation' && post.basedOnBook && (
                <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm italic">
                  This animation is based on the book: <Link href={`/post/${post.basedOnBook.id}`} className="text-primary font-bold hover:underline">{post.basedOnBook.title}</Link>
                </div>
              )}
              {post.description.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {post.coverRequests && post.coverRequests.length > 0 && (
              <div className="mt-12 space-y-6">
                <h4 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-accent" />
                  Artist Editions ({post.coverRequests.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {post.coverRequests.map((req) => (
                    <div key={req.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary border border-border/50">
                      <img src={req.artUrl} alt="Cover Edition" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <p className="text-xs font-bold text-white truncate">{req.user.firstName} {req.user.lastName}</p>
                        <p className="text-[10px] text-white/70">Artist Edition</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <section className="bg-card rounded-3xl border border-border/50 shadow-sm p-6 sm:p-10">
          <h3 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-primary" />
            Discussion ({comments?.length || 0})
          </h3>

          <form onSubmit={handleComment} className="mb-10 flex gap-4">
            <Avatar className="w-10 h-10 border border-border/50 hidden sm:block">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea 
                placeholder="Share your thoughts..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[100px] resize-none rounded-xl border-border/50 focus-visible:ring-primary/20 p-4"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!commentText.trim() || createComment.isPending}
                  className="rounded-xl font-semibold px-6 hover-elevate"
                >
                  <Send className="w-4 h-4 mr-2" /> Post Reply
                </Button>
              </div>
            </div>
          </form>

          <div className="space-y-8">
            {commentsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-secondary rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-secondary rounded w-1/4" />
                      <div className="h-16 bg-secondary rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to start the discussion!
              </div>
            ) : (
              <div className="space-y-8">
                {comments?.map((comment) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={comment.id} 
                    className="flex gap-4 group"
                  >
                    <Avatar className="w-10 h-10 border border-border/50 shrink-0">
                      <AvatarImage src={comment.user?.profileImageUrl || undefined} />
                      <AvatarFallback>{comment.user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            {comment.user?.firstName} {comment.user?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt || new Date()), { addSuffix: true })}
                          </span>
                        </div>
                        {user?.id === comment.userId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Delete this comment?")) {
                                deleteComment.mutate(comment.id);
                              }
                            }}
                            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
