import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  users,
  posts,
  comments,
  coverRequests,
  type InsertPost,
  type InsertComment,
  type InsertCoverRequest,
  type PostWithUser,
  type CommentWithUser,
  type CoverRequest,
  type User,
} from "@shared/schema";

export interface IStorage {
  getPosts(type?: string): Promise<PostWithUser[]>;
  getPostStats(): Promise<{ books: number; animations: number; comics: number }>;
  getPost(id: number): Promise<PostWithUser | undefined>;
  createPost(userId: string, post: InsertPost): Promise<PostWithUser>;
  deletePost(id: number): Promise<void>;
  updateUserRole(userId: string, role: string): Promise<void>;

  getComments(postId: number): Promise<CommentWithUser[]>;
  createComment(userId: string, postId: number, comment: InsertComment): Promise<CommentWithUser>;
  deleteComment(id: number): Promise<void>;
  getComment(id: number): Promise<CommentWithUser | undefined>;

  getCoverRequests(postId: number): Promise<(CoverRequest & { user: User })[]>;
  createCoverRequest(userId: string, postId: number, request: InsertCoverRequest): Promise<CoverRequest & { user: User }>;
}

export class DatabaseStorage implements IStorage {
  async getPosts(type?: string): Promise<PostWithUser[]> {
    let query = db.select({
      post: posts,
      user: users
    }).from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt));

    if (type) {
      query = query.where(eq(posts.mediaType, type)) as any;
    }

    const results = await query;
    return results.map(r => ({
      ...r.post,
      user: r.user
    }));
  }

  async getPostStats(): Promise<{ books: number; animations: number; comics: number }> {
    const results = await db.select({
      type: posts.mediaType,
    }).from(posts);

    const stats = {
      books: 0,
      animations: 0,
      comics: 0
    };

    results.forEach(r => {
      if (r.type === 'book') stats.books++;
      else if (r.type === 'animation') stats.animations++;
      else if (r.type === 'comic') stats.comics++;
    });

    return stats;
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await db.update(users).set({ role }).where(eq(users.id, userId));
  }

  async getPost(id: number): Promise<PostWithUser | undefined> {
    const results = await db.select({
      post: posts,
      user: users
    }).from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, id));

    if (results.length === 0) return undefined;
    
    const post = results[0].post;
    const user = results[0].user;

    let basedOnBook;
    if (post.basedOnBookId) {
      const bookResults = await db.select().from(posts).where(eq(posts.id, post.basedOnBookId));
      if (bookResults.length > 0) {
        basedOnBook = bookResults[0];
      }
    }

    const coverRequestsResults = await this.getCoverRequests(id);

    return {
      ...post,
      user,
      basedOnBook,
      coverRequests: coverRequestsResults
    };
  }

  async createPost(userId: string, post: InsertPost): Promise<PostWithUser> {
    const [newPost] = await db.insert(posts).values({
      ...post,
      userId
    }).returning();
    return (await this.getPost(newPost.id))!;
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.postId, id));
    await db.delete(coverRequests).where(eq(coverRequests.postId, id));
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getComments(postId: number): Promise<CommentWithUser[]> {
    const results = await db.select({
      comment: comments,
      user: users
    }).from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));

    return results.map(r => ({
      ...r.comment,
      user: r.user
    }));
  }

  async createComment(userId: string, postId: number, comment: InsertComment): Promise<CommentWithUser> {
    const [newComment] = await db.insert(comments).values({
      ...comment,
      userId,
      postId
    }).returning();
    return (await this.getComment(newComment.id))!;
  }

  async getComment(id: number): Promise<CommentWithUser | undefined> {
     const results = await db.select({
      comment: comments,
      user: users
    }).from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.id, id));

    if (results.length === 0) return undefined;
    return {
      ...results[0].comment,
      user: results[0].user
    };
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async getCoverRequests(postId: number): Promise<(CoverRequest & { user: User })[]> {
    const results = await db.select({
      request: coverRequests,
      user: users
    }).from(coverRequests)
    .innerJoin(users, eq(coverRequests.userId, users.id))
    .where(eq(coverRequests.postId, postId))
    .orderBy(desc(coverRequests.createdAt));

    return results.map(r => ({
      ...r.request,
      user: r.user
    }));
  }

  async createCoverRequest(userId: string, postId: number, request: InsertCoverRequest): Promise<CoverRequest & { user: User }> {
    const [newRequest] = await db.insert(coverRequests).values({
      ...request,
      userId,
      postId
    }).returning();
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return {
      ...newRequest,
      user
    };
  }
}

export const storage = new DatabaseStorage();
