import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

export function TextReveal({ children, className, ...props }: TextRevealProps) {
  return (
    <span className={`relative overflow-hidden ${className || ""}`}>
      <motion.span
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.span>
    </span>
  );
}

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
}
