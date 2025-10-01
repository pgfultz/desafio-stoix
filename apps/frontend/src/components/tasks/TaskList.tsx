import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ListTodo } from "lucide-react";
import { TaskItem } from "./TaskItem";
import { Pagination } from "../ui/pagination";
import type { Task } from "../../lib/api";

interface TaskListProps {
  tasks: Task[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onToggleComplete: (task: Task) => void;
  onUpdate: (task: Task, updates: Partial<Pick<Task, "title" | "description">>) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({
  tasks,
  currentPage,
  totalPages,
  onPageChange,
  onToggleComplete,
  onUpdate,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-12 text-center"
      >
        <ListTodo className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-lg text-muted-foreground">
          Nenhuma tarefa ainda. Adicione uma para começar!
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            onToggleComplete={onToggleComplete}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </motion.div>
      )}
    </>
  );
}
