import { z } from 'zod';

export const createProjectSchema = z.object({
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
    status: z.enum(['active', 'inactive', 'completed']).optional().default('active'),
  }),
});

export const updateProjectSchema = z.object({
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
    status: z.enum(['active', 'inactive', 'completed']).optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Project ID is required' }),
  }),
});

export const projectIdSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Project ID is required' }),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
