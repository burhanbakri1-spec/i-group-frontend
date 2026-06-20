import { ProductGridSkeleton } from '../components/ui/skeletons';

export default function DynamicPageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#F1F0ED] px-6">
      <div className="w-full max-w-[860px]">
        <ProductGridSkeleton count={2} />
      </div>
    </div>
  );
}