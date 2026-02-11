import React from "react";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: string;
  className?: string;
}

const getTierStyles = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'high':
    case 'positive':
    case 'yes':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'medium':
    case 'neutral':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'low':
    case 'negative':
    case 'no':
    case 'absent':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20';
  }
};

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-semibold",
        "px-2 py-0.5 text-[10px] uppercase tracking-wider",
        getTierStyles(tier),
        className
      )}
    >
      {tier}
    </span>
  );
};
