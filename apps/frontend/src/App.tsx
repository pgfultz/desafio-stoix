import React, { useState } from "react";
import { Toaster } from "sonner";
import { AnimatedBackground } from "./components/ui/animated-background";
import { PageHeader } from "./components/layout/PageHeader";
import { LoadingState } from "./components/layout/LoadingState";
import { ErrorState } from "./components/layout/ErrorState";
import { TaskForm } from "./components/tasks/TaskForm";
import { TasksSection } from "./components/tasks/TasksSection";
import { TaskList } from "./components/tasks/TaskList";
import { DeleteTaskDialog } from "./components/tasks/DeleteTaskDialog";
import { useTasks } from "./hooks/useTasks";
import type { Task } from "./lib/api";

function App() {
  const {
    tasks,
    loading,
    error,
    pagination,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    fetchTasks,
  } = useTasks();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    task: Task | null;
  }>({ open: false, task: null });

  const handleCreateTask = async (title: string, description: string) => {
    await createTask(title, description);
  };

  const handleUpdateTask = async (
    task: Task,
    updates: Partial<Pick<Task, "title" | "description">>
  ) => {
    await updateTask(task.id, updates);
  };

  const handleDeleteTask = (task: Task) => {
    setDeleteDialog({ open: true, task });
  };

  const handlePageChange = (page: number) => {
    fetchTasks(page, pagination.limit);
  };

  const confirmDelete = async () => {
    if (!deleteDialog.task) return;

    try {
      await deleteTask(deleteDialog.task.id);
      setDeleteDialog({ open: false, task: null });
    } catch (error) {
      //
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" richColors closeButton />
      <AnimatedBackground />

      <div className="container-app">
        <PageHeader
          title="Gerenciador de Tarefas"
          subtitle="Organize suas tarefas com estilo e eficiência"
        />

        <TaskForm onSubmit={handleCreateTask} />

        {loading && <LoadingState />}

        {error && <ErrorState message={error} />}

        {!loading && !error && (
          <TasksSection taskCount={pagination.total}>
            <TaskList
              tasks={tasks}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              onToggleComplete={toggleTaskComplete}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          </TasksSection>
        )}
      </div>

      <DeleteTaskDialog
        task={deleteDialog.task}
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, task: null })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default App;
