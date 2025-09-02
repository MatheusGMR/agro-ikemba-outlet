import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface ProgressiveInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  type?: "text" | "email" | "tel";
  icon?: LucideIcon;
  error?: string;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
  formatter?: (value: string) => string;
}

export function ProgressiveInput({
  label,
  placeholder,
  value,
  onChange,
  onEnter,
  type = "text",
  icon: Icon,
  error,
  required = false,
  className,
  autoFocus = false,
  formatter
}: ProgressiveInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onEnter) {
      e.preventDefault();
      onEnter();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (formatter) {
      newValue = formatter(newValue);
    }
    onChange(newValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-base font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        )}
        <Input
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-12 text-base",
            Icon && "pl-10",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}