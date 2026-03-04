"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OfferCard } from "@/components/OfferCard";

type Offer = {
  id: string;
  want: string;
  offer: string;
  user?: { email?: string };
  createdAt: string;
  preferredDurationMinutes?: number;
};

const TEMPLATES = [
  {
    want: "GTM feedback",
    offer: "Coffee chat",
  },
  {
    want: "Code review",
    offer: "Lunch together",
  },
  {
    want: "Meditation break",
    offer: "Design critique",
  },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [want, setWant] = useState("");
  const [offer, setOffer] = useState("");
  const [duration, setDuration] = useState("");
  const [userId, setUserId] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/offers/create");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setOffers(Array.isArray(data) ? data : data.offers ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const applyTemplate = (t: { want: string; offer: string }) => {
    setWant(t.want);
    setOffer(t.offer);
  };

  const handleSubmit = async () => {
    if (!userId || !want || !offer) {
      setSubmitError("User ID, Want, and Offer are required");
      return;
    }
    setSubmitLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/offers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          want,
          offer,
          preferredDurationMinutes: duration
            ? parseInt(duration, 10)
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create offer");
      setWant("");
      setOffer("");
      setDuration("");
      await fetchOffers();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to create offer");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 font-display text-3xl font-bold text-night-100 md:text-4xl">
        Offers
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading && (
            <p className="font-body text-night-400">Loading offers…</p>
          )}
          {error && (
            <div className="glass p-4">
              <p className="font-body text-red-400">{error}</p>
            </div>
          )}
          {!loading && !error && offers.length === 0 && (
            <p className="font-body text-night-400">No offers yet.</p>
          )}
          {!loading && !error && offers.length > 0 && (
            <motion.div
              className="grid gap-6 sm:grid-cols-2"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {offers.map((o) => (
                <motion.div
                  key={o.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <OfferCard
                    want={o.want}
                    offer={o.offer}
                    userEmail={o.user?.email}
                    createdAt={o.createdAt}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="glass p-6 sticky top-24">
            <h2 className="mb-4 font-display text-xl font-semibold text-night-100">
              Post an Offer
            </h2>

            <div className="mb-3 flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.want}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-body text-xs text-night-300 transition-colors hover:border-spark-500/50 hover:text-spark-400"
                >
                  {t.want} for {t.offer}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  Your userId
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="userId"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  I Want
                </label>
                <textarea
                  value={want}
                  onChange={(e) => setWant(e.target.value)}
                  placeholder="What are you looking for?"
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  I Offer
                </label>
                <textarea
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="What can you offer?"
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  Duration (min, optional)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 30"
                  min={15}
                  max={180}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                />
              </div>
              {submitError && (
                <p className="font-body text-sm text-red-400">{submitError}</p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitLoading || !userId || !want || !offer}
                className="w-full rounded-xl bg-spark-500 py-3 font-body font-semibold text-night-950 hover:bg-spark-400 disabled:opacity-50"
              >
                {submitLoading ? "Posting…" : "Post Offer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
