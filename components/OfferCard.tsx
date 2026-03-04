"use client";

interface OfferCardProps {
  want: string;
  offer: string;
  userEmail?: string;
  createdAt: string;
}

function formatDate(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return createdAt;
  }
}

export function OfferCard({ want, offer, userEmail, createdAt }: OfferCardProps) {
  return (
    <article className="glass overflow-hidden transition-shadow hover:spark-glow">
      <div className="border-b border-white/10 p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-night-400">
          I Want
        </p>
        <p className="font-body text-night-100">{want}</p>
      </div>
      <div className="p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-night-400">
          I Offer
        </p>
        <p className="font-body text-night-100">{offer}</p>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
        <span className="font-body text-xs text-night-400">
          {formatDate(createdAt)}
        </span>
        {userEmail && (
          <span className="truncate font-body text-xs text-night-500">
            {userEmail}
          </span>
        )}
      </div>
    </article>
  );
}
