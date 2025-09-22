import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductInputCardProps {
  product: string;
  onRemove: () => void;
  className?: string;
}

export function ProductInputCard({ product, onRemove, className }: ProductInputCardProps) {
  return (
    <Card className={cn("group hover:shadow-md transition-all duration-200", className)}>
      <CardContent className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-sm">{product}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}