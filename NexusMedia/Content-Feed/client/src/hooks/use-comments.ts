import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertComment } from "@shared/schema";

export function useComments(postId: number) {
  return useQuery({
    queryKey: [api.comments.list.path, postId],
    queryFn: async () => {
      if (!postId || isNaN(postId)) return [];
      const url = buildUrl(api.comments.list.path, { postId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch comments");
      return api.comments.list.responses[200].parse(await res.json());
    },
    enabled: !!postId,
  });
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertComment, "postId">) => {
      const url = buildUrl(api.comments.create.path, { postId });
      const res = await fetch(url, {
        method: api.comments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.comments.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create comment");
      }
      return api.comments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.comments.list.path, postId] }),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.comments.delete.path, { id });
      const res = await fetch(url, { method: api.comments.delete.method, credentials: "include" });
      if (res.status === 404) throw new Error("Comment not found");
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      // Invalidate all comment queries since we don't know the exact postId here
      // Real app might return the deleted comment to invalidate selectively
      queryClient.invalidateQueries({ queryKey: [api.comments.list.path] });
    },
  });
}
