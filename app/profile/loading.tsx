export default function Loading() {
  return (
    <div className="w-full max-w-lg min-w-80 mx-auto py-10 px-6">
      <div className="skeleton h-8 w-36 mb-6" />

      <div className="flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex flex-col gap-1">
          <div className="skeleton h-4 w-12 mb-1" />
          <div className="skeleton h-40 w-full rounded-box" />
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1">
          <div className="skeleton h-4 w-20 mb-1" />
          <div className="skeleton h-10 w-full" />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <div className="skeleton h-4 w-12 mb-1" />
          <div className="skeleton h-10 w-full" />
        </div>

        <div className="skeleton h-10 w-full mt-2" />
      </div>
    </div>
  );
}
