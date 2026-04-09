export default function Loading() {
  return (
    <div className="container mx-auto my-5 mb-7">
      {/* Hero section */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="md:w-1/2">
          <div className="skeleton h-48 w-full" />
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-10 w-36" />
        </div>
      </div>

      {/* Reviews section */}
      <div>
        <h2 className="text-lg font-bold mb-4">Reviews</h2>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-sm p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="skeleton h-8 w-8 rounded-full" />
                <div className="skeleton h-4 w-24" />
              </div>
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
