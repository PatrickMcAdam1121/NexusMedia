import { pgTable, text, serial, integer, timestamp, varchar, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  mediaType: text("media_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url"),
  filePath: text("file_path"),
  thumbnailUrl: text("thumbnail_url"),
  basedOnBookId: integer("based_on_book_id"),
  price: numeric("price"), // Optional price for purchasing
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coverRequests = pgTable("cover_requests", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  artUrl: text("art_url").notNull(),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id").notNull(), // Payer
  toUserId: varchar("to_user_id").notNull(), // Recipient
  postId: integer("post_id"), // Optional - null for donations to developer
  amount: numeric("amount").notNull(),
  type: text("type").notNull(), // 'purchase', 'donation', 'tip'
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default('pending'), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  basedOnBook: one(posts, {
    fields: [posts.basedOnBookId],
    references: [posts.id],
    relationName: "bookAnimations",
  }),
  animations: many(posts, {
    relationName: "bookAnimations",
  }),
  coverRequests: many(coverRequests),
  transactions: many(transactions, {
    relationName: "postTransactions",
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const coverRequestsRelations = relations(coverRequests, ({ one }) => ({
  post: one(posts, {
    fields: [coverRequests.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [coverRequests.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  fromUser: one(users, {
    fields: [transactions.fromUserId],
    references: [users.id],
    relationName: "transactionsFrom",
  }),
  toUser: one(users, {
    fields: [transactions.toUserId],
    references: [users.id],
    relationName: "transactionsTo",
  }),
  post: one(posts, {
    fields: [transactions.postId],
    references: [posts.id],
    relationName: "postTransactions",
  }),
}));

export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, userId: true }).extend({
  basedOnBookId: z.number().optional(),
  url: z.string().url().optional().nullable(),
  filePath: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
}).refine((data) => data.url || data.filePath, {
  message: "Either a URL or file upload is required",
  path: ["url"],
});

export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, userId: true, postId: true });
export const insertCoverRequestSchema = createInsertSchema(coverRequests).omit({ id: true, createdAt: true, userId: true, postId: true, status: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, status: true });

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type CoverRequest = typeof coverRequests.$inferSelect;
export type InsertCoverRequest = z.infer<typeof insertCoverRequestSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type PostStats = {
  books: number;
  animations: number;
  comics: number;
};

import { type User } from "./models/auth";

export type PostWithUser = Post & { 
  user: User;
  basedOnBook?: Post;
  coverRequests?: (CoverRequest & { user: User })[];
};
export type CommentWithUser = Comment & { user: User };
