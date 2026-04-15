import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema, type InsertPost } from "@shared/schema";
import { useCreatePost, usePosts } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clapperboard, Image as ImageIcon, Loader2, Link as LinkIcon, Upload, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const types = [
  { id: "book", label: "Book", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "animation", label: "Animation", icon: Clapperboard, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "comic", label: "Comic", icon: ImageIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export function CreatePost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createPost = useCreatePost();
  const { data: books } = usePosts("book");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useFile, setUseFile] = useState(false);
  
  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      mediaType: "book",
      title: "",
      description: "",
      url: undefined,
      filePath: undefined,
      thumbnailUrl: "",
      basedOnBookId: undefined,
    },
  });

  const mediaType = form.watch("mediaType");

  const onSubmit = async (data: InsertPost) => {
    let finalData = data;
    
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message);
        finalData = { ...data, filePath: uploadData.filePath, url: undefined };
      } catch (err) {
        toast({ variant: "destructive", title: "Upload failed", description: err instanceof Error ? err.message : "Could not upload file" });
        return;
      }
    }

    createPost.mutate(finalData, {
      onSuccess: () => {
        toast({ title: "Success!", description: "Your post has been published." });
        setLocation("/");
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Error", description: err.message || "Failed to create post" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-8 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">Share Discovery</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Found something amazing? Share it with the community.
          </p>

          <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden rounded-2xl">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="space-y-4">
                  <Label className="text-base font-semibold">What are you sharing?</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {types.map((type) => {
                      const isSelected = form.watch("mediaType") === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => form.setValue("mediaType", type.id as any, { shouldValidate: true })}
                          className={`
                            flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                            ${isSelected 
                              ? `border-primary bg-primary/5 shadow-md` 
                              : `border-border/50 bg-card hover:border-primary/30 hover:bg-secondary/50`}
                          `}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isSelected ? type.bg : 'bg-secondary'}`}>
                            <type.icon className={`w-6 h-6 ${isSelected ? type.color : 'text-muted-foreground'}`} />
                          </div>
                          <span className={`font-semibold text-sm ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. My Novel, Animation Demo" 
                      className="h-12 rounded-xl border-border/50 focus-visible:ring-primary/20 text-base"
                      {...form.register("title")} 
                    />
                  </div>

                  {mediaType === "animation" && (
                    <div className="space-y-2">
                      <Label htmlFor="basedOnBookId" className="text-sm font-semibold">Based on Book (Optional)</Label>
                      <Select 
                        onValueChange={(val) => form.setValue("basedOnBookId", val === "none" ? undefined : parseInt(val))}
                        value={form.watch("basedOnBookId")?.toString() || "none"}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-border/50">
                          <SelectValue placeholder="Select a book..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {books?.map((book) => (
                            <SelectItem key={book.id} value={book.id.toString()}>{book.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Media Source</Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setUseFile(false);
                          setSelectedFile(null);
                          form.setValue("filePath", undefined);
                          form.setValue("url", "");
                        }}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${!useFile ? "border-primary bg-primary/5" : "border-border/50"}`}
                      >
                        <LinkIcon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-semibold">External Link</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUseFile(true);
                          form.setValue("url", undefined);
                        }}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${useFile ? "border-primary bg-primary/5" : "border-border/50"}`}
                      >
                        <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-semibold">Upload File</p>
                      </button>
                    </div>
                  </div>

                  {!useFile ? (
                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-sm font-semibold flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-muted-foreground" /> Link to content
                      </Label>
                      <Input 
                        id="url" 
                        placeholder="https://..." 
                        className="h-12 rounded-xl border-border/50 focus-visible:ring-primary/20"
                        {...form.register("url")} 
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="file" className="text-sm font-semibold">Upload your file</Label>
                      <div className="relative">
                        <Input 
                          id="file"
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="h-12 rounded-xl border-border/50 file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:cursor-pointer"
                        />
                        {selectedFile && (
                          <p className="text-xs text-muted-foreground mt-2">Selected: {selectedFile.name}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl" className="text-sm font-semibold">Cover Image URL (Optional)</Label>
                    <Input 
                      id="thumbnailUrl" 
                      placeholder="https://.../image.jpg" 
                      className="h-12 rounded-xl border-border/50 focus-visible:ring-primary/20"
                      {...form.register("thumbnailUrl")} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Your Thoughts</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Why do you love this? What makes it special?" 
                      className="min-h-[150px] resize-none rounded-xl border-border/50 focus-visible:ring-primary/20 text-base p-4"
                      {...form.register("description")} 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/")}
                    className="flex-1 h-12 rounded-xl font-semibold hover-elevate"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPost.isPending}
                    className="flex-[2] h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover-elevate"
                  >
                    {createPost.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...</>
                    ) : (
                      "Publish Post"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
