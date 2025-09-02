import * as React from "react";
import { cn } from "@/lib/utils";
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}
export function ProgressBar({
  currentStep,
  totalSteps,
  className
}: ProgressBarProps) {
  const progressPercentage = currentStep / totalSteps * 100;
  return <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Etapa {currentStep} de {totalSteps}</span>
        
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out" style={{
        width: `${progressPercentage}%`
      }} />
      </div>
    </div>;
}