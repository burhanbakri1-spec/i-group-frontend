export default function IcareLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
