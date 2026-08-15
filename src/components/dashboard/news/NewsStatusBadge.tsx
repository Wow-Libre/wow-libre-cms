"use client";

import { NewsStatus } from "@/model/News";
import { NEWS_STATUS_HELP, NEWS_STATUS_LABELS, NEWS_STATUS_TONE } from "./newsHelpers";

const SIZE = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function NewsStatusBadge({
  status,
  size = "md",
  withDot = true,
  className = "",
}: {
  status: NewsStatus;
  size?: keyof typeof SIZE;
  withDot?: boolean;
  className?: string;
}) {
  const tone = NEWS_STATUS_TONE[status];
  return (
    <span
      title={NEWS_STATUS_HELP[status]}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider",
        tone.bg,
        tone.text,
        tone.border,
        SIZE[size],
        className,
      ].join(" ")}
    >
      {withDot && (
        <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden />
      )}
      {NEWS_STATUS_LABELS[status]}
    </span>
  );
}

export default NewsStatusBadge;
