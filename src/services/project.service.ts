import { Project, Task } from '../models';
import { ApiError } from '../utils/ApiError';
import { CreateProjectInput, UpdateProjectInput } from '../validation/project.validation';
import { PaginatedResult, IProject } from '../types';

export class ProjectService {
  static async create(data: CreateProjectInput, userId: string): Promise<IProject> {
    const project = await Project.create({ ...data, owner: userId });
    return project;
  }

  static async getAll(
    userId: string,
    userRole: string,
    query: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
  ): Promise<PaginatedResult<IProject>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    // Admins can see all projects, members only see their own
    const filter = userRole === 'admin' ? {} : { owner: userId };

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    return {
      data: projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(projectId: string, userId: string, userRole: string): Promise<IProject> {
    const project = await Project.findById(projectId).populate('owner', 'name email');

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (userRole !== 'admin' && project.owner._id.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    return project;
  }

  static async update(
    projectId: string,
    data: UpdateProjectInput,
    userId: string,
    userRole: string
  ): Promise<IProject> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (userRole !== 'admin' && project.owner.toString() !== userId) {
      throw ApiError.forbidden('You do not have permission to update this project');
    }

    Object.assign(project, data);
    await project.save();

    return project.populate('owner', 'name email');
  }

  static async delete(projectId: string, userId: string, userRole: string): Promise<void> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (userRole !== 'admin' && project.owner.toString() !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this project');
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: projectId });
    await project.deleteOne();
  }
}
