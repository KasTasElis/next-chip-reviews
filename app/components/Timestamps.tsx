type Props = {
  created_at: string;
  updated_at?: string | null;
};

const FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
};

export function Timestamps({ created_at, updated_at }: Props) {
  return (
    <div className="text-base-content/40 text-xs flex flex-col gap-0.5">
      <p suppressHydrationWarning>
        Created At: {new Date(created_at).toLocaleDateString("en-GB", FORMAT)}
      </p>
      {updated_at && (
        <p suppressHydrationWarning>
          Updated At: {new Date(updated_at).toLocaleDateString("en-GB", FORMAT)}
        </p>
      )}
    </div>
  );
}
