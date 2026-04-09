import Image from "next/image";
import StarRating from "./StarRating";

const PLACEHOLDER_IMG =
  "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp";

export const ChipCard = ({
  name,
  photo_url,
  rating,
  reviewCount,
}: {
  name: string;
  photo_url?: string | null;
  description?: string | null;
  rating?: number;
  reviewCount?: number;
}) => {
  return (
    <div className="card bg-base-100 shadow-sm">
      <figure className="relative h-48">
        <Image
          src={photo_url ?? PLACEHOLDER_IMG}
          alt={name}
          fill
          className="object-cover"
        />
      </figure>
      <div className="card-body">
        <StarRating rating={rating} count={reviewCount} />
        <div>
          <h2 className="card-title text-sm">{name}</h2>
        </div>
      </div>
    </div>
  );
};
