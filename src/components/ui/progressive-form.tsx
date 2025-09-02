import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StepContainer } from "@/components/ui/step-container";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ProgressiveFormStep {
  id: string;
  title: string;
  description?: string;
  component: React.ReactNode;
  validate?: () => boolean | string;
  optional?: boolean;
}

interface ProgressiveFormProps {
  steps: ProgressiveFormStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitText?: string;
  className?: string;
  allowBack?: boolean;
}

export function ProgressiveForm({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  isSubmitting = false,
  submitText = "Finalizar",
  className,
  allowBack = true
}: ProgressiveFormProps) {
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const currentStepData = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStepData.validate) {
      const validation = currentStepData.validate();
      if (validation !== true) {
        // Validation failed
        return;
      }
    }

    if (isLastStep) {
      onSubmit();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep && allowBack) {
      onStepChange(currentStep - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)} onKeyDown={handleKeyDown}>
      {/* Progress Bar */}
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Steps Container */}
      <div className="relative min-h-[400px] mb-8">
        {steps.map((step, index) => (
          <StepContainer
            key={step.id}
            title={step.title}
            description={step.description}
            isVisible={currentStep === index + 1}
          >
            {step.component}
          </StepContainer>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isFirstStep || !allowBack}
          className={cn(
            "flex items-center gap-2",
            (isFirstStep || !allowBack) && "invisible"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="flex items-center gap-2">
          {currentStepData.optional && !isLastStep && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onStepChange(currentStep + 1)}
              className="text-muted-foreground"
            >
              Pular
            </Button>
          )}
          
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Enviando...
              </>
            ) : (
              <>
                {isLastStep ? submitText : "Próximo"}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}