import { ProductDetailSkeleton } from '../../components/ui/skeletons';

export default function ProductLoading() {
  return (
    <div className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
      <ProductDetailSkeleton />
    </div>
  );
}
