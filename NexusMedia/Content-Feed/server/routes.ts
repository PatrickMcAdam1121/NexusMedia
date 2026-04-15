import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.posts.list.path, async (req, res) => {
    try {
      const { type } = req.query;
      const posts = await storage.getPosts(typeof type === 'string' ? type : undefined);
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/role", isAuthenticated, async (req: any, res) => {
    try {
      const { role } = z.object({ role: z.enum(['Author', 'Publisher', 'Artist']) }).parse(req.body);
      await storage.updateUserRole(req.user.claims.sub, role);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ message: "Invalid role" });
    }
  });

  app.get(api.posts.stats.path, async (req, res) => {
    try {
      const stats = await storage.getPostStats();
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.posts.get.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.posts.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.posts.create.input.parse(req.body);
      const post = await storage.createPost(req.user.claims.sub, input);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.posts.delete.path, isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
         return res.status(400).json({ message: "Invalid ID" });
      }
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deletePost(id);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.comments.list.path, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid Post ID" });
      }
      const comments = await storage.getComments(postId);
      res.json(comments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.comments.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
         return res.status(400).json({ message: "Invalid Post ID" });
      }
      const input = api.comments.create.input.parse(req.body);
      const comment = await storage.createComment(req.user.claims.sub, postId, input);
      res.status(201).json(comment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.comments.delete.path, isAuthenticated, async (req: any, res) => {
     try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
         return res.status(400).json({ message: "Invalid ID" });
      }
      const comment = await storage.getComment(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      if (comment.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteComment(id);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts/:postId/cover-requests", isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { artUrl } = z.object({ artUrl: z.string().url() }).parse(req.body);
      const request = await storage.createCoverRequest(req.user.claims.sub, postId, { artUrl });
      res.status(201).json(request);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/upload", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.headers["content-type"]?.includes("multipart/form-data")) {
        return res.status(400).json({ message: "Invalid content type" });
      }

      const busboy = (await import("busboy")).default;
      const bb = busboy({ headers: req.headers });
      let file: { filename: string; content: Buffer } | null = null;

      bb.on("file", (_fieldname, fileStream, info) => {
        const chunks: Buffer[] = [];
        fileStream.on("data", (chunk) => chunks.push(chunk));
        fileStream.on("end", () => {
          file = { filename: info.filename, content: Buffer.concat(chunks) };
        });
      });

      bb.on("close", async () => {
        if (!file) {
          return res.status(400).json({ message: "No file provided" });
        }

        try {
          const fs = await import("fs/promises");
          const path = await import("path");
          const { fileURLToPath } = await import("url");
          const __dirname = path.dirname(fileURLToPath(import.meta.url));
          const uploadDir = path.join(__dirname, "../public/uploads");
          await fs.mkdir(uploadDir, { recursive: true });

          const timestamp = Date.now();
          const safeFilename = file.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
          const filename = `${timestamp}-${safeFilename}`;
          const filePath = path.join(uploadDir, filename);
          
          await fs.writeFile(filePath, file.content);
          res.json({ filePath: `/uploads/${filename}` });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Upload failed" });
        }
      });

      req.pipe(bb);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload error" });
    }
  });

  return httpServer;
}
