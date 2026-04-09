import Image from "next/image";

type Props = {
  name: string;
  description?: string | null;
  logo_url?: string | null;
};

export const BrandCard = ({ name, logo_url }: Props) => {
  const src =
    logo_url ??
    "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp";

  return (
    <div className="card bg-base-100 shadow-sm max-w-48 w-full">
      <figure className="relative h-32">
        <Image src={src} alt={name} fill className="object-cover" />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-sm">{name}</h2>
      </div>
    </div>
  );
};
