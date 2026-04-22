import Image from "next/image";

const PLACEHOLDER =
  "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp";

export function UserProfile({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full relative overflow-hidden shrink-0">
        <Image
          src={avatarUrl ?? PLACEHOLDER}
          alt={displayName}
          fill
          sizes="32px"
          className="object-cover"
        />
      </div>
      <span className="text-md font-medium">{displayName}</span>
    </div>
  );
}
