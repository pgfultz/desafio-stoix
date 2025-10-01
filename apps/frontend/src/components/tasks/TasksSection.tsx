import React from "react";
import { ListTodo } from "lucide-react";
import type { Task } from "../../lib/api";

interface TasksSectionProps {
  taskCount: number;
  children: React.ReactNode;
}

export function TasksSection({ taskCount, children }: TasksSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ListTodo className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-semibold">
          Minhas Tarefas
          <span className="ml-2 text-sm text-muted-foreground font-normal">
            ({taskCount} {taskCount === 1 ? "tarefa" : "tarefas"})
          </span>
        </h2>
      </div>
      {children}
    </div>
  );
}
