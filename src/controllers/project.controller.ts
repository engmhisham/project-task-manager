import { Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

export class ProjectController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.create(req.body, req.user!.id);
      ApiResponse.created(res, project, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProjectService.getAll(req.user!.id, req.user!.role, req.query as any);
      ApiResponse.paginated(res, result.data, result.pagination, 'Projects retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getById(req.params.id, req.user!.id, req.user!.role);
      ApiResponse.success(res, project, 'Project retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.update(
        req.params.id,
        req.body,
        req.user!.id,
        req.user!.role
      );
      ApiResponse.success(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ProjectService.delete(req.params.id, req.user!.id, req.user!.role);
      ApiResponse.success(res, null, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
