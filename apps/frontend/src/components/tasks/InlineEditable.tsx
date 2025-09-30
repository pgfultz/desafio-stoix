import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit3, Check, X } from "lucide-react";

interface InlineEditableProps {
  value: string;
  onSave: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function InlineEditable({
  value,
  onSave,
  placeholder,
  className,
}: InlineEditableProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => setVal(value), [value]);

  const handleSave = () => {
    onSave(val.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setVal(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div
        className={`cursor-text group ${className || ""}`}
        onClick={() => setEditing(true)}
      >
        {value || (
          <span className="text-muted-foreground italic">
            {placeholder || "Clique para editar"}
          </span>
        )}
        <Edit3 className="w-3 h-3 inline-block ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSave();
          } else if (e.key === "Escape") {
            handleCancel();
          }
        }}
        className={className}
      />
      <Button
        size="icon"
        variant="ghost"
        onClick={handleSave}
        className="shrink-0"
      >
        <Check className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleCancel}
        className="shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
