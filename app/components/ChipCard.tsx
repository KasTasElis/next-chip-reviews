export const ChipCard = () => {
  return (
    <div className="card bg-base-100 shadow-sm w-full">
      <figure>
        <img
          src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          alt="Shoes"
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
          <h2 className="card-title text-sm">Pringles Sour Cream & Onion</h2>
        </div>
        <p className="text-xs">
          A card component has a figure, a body part, and inside body there are
          title and actions parts...
        </p>
      </div>
    </div>
  );
};
