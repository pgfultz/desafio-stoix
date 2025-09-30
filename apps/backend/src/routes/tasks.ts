import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { csrfProtection } from "../security/csrf";
import { taskService } from "../services/taskService";
import type { Task } from "@prisma/client";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await taskService.getAllTasks({ page, limit });

    res.json({
      data: result.data.map(mapTask),
      pagination: result.pagination,
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const task = await taskService.getTaskById(id);
    res.json(mapTask(task));
  })
);

router.post(
  "/",
  csrfProtection,
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description } = req.body ?? {};
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "title is required and cannot be empty" });
    }
    const created = await taskService.createTask({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
    });
    res.status(201).json(mapTask(created));
  })
);

router.put(
  "/:id",
  csrfProtection,
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const { title, description, completed } = (req.body ?? {}) as {
      title?: string;
      description?: string;
      completed?: boolean;
    };

    const updateData: any = {};
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "title cannot be empty" });
      }
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description =
        typeof description === "string" ? description.trim() : "";
    }
    if (typeof completed === "boolean") {
      updateData.completed = completed;
    }

    const updated = await taskService.updateTask(id, updateData);
    res.json(mapTask(updated));
  })
);

router.delete(
  "/:id",
  csrfProtection,
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    await taskService.deleteTask(id);
    res.status(204).send();
  })
);

function mapTask(t: Task) {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? "",
    completed: !!t.completed,
    created_at: new Date(t.createdAt).toISOString(),
    updated_at: new Date(t.updatedAt).toISOString(),
  };
}

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default router;
