import { z } from 'zod';
import { insertPostSchema, insertCommentSchema } from './schema';
import type { PostWithUser, CommentWithUser } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  posts: {
    list: {
      method: 'GET' as const,
      path: '/api/posts' as const,
      input: z.object({
        type: z.enum(['book', 'animation', 'comic']).optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<PostWithUser>()),
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/posts/stats' as const,
      responses: {
        200: z.custom<{ books: number; animations: number; comics: number }>(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/posts/:id' as const,
      responses: {
        200: z.custom<PostWithUser>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/posts' as const,
      input: insertPostSchema,
      responses: {
        201: z.custom<PostWithUser>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/posts/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  comments: {
    list: {
      method: 'GET' as const,
      path: '/api/posts/:postId/comments' as const,
      responses: {
        200: z.array(z.custom<CommentWithUser>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/posts/:postId/comments' as const,
      input: insertCommentSchema,
      responses: {
        201: z.custom<CommentWithUser>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/comments/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
