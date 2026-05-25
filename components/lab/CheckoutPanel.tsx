"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check, CreditCard, Coins } from "lucide-react";
import { addBonus } from "@/lib/bonus";
import type { DatasetCard } from "@/lib/types";

export function CheckoutPanel({
  dataset,
  factoryShareUsd,
}: {
  dataset: DatasetCard;
  factoryShareUsd: number;
}) {
  const [state, setState] = useState<"idle" | "cart" | "purchased">("idle");

  const totalPrice = dataset.pricePerHour * dataset.hours;

  const purchase = () => {
    addBonus(factoryShareUsd, dataset.id);
    setState("purchased");
  };

  return (
    <div className="card p-5 sticky top-20">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
        License this dataset
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tabular-nums">
          ${dataset.pricePerHour}
        </span>
        <span className="text-sm text-[color:var(--color-text-muted)]">/hr</span>
      </div>
      <div className="mt-2 text-xs text-[color:var(--color-text-muted)]">
        {dataset.hours.toFixed(2)}h × ${dataset.pricePerHour}/hr ={" "}
        <span className="text-[color:var(--color-text)] mono">
          ${totalPrice.toFixed(2)}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <Row label="format" value={dataset.format} />
        <Row label="episodes" value={String(dataset.episodes)} />
        <Row label="scene" value={dataset.sceneCategory} />
        <Row label="quality" value={`${dataset.qualityScore.toFixed(1)} / 5`} />
        <Row label="sensors" value={`${dataset.sensors.length} streams`} />
      </div>

      <div className="mt-5">
        {state === "idle" && (
          <button
            onClick={() => setState("cart")}
            className="btn btn-primary w-full justify-center"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to cart
          </button>
        )}
        {state === "cart" && (
          <motion.button
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={purchase}
            className="btn btn-primary w-full justify-center"
          >
            <CreditCard className="h-4 w-4" />
            Confirm · ${totalPrice.toFixed(2)}
          </motion.button>
        )}
        <AnimatePresence>
          {state === "purchased" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs"
            >
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <Check className="h-3.5 w-3.5" />
                Licensed · streaming endpoint provisioned
              </div>
              <div className="mt-1 text-emerald-200/80">
                You will receive (video, trajectory, instruction) triplets via S3 + signed-URL feed within 5 minutes.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {state === "purchased" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-3 rounded-md border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)] p-3 text-xs"
          >
            <div className="flex items-center gap-2 text-[color:var(--color-accent)] font-medium">
              <Coins className="h-3.5 w-3.5" />
              ${factoryShareUsd.toFixed(2)} paid to factory_024
            </div>
            <div className="mt-1 text-[color:var(--color-text-muted)]">
              Annotation bonus flows to the originating factory's earnings. Switch to the Factory tab to see it land.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-xs">
      <span className="text-[color:var(--color-text-dim)]">{label}</span>
      <span className="mono text-[color:var(--color-text)] uppercase">
        {value}
      </span>
    </div>
  );
}
