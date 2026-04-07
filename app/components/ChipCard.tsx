const PLACEHOLDER_IMG = "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp";

export const ChipCard = ({ name, photo_url, description }: { name: string; photo_url?: string | null; description?: string | null }) => {
  return (
    <div className="card bg-base-100 shadow-sm w-full">
      <figure>
        <img
          src={photo_url ?? PLACEHOLDER_IMG}
          alt={name}
        />
      </figure>
      <div className="card-body">
        <div className="flex items-center gap-2">
          <div className="text-sm">4.7</div>
          <div className="rating">
            <div
              className="mask mask-star bg-orange-400"
              aria-label="1 star"
            ></div>
            <div
              className="mask mask-star bg-orange-400"
              aria-label="2 star"
            ></div>
            <div
              className="mask mask-star bg-orange-400"
              aria-label="3 star"
              aria-current="true"
            ></div>
            <div
              className="mask mask-star bg-orange-400"
              aria-label="4 star"
            ></div>
            <div
              className="mask mask-star bg-orange-400"
              aria-label="5 star"
            ></div>
          </div>
          <div className="text-sm opacity-40">(53)</div>
        </div>
        <div>
          <h2 className="card-title text-sm">{name}</h2>
        </div>
        {description && <p className="text-xs">{description}</p>}
      </div>
    </div>
  );
};
