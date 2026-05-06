export default function FAQLoading() {
  return (
    <div className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
      <div className="h-10 w-36 bg-gray-200 rounded animate-pulse mb-12" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 w-full bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
