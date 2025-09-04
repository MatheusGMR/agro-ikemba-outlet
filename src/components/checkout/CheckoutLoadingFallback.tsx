import { Skeleton } from '@/components/ui/skeleton';

export const CheckoutLoadingFallback = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      
      {/* Checkout content skeleton */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar skeleton */}
          <div className="mb-8">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>
          
          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <Skeleton className="h-8 w-40 mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <Skeleton className="h-8 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
            
            {/* Right column - Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border p-6 space-y-4">
                <Skeleton className="h-8 w-36" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};