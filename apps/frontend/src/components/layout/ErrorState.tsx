import React from "react";
import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 text-center"
    >
      <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-destructive" />
      <p className="font-medium text-destructive">{message}</p>
    </motion.div>
  );
}
