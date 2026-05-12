import { intervalToDuration } from "date-fns";

type Props = {
  created_at: string;
  updated_at?: string | null;
};

const LABELS: Record<string, [string, string]> = {
  years: ["yr", "yrs"],
  months: ["mo", "mos"],
  days: ["day", "days"],
  hours: ["hr", "hrs"],
  minutes: ["min", "mins"],
};

function timeAgo(dateStr: string): string {
  const duration = intervalToDuration({
    start: new Date(dateStr),
    end: new Date(),
  });
  const { years, months, days, hours, minutes } = duration;

  let units: (keyof typeof duration)[];
  if (years) units = ["years", "months"];
  else if (months) units = ["months", "days"];
  else if (days) units = ["days", "hours"];
  else if (hours) units = ["hours", "minutes"];
  else if (minutes) units = ["minutes"];
  else return "just now";

  const parts = units.map((unit) => {
    const val = duration[unit] ?? 0;
    const [singular, plural] = LABELS[unit];
    return `${val} ${val === 1 ? singular : plural}`;
  });

  return `${parts.join(" ")} ago`;
}

export function Timestamps({ created_at, updated_at }: Props) {
  return (
    <div className="text-base-content/40 text-xs flex flex-col gap-0.5">
      <p suppressHydrationWarning>{timeAgo(created_at)}</p>
      {updated_at && <p suppressHydrationWarning>{timeAgo(updated_at)}</p>}
    </div>
  );
}
