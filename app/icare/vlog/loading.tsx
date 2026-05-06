export default function VlogLoading() {
  return (
    <div className="px-6 md:px-12 py-20">
      <div className="h-10 w-40 bg-gray-200 rounded animate-pulse mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
