export default function ProductLoading() {
  return (
    <div className="px-6 md:px-12 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
        <div className="space-y-6 pt-8">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
