"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

export const armoryEase = [0.22, 1, 0.36, 1] as const;

export const armoryStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

export const armoryFadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: armoryEase },
  },
};

export const armoryScaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: armoryEase },
  },
};

interface ArmoryRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export function ArmoryReveal({
  children,
  delay = 0,
  className,
  ...props
}: ArmoryRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: armoryEase }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ArmorySectionHeadingProps {
  children: ReactNode;
  className?: string;
}

export function ArmorySectionHeading({
  children,
  className = "",
}: ArmorySectionHeadingProps) {
  return (
    <div className={`relative mb-6 text-center ${className}`}>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: armoryEase }}
        className="mx-auto mb-3 h-px w-24 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"
      />
      <motion.h2
        initial={{ opacity: 0, letterSpacing: "0.35em" }}
        whileInView={{ opacity: 1, letterSpacing: "0.2em" }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: armoryEase }}
        className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/90"
      >
        {children}
      </motion.h2>
    </div>
  );
}

/** Glass panel shell used across armory sections */
export function armoryGlassPanelClass(extra = ""): string {
  return [
    "relative overflow-hidden rounded-2xl border border-white/[0.06]",
    "bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-black/80",
    "shadow-[0_8px_32px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)_inset,0_1px_0_rgba(255,255,255,0.06)_inset]",
    "backdrop-blur-xl",
    extra,
  ].join(" ");
}

export function ArmoryShimmerOverlay() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        background:
          "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)",
        backgroundSize: "200% 100%",
      }}
      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    />
  );
}

interface ArmoryPanelHeadingProps {
  children: ReactNode;
  className?: string;
  trailing?: ReactNode;
}

/** Left-aligned panel title with accent bar */
export function ArmoryPanelHeading({
  children,
  className = "",
  trailing,
}: ArmoryPanelHeadingProps) {
  return (
    <div
      className={`relative mb-5 flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: armoryEase }}
          className="h-8 w-1 origin-top rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600/40 shadow-[0_0_14px_rgba(34,211,238,0.45)]"
        />
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: armoryEase }}
          className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-300/90"
        >
          {children}
        </motion.h2>
      </div>
      {trailing}
    </div>
  );
}

interface ArmoryPanelShellProps {
  children: ReactNode;
  className?: string;
}

/** Glass container for armory sub-panels */
export function ArmoryPanelShell({ children, className = "" }: ArmoryPanelShellProps) {
  return (
    <div className={`relative ${armoryGlassPanelClass(`p-5 md:p-6 ${className}`)}`}>
      <ArmoryShimmerOverlay />
      <div className="relative">{children}</div>
    </div>
  );
}

export const armoryCardHover =
  "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]";
