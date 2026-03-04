interface TrustBadgeProps {
  items: string[];
}

export function TrustBadge({ items }: TrustBadgeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-sm text-night-200"
        >
          <svg
            className="h-4 w-4 shrink-0 text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {item}
        </span>
      ))}
    </div>
  );
}
