import Image from "next/image";
import StarRating from "./StarRating";
import { ChipsWithStats } from "@/supabase/types";

const PLACEHOLDER_IMG =
  "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp";

export const ChipCard = ({
  chip: { name, photo_url, average_rating, review_count },
}: {
  chip: ChipsWithStats;
}) => {
  return (
    <div className="card bg-base-100 shadow-sm h-full">
      <figure className="relative h-48">
        <Image
          src={photo_url ?? PLACEHOLDER_IMG}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </figure>
      <div className="card-body">
        <StarRating rating={average_rating} count={review_count} />
        <div>
          <h2 className="card-title text-sm">{name}</h2>
        </div>
      </div>
    </div>
  );
};
