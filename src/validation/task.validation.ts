import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title is required')
      .max(200, 'Title must not exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .trim()
      .optional()
      .default(''),
    status: z.enum(['pending', 'in_progress', 'done']).optional().default('pending'),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    dueDate: z
      .string({ required_error: 'Due date is required' })
      .datetime({ message: 'Invalid date format. Use ISO 8601 format.' })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.')),
    assignedTo: z.string().optional(),
  }),
  params: z.object({
    projectId: z.string({ required_error: 'Project ID is required' }),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title must not exceed 200 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .trim()
      .optional(),
    status: z.enum(['pending', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z
      .string()
      .datetime({ message: 'Invalid date format' })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional(),
    assignedTo: z.string().optional(),
  }),
  params: z.object({
    projectId: z.string({ required_error: 'Project ID is required' }),
    taskId: z.string({ required_error: 'Task ID is required' }),
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    projectId: z.string({ required_error: 'Project ID is required' }),
    taskId: z.string({ required_error: 'Task ID is required' }),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(['title', 'status', 'priority', 'dueDate', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
