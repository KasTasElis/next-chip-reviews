type Props = {
  name: string;
  description?: string | null;
  logo_url?: string | null;
};

export const BrandCard = ({ name, description, logo_url }: Props) => {
  return (
    <div className="card bg-base-100 shadow-sm w-full">
      <figure>
        <img
          src={logo_url ?? "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"}
          alt={name}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-sm">{name}</h2>
        {description && <p className="text-xs">{description}</p>}
      </div>
    </div>
  );
};
