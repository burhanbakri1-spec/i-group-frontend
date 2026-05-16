import { ProductGridSkeleton } from './components/ui/skeletons';

export default function IcareLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-white">
      <ProductGridSkeleton count={4} />
    </div>
  );
}
