"use client";

import React, { useId } from "react";
import { RouletteWheelProps } from "../types";

const CX = 250;
const CY = 250;
const LAMPS = 24;

const TONE_FILL: Record<string, string> = {
  red: "#9b1b2e",
  black: "#121216",
  green: "#0f6b3e",
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
}

function slicePath(
  startDeg: number,
  endDeg: number,
  inner: number,
  outer: number,
) {
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const p1 = polar(CX, CY, outer, startDeg);
  const p2 = polar(CX, CY, outer, endDeg);
  const p3 = polar(CX, CY, inner, endDeg);
  const p4 = polar(CX, CY, inner, startDeg);
  return `M ${p1.x} ${p1.y} A ${outer} ${outer} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${inner} ${inner} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  rotation,
  spinning,
  segments,
  className,
}) => {
  const uid = useId().replace(/:/g, "");
  const n = segments.length;
  const slice = 360 / n;

  return (
    <div
      className={`relative mx-auto w-full ${className ?? "max-w-[440px]"}`}
    >
      <div className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18),transparent_62%)]" />

      <svg
        viewBox="0 0 500 500"
        className="relative z-10 h-auto w-full drop-shadow-[0_24px_40px_rgba(0,0,0,0.65)]"
        role="img"
        aria-label="Ruleta"
      >
        <defs>
          <radialGradient id={`${uid}-wood`} cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor="#5c3a22" />
            <stop offset="55%" stopColor="#3a2416" />
            <stop offset="100%" stopColor="#1a100b" />
          </radialGradient>
          <linearGradient id={`${uid}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8e7a0" />
            <stop offset="38%" stopColor="#d4af37" />
            <stop offset="70%" stopColor="#8a6a1a" />
            <stop offset="100%" stopColor="#f1d478" />
          </linearGradient>
          <radialGradient id={`${uid}-hub`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f4e2a2" />
            <stop offset="45%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#5c4310" />
          </radialGradient>
          <filter id={`${uid}-inset`} x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="0" dy="2" />
            <feGaussianBlur stdDeviation="3" result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0"
            />
          </filter>
        </defs>

        <circle cx={CX} cy={CY} r="246" fill={`url(#${uid}-wood)`} />
        <circle
          cx={CX}
          cy={CY}
          r="238"
          fill="none"
          stroke={`url(#${uid}-gold)`}
          strokeWidth="10"
        />

        {Array.from({ length: LAMPS }).map((_, i) => {
          const a = (i / LAMPS) * 360;
          const p = polar(CX, CY, 238, a);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4.2"
              className={`roulette-lamp ${spinning ? "is-chasing" : ""}`}
              style={{ animationDelay: spinning ? `${(i / LAMPS) * 0.55}s` : undefined }}
              fill={spinning ? "#ffe08a" : "#c9a227"}
            />
          );
        })}

        <circle cx={CX} cy={CY} r="226" fill="#0b0b0d" />

        <g
          className="roulette-rotor"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {segments.map((segment, i) => {
            const start = i * slice;
            const end = (i + 1) * slice;
            const mid = start + slice / 2;
            const labelPos = polar(CX, CY, 168, mid);
            const isPrize = segment.kind === "win";
            const arcStart = polar(CX, CY, 176, start + 2.2);
            const arcEnd = polar(CX, CY, 176, end - 2.2);
            const arcId = `${uid}-prize-${i}`;
            return (
              <g key={`${segment.label}-${i}`}>
                <path
                  d={slicePath(start, end, 78, 222)}
                  fill={TONE_FILL[segment.tone]}
                  stroke={isPrize ? "#f4e2a2" : "#d4af37"}
                  strokeWidth={isPrize ? 1.4 : 0.7}
                  opacity="0.96"
                />
                {isPrize ? (
                  <>
                    <path
                      id={arcId}
                      d={`M ${arcStart.x} ${arcStart.y} A 176 176 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
                      fill="none"
                    />
                    <text
                      fill="#ecfccb"
                      fontSize="13"
                      fontWeight="800"
                      letterSpacing="0.08em"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      <textPath
                        href={`#${arcId}`}
                        startOffset="50%"
                        textAnchor="middle"
                      >
                        PREMIO
                      </textPath>
                    </text>
                    <text
                      x={polar(CX, CY, 138, mid).x}
                      y={polar(CX, CY, 138, mid).y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fde68a"
                      fontSize="14"
                      transform={`rotate(${mid} ${polar(CX, CY, 138, mid).x} ${polar(CX, CY, 138, mid).y})`}
                    >
                      ★
                    </text>
                  </>
                ) : (
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#f8f5ea"
                    fontSize={22}
                    fontWeight="700"
                    letterSpacing="0.04em"
                    transform={`rotate(${mid} ${labelPos.x} ${labelPos.y})`}
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {segment.label}
                  </text>
                )}
              </g>
            );
          })}

          <circle
            cx={CX}
            cy={CY}
            r="78"
            fill="#1a120c"
            stroke={`url(#${uid}-gold)`}
            strokeWidth="6"
          />
          <circle cx={CX} cy={CY} r="52" fill={`url(#${uid}-hub)`} />
          <circle
            cx={CX}
            cy={CY}
            r="18"
            fill="#1a120c"
            stroke="#f8e7a0"
            strokeWidth="2"
          />
        </g>

        <polygon
          className="roulette-pointer"
          points="250,18 268,62 250,52 232,62"
          fill="#f4e2a2"
          stroke="#8a6a1a"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};
