import { cn } from './utils';

function SkeletonPulse({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-muted motion-safe:animate-[skeleton-pulse_1.8s_ease-in-out_infinite]',
        'motion-reduce:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div className="group relative">
      <SkeletonPulse className="aspect-[4/5] w-full rounded-lg" />
      <div className="mt-3 space-y-2 px-1">
        <SkeletonPulse className="h-3 w-1/3 rounded" />
        <SkeletonPulse className="h-4 w-3/4 rounded" />
        <SkeletonPulse className="h-4 w-1/4 rounded" />
      </div>
    </div>
  );
}

function ProductGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: number }) {
  const colClass = columns === 3
    ? 'grid-cols-2 sm:grid-cols-3'
    : columns === 5
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={cn('grid gap-4 sm:gap-6', colClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <div className="space-y-4">
        <SkeletonPulse className="aspect-square w-full rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonPulse key={i} className="w-16 h-16 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <SkeletonPulse className="h-3 w-1/4 rounded" />
        <SkeletonPulse className="h-8 w-3/4 rounded" />
        <SkeletonPulse className="h-6 w-1/3 rounded" />
        <div className="space-y-2">
          <SkeletonPulse className="h-4 w-full rounded" />
          <SkeletonPulse className="h-4 w-5/6 rounded" />
          <SkeletonPulse className="h-4 w-2/3 rounded" />
        </div>
        <SkeletonPulse className="h-10 w-1/3 rounded-full" />
        <SkeletonPulse className="h-12 w-full rounded-full mt-4" />
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex gap-2 border-b pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-8 w-24 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonPulse className="h-6 w-1/3 rounded" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonPulse key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SkeletonPulse className="h-6 w-1/2 rounded" />
          <div className="space-y-3 rounded-xl border p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonPulse className="w-12 h-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1">
                  <SkeletonPulse className="h-3 w-3/4 rounded" />
                  <SkeletonPulse className="h-3 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
          <SkeletonPulse className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

function VlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <SkeletonPulse className="aspect-video w-full rounded-xl" />
          <SkeletonPulse className="h-4 w-3/4 rounded" />
          <SkeletonPulse className="h-3 w-full rounded" />
        </div>
      ))}
    </div>
  );
}

function FAQSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPulse key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <SkeletonPulse className="w-16 h-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonPulse className="h-5 w-2/3 rounded" />
          <SkeletonPulse className="h-4 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function LineItemSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <SkeletonPulse className="w-16 h-16 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-3/4 rounded" />
            <SkeletonPulse className="h-3 w-1/2 rounded" />
          </div>
          <SkeletonPulse className="h-8 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

function StoreLocatorSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <SkeletonPulse className="aspect-video w-full rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border">
            <SkeletonPulse className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-2/3 rounded" />
              <SkeletonPulse className="h-3 w-full rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroBannerSkeleton() {
  return (
    <div className="relative">
      <SkeletonPulse className="aspect-[3/1] w-full rounded-xl" />
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-8">
        <SkeletonPulse className="h-8 w-48 rounded bg-white/20" />
        <SkeletonPulse className="h-4 w-64 rounded bg-white/20" />
      </div>
    </div>
  );
}

export {
  SkeletonPulse,
  ProductCardSkeleton,
  ProductGridSkeleton,
  ProductDetailSkeleton,
  CheckoutSkeleton,
  VlogGridSkeleton,
  FAQSkeleton,
  AccountSkeleton,
  LineItemSkeleton,
  StoreLocatorSkeleton,
  HeroBannerSkeleton,
};
