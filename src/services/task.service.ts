import { Task, Project } from '../models';
import { ApiError } from '../utils/ApiError';
import { CreateTaskInput, UpdateTaskInput } from '../validation/task.validation';
import { PaginatedResult, ITask } from '../types';

export class TaskService {
  static async create(
    projectId: string,
    data: CreateTaskInput,
    userId: string,
    userRole: string
  ): Promise<ITask> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (userRole !== 'admin' && project.owner.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    const task = await Task.create({
      ...data,
      dueDate: new Date(data.dueDate),
      project: projectId,
    });

    return task.populate('assignedTo', 'name email');
  }

  static async getAll(
    projectId: string,
    userId: string,
    userRole: string,
    query: {
      status?: string;
      priority?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    }
  ): Promise<PaginatedResult<ITask>> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (userRole !== 'admin' && project.owner.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = { project: projectId };
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    return {
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(
    projectId: string,
    taskId: string,
    userId: string,
    userRole: string
  ): Promise<ITask> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (userRole !== 'admin' && project.owner.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    const task = await Task.findOne({ _id: taskId, project: projectId }).populate(
      'assignedTo',
      'name email'
    );

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    return task;
  }

  static async update(
    projectId: string,
    taskId: string,
    data: UpdateTaskInput,
    userId: string,
    userRole: string
  ): Promise<ITask> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (userRole !== 'admin' && project.owner.toString() !== userId) {
      throw ApiError.forbidden('You do not have permission to update tasks in this project');
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    Object.assign(task, updateData);
    await task.save();

    return task.populate('assignedTo', 'name email');
  }

  static async delete(
    projectId: string,
    taskId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (userRole !== 'admin' && project.owner.toString() !== userId) {
      throw ApiError.forbidden('You do not have permission to delete tasks in this project');
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    await task.deleteOne();
  }
}
