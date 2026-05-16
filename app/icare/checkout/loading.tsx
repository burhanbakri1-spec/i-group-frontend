import { CheckoutSkeleton } from '../components/ui/skeletons';

export default function CheckoutLoading() {
  return (
    <div className="px-6 md:px-12 py-20 max-w-4xl mx-auto">
      <div className="h-10 w-56 bg-muted motion-safe:animate-[skeleton-pulse_1.8s_ease-in-out_infinite] motion-reduce:opacity-50 rounded mb-12" />
      <CheckoutSkeleton />
    </div>
  );
}
