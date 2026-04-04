export const BrandCard = () => {
  return (
    <div className="card bg-base-100 shadow-sm w-full">
      <figure>
        <img
          src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          alt="Shoes"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-sm">Lay's</h2>

        <p className="text-xs">
          A card component has a figure, a body part, and inside body there are
          title and actions parts...
        </p>
      </div>
    </div>
  );
};
