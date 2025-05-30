
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingFallback = () => {
  return (
    <div className="min-h-screen bg-agro-beige">
      {/* Header skeleton */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      
      {/* Hero skeleton */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-28" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};
