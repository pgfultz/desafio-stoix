import { useState, useEffect, useCallback } from "react";
import { api, type Task, type PaginatedResponse } from "../lib/api";
import { toast } from "sonner";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchTasks = useCallback(
    async (page: number = 1, limit: number = 10) => {
      try {
        setLoading(true);
        const response = await api.listTasks(page, limit);
        setTasks(response.data);
        setPagination(response.pagination);
        setError(null);
      } catch (e: any) {
        const errorMessage = e.message || "Erro ao carregar tarefas";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTasks(1, 10);
  }, [fetchTasks]);

  const createTask = useCallback(async (title: string, description: string) => {
    try {
      const task = await api.createTask({
        title: title.trim(),
        description: description.trim(),
      });
      setTasks((prev) => [task, ...prev]);
      toast.success("Tarefa criada com sucesso!");
      return task;
    } catch (e: any) {
      toast.error(e.message || "Falha ao criar tarefa");
      throw e;
    }
  }, []);

  const updateTask = useCallback(
    async (taskId: number, updates: Partial<Task>) => {
      try {
        const updated = await api.updateTask(taskId, updates);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        return updated;
      } catch (e: any) {
        toast.error(e.message || "Falha ao atualizar tarefa");
        throw e;
      }
    },
    []
  );

  const toggleTaskComplete = useCallback(
    async (task: Task) => {
      try {
        const updated = await updateTask(task.id, {
          completed: !task.completed,
        });
        toast.success(
          updated.completed ? "Tarefa concluída!" : "Tarefa reaberta"
        );
      } catch (e: any) {}
    },
    [updateTask]
  );

  const deleteTask = useCallback(
    async (taskId: number) => {
      try {
        await api.deleteTask(taskId);
        await fetchTasks(pagination.page, pagination.limit);
        toast.success("Tarefa excluída com sucesso!");
      } catch (e: any) {
        toast.error(e.message || "Falha ao excluir tarefa");
        throw e;
      }
    },
    [fetchTasks, pagination]
  );

  return {
    tasks,
    loading,
    error,
    pagination,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    fetchTasks,
  };
}
