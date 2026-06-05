"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface BouncyFeatureItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface BouncyCardsFeaturesProps {
  items: BouncyFeatureItem[];
}

const cardLayouts = [
  "md:col-span-3 md:min-h-[300px] bg-brand text-brand-foreground",
  "md:col-span-3 md:min-h-[300px] bg-card text-card-foreground",
  "md:col-span-2 md:min-h-[260px] bg-surface-alt text-foreground",
  "md:col-span-2 md:min-h-[260px] bg-card text-card-foreground",
  "md:col-span-2 md:min-h-[260px] bg-brand-soft text-foreground",
  "md:col-span-6 md:min-h-[220px] bg-foreground text-background",
];

export function BouncyCardsFeatures({ items }: BouncyCardsFeaturesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-6">
      {items.map((item, index) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          whileHover={{ y: -10, rotate: index % 2 === 0 ? -1.4 : 1.4 }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: index * 0.04 }}
          className={cn(
            "group relative overflow-hidden rounded-3xl border border-border/60 p-6 shadow-sm sm:p-8",
            cardLayouts[index % cardLayouts.length],
          )}
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-current opacity-[0.06]" />
          <div className="flex h-full min-h-[180px] flex-col justify-between gap-8">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] opacity-65">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.icon ? (
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-current/20 bg-current/10">
                  {item.icon}
                </span>
              ) : null}
            </div>

            <div>
              <h3 className="font-display text-2xl font-medium tracking-tight sm:text-3xl" style={{ lineHeight: "1.08" }}>
                {item.title}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed opacity-78 sm:text-base">
                {item.description}
              </p>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}