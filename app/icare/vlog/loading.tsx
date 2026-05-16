import { VlogGridSkeleton } from '../components/ui/skeletons';

export default function VlogLoading() {
  return (
    <div className="px-6 md:px-12 py-20">
      <div className="h-10 w-40 bg-muted motion-safe:animate-[skeleton-pulse_1.8s_ease-in-out_infinite] motion-reduce:opacity-50 rounded mb-12" />
      <div className="max-w-5xl mx-auto">
        <VlogGridSkeleton count={6} />
      </div>
    </div>
  );
}
