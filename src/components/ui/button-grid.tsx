import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ButtonOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

interface ButtonGridProps {
  options: ButtonOption[];
  value?: string;
  onSelect: (value: string) => void;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function ButtonGrid({ 
  options, 
  value, 
  onSelect, 
  className,
  columns = 2 
}: ButtonGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cn(
              "p-4 rounded-lg border-2 transition-all duration-200",
              "hover:shadow-md hover:scale-105",
              "flex flex-col items-center text-center space-y-2",
              "min-h-[100px] justify-center",
              isSelected 
                ? "border-primary bg-primary/5 text-primary shadow-md" 
                : "border-border hover:border-primary/50 bg-card text-card-foreground"
            )}
          >
            {Icon && (
              <Icon className={cn(
                "h-6 w-6",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
            )}
            <span className="font-medium text-sm">{option.label}</span>
            {option.description && (
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}