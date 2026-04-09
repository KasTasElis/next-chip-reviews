export default function Loading() {
  return (
    <div className="container mx-auto my-5 mb-7">
      {/* Hero section */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
        <div className="skeleton w-24 h-24 rounded-xl" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-4 w-64" />
          <div className="skeleton h-4 w-48" />
        </div>
      </div>

      {/* Chips section */}
      <div>
        <div className="skeleton h-6 w-40 mb-4" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-sm w-[25%]">
              <div className="skeleton h-48 w-full rounded-t-2xl rounded-b-none" />
              <div className="card-body gap-2">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
