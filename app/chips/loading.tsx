export default function Loading() {
  return (
    <div className="container mx-auto my-5">
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-lg font-bold">All Chips</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
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
  );
}
