import clsx from "clsx";
import Image from "next/image";

const getInitials = (name: string): string => {
  const names = name.split(" ");
  if (names.length === 1) {
    if (names[0].length === 1) {
      return names[0][0].toUpperCase();
    }
    return `${names[0][0]}${names[0][1]}`.toUpperCase();
  }

  const firstNameInitial = names[0][0];
  const lastNameInitial = names[names.length - 1][0];
  return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
};

// todo
// const getColorClass = (initials: string): string => {
//   const colors = [
//     "bg-red-500",
//     "bg-green-500",
//     "bg-blue-500",
//     "bg-yellow-500",
//     "bg-purple-500",
//     "bg-pink-500",
//     "bg-indigo-500",
//     "bg-gray-500",
//   ];

//   // Simple hash function to get a consistent color for the same initials

// };

export function UserProfile({
  displayName,
  avatarUrl,
  size = "md",
  hideDisplayName = false,
}: {
  displayName: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  hideDisplayName?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          "rounded-full relative overflow-hidden shrink-0 bg-blue-500 flex items-center justify-center text-white font-bold",
          {
            "w-8 h-8": size === "sm",
            "w-10 h-10": size === "md",
            "w-12 h-12": size === "lg",
            "text-sm": size === "sm",
            "text-md": size === "md",
            "text-lg": size === "lg",
          },
        )}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${displayName} avatar`}
            fill
            sizes="50px"
            className="object-cover"
          />
        ) : (
          getInitials(displayName)
        )}
      </div>
      {!hideDisplayName ? (
        <span
          className={clsx("text-md font-medium", {
            "text-sm": size === "sm",
            "text-md": size === "md",
            "text-lg": size === "lg",
          })}
        >
          {displayName}
        </span>
      ) : null}
    </div>
  );
}
