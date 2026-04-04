import Link from "next/link";

const chip = {
  name: "Pringles Sour Cream & Onion",
  description:
    "A classic flavor with a perfectly balanced tangy sour cream and savory onion taste. Stacked in their iconic tube for maximum crunch.",
  photo_url:
    "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
  rating: 4.7,
  review_count: 53,
  brand: {
    name: "Pringles",
    slug: "pringles",
    logo_url:
      "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
  },
};

const reviews = [
  {
    id: 1,
    username: "crunchmaster99",
    avatar_url: "https://img.daisyui.com/images/profile/demo/1@94.webp",
    rating: 5,
    review:
      "Absolutely addictive. The sour cream and onion flavor hits just right and the crunch is unmatched. My go-to for movie nights.",
    photo_url:
      "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    created_at: "March 12, 2026",
  },
  {
    id: 2,
    username: "snackologist",
    avatar_url: "https://img.daisyui.com/images/profile/demo/2@94.webp",
    rating: 4,
    review:
      "Great flavor, consistent crunch. Wish the tube was a bit bigger but can't argue with the taste.",
    photo_url: null,
    created_at: "February 28, 2026",
  },
  {
    id: 3,
    username: "chipconnoisseur",
    avatar_url: "https://img.daisyui.com/images/profile/demo/3@94.webp",
    rating: 5,
    review:
      "The gold standard of flavored crisps. Nothing else comes close. The powder coating is perfectly even on every chip.",
    photo_url: null,
    created_at: "January 5, 2026",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">{rating}</div>
      <div className="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className="mask mask-star bg-orange-400"
            aria-label={`${star} star`}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default function ChipsSingle() {
  return (
    <div className="container mx-auto my-5 mb-7">
      {/* Hero section */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="md:w-1/2">
          <div className="card bg-base-100 shadow-sm">
            <figure>
              <img src={chip.photo_url} alt={chip.name} className="w-full" />
            </figure>
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{chip.name}</h1>

          <Link
            href={`/brands/${chip.brand.slug}`}
            className="flex items-center gap-2 hover:opacity-80 transition w-fit"
          >
            <div className="avatar">
              <div className="mask mask-squircle w-8 h-8">
                <img src={chip.brand.logo_url} alt={chip.brand.name} />
              </div>
            </div>
            <span className="text-sm font-medium">{chip.brand.name}</span>
          </Link>

          <p className="text-sm opacity-70">{chip.description}</p>

          <div className="flex items-center gap-2">
            <StarRating rating={chip.rating} />
            <span className="text-sm opacity-40">
              ({chip.review_count} reviews)
            </span>
          </div>

          <button className="btn btn-primary w-fit mt-2">Write a Review</button>
        </div>
      </div>

      {/* Reviews section */}
      <div>
        <h2 className="text-lg font-bold mb-4">
          Reviews ({chip.review_count})
        </h2>

        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="card bg-base-100 shadow-sm">
              <div className="card-body gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="avatar">
                      <div className="mask mask-squircle w-8 h-8">
                        <img src={review.avatar_url} alt={review.username} />
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {review.username}
                    </span>
                  </div>
                  <span className="text-xs opacity-40">
                    {review.created_at}
                  </span>
                </div>

                <StarRating rating={review.rating} />

                <p className="text-sm">{review.review}</p>

                {review.photo_url && (
                  <div className="card bg-base-100">
                    <figure>
                      <img
                        src={review.photo_url}
                        alt="Review photo"
                        className="rounded-lg max-h-48 object-cover"
                      />
                    </figure>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
