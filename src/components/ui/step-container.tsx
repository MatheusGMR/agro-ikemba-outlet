import * as React from "react";
import { cn } from "@/lib/utils";

interface StepContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  isVisible: boolean;
}

export function StepContainer({ 
  children, 
  title, 
  description, 
  className,
  isVisible 
}: StepContainerProps) {
  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-in-out",
        isVisible ? "animate-fade-in opacity-100" : "opacity-0 pointer-events-none absolute",
        className
      )}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-poppins font-semibold text-foreground mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-base">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}