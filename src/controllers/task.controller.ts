import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

export class TaskController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.create(
        req.params.projectId,
        req.body,
        req.user!.id,
        req.user!.role
      );
      ApiResponse.created(res, task, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await TaskService.getAll(
        req.params.projectId,
        req.user!.id,
        req.user!.role,
        req.query as any
      );
      ApiResponse.paginated(res, result.data, result.pagination, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getById(
        req.params.projectId,
        req.params.taskId,
        req.user!.id,
        req.user!.role
      );
      ApiResponse.success(res, task, 'Task retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.update(
        req.params.projectId,
        req.params.taskId,
        req.body,
        req.user!.id,
        req.user!.role
      );
      ApiResponse.success(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await TaskService.delete(
        req.params.projectId,
        req.params.taskId,
        req.user!.id,
        req.user!.role
      );
      ApiResponse.success(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
