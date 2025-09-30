import React from "react";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { InlineEditable } from "./InlineEditable";
import type { Task } from "../../api";

interface TaskItemProps {
  task: Task;
  index: number;
  onToggleComplete: (task: Task) => void;
  onUpdate: (
    task: Task,
    updates: Partial<Pick<Task, "title" | "description">>
  ) => void;
  onDelete: (task: Task) => void;
}

export function TaskItem({
  task,
  index,
  onToggleComplete,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <Card
        className={`task-item ${task.completed ? "task-item-completed" : ""}`}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="pt-1">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete(task)}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <InlineEditable
                value={task.title}
                onSave={(val) =>
                  val !== task.title && onUpdate(task, { title: val })
                }
                className={`text-lg font-semibold ${
                  task.completed ? "line-through text-muted-foreground" : ""
                }`}
              />
              <InlineEditable
                value={task.description}
                placeholder="Adicionar descrição..."
                onSave={(val) =>
                  val !== task.description &&
                  onUpdate(task, { description: val })
                }
                className={`text-sm ${
                  task.completed
                    ? "text-muted-foreground"
                    : "text-foreground/80"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">
                #{task.id}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
