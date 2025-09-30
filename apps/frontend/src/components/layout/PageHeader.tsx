import React from "react";
import { motion } from "motion/react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <h1 className="text-4xl sm:text-5xl font-bold">{title}</h1>
      </div>
      <p className="text-muted-foreground text-lg">{subtitle}</p>
    </motion.div>
  );
}
