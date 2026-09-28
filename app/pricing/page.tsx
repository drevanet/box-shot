"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

const benefits = [
  "Unlimited 3D box previews",
  "PNG artwork uploads",
  "Adjustable box dimensions",
  "Custom box and background colors",
  "High-quality PNG export",
  "Polar customer portal",
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  function subscribe() {
    setLoading(true);

    // Normal browser navigation.
    // Do NOT use fetch() because the API redirects to Polar.
    window.location.assign("/api/polar/checkout?plan=pro");
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
          <Sparkles className="h-4 w-4" />
          Simple recurring billing
        </div>

        <h1 className="text-4xl font-black sm:text-5xl">
          BoxShot Pro
        </h1>

        <p className="mt-4 text-white/55">
          Subscribe through Polar and unlock the full mockup workflow.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-md rounded-3xl border border-violet-400/30 bg-white/[0.04] p-8 shadow-2xl shadow-violet-950/30">
        <p className="text-sm font-semibold text-violet-200">
          {process.env.NEXT_PUBLIC_PLAN_NAME || "BoxShot Pro"}
        </p>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-5xl font-black">
            {process.env.NEXT_PUBLIC_PLAN_PRICE_LABEL || "$12/month"}
          </span>
        </div>

        <div className="my-8 space-y-4">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex gap-3 text-sm text-white/75"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              {benefit}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={subscribe}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {loading
            ? "Opening Polar..."
            : "Continue to Polar checkout"}
        </button>
      </div>
    </main>
  );
}