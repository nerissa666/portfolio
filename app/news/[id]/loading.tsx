export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Back button skeleton */}
        <div className="h-6 w-24 bg-gray-200 rounded mb-8"></div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Header skeleton */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>

            {/* Button skeleton */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="h-12 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
