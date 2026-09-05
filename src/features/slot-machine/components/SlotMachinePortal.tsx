"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";

type SlotMachinePortalProps = {
  children: ReactNode;
};

export function SlotMachinePortal({ children }: SlotMachinePortalProps) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
