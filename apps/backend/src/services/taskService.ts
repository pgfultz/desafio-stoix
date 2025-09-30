import { prisma } from "../prisma";
import { Prisma, type Task } from "@prisma/client";

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class TaskService {
  async getAllTasks(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Task>> {
    console.log(params);
    const page = Math.max(1, params?.page || 1);
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        skip,
        take: limit,
        orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
      }),
      prisma.task.count(),
    ]);

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(id: number): Promise<Task> {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new Error(`Tarefa não encontrada`);
    }

    return task;
  }

  async createTask(data: Prisma.TaskCreateInput): Promise<Task> {
    return prisma.task.create({
      data,
    });
  }

  async updateTask(id: number, data: Prisma.TaskUpdateInput): Promise<Task> {
    try {
      return await prisma.task.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error(`Tarefa não encontrada`);
      }
      throw error;
    }
  }

  async deleteTask(id: number): Promise<void> {
    try {
      await prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error(`Tarefa não encontrada`);
      }
      throw error;
    }
  }

  async toggleTaskCompletion(id: number): Promise<Task> {
    const task = await this.getTaskById(id);
    return this.updateTask(id, { completed: !task.completed });
  }
}

export const taskService = new TaskService();
