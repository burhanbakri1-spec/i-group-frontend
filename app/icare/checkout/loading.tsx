export default function CheckoutLoading() {
  return (
    <div className="px-6 md:px-12 py-20 max-w-4xl mx-auto">
      <div className="h-10 w-56 bg-gray-200 rounded animate-pulse mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-3 space-y-6">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-4">
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mt-8" />
          <div className="space-y-4">
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="h-40 w-full bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-12 w-full bg-gray-200 rounded-full animate-pulse mt-4" />
        </div>
      </div>
    </div>
  );
}
