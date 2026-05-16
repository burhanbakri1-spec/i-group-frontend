import { ProductGridSkeleton } from '../components/ui/skeletons';

export default function ShopLoading() {
  return (
    <div className="px-6 md:px-12 py-20">
      <div className="h-10 w-48 bg-muted motion-safe:animate-[skeleton-pulse_1.8s_ease-in-out_infinite] motion-reduce:opacity-50 rounded mb-12" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
