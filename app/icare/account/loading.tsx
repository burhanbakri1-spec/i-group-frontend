export default function AccountLoading() {
  return (
    <div className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
      <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-10" />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-px bg-gray-200" />
        <div className="space-y-4">
          <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
