"use client";

import PurchaseDetailModal from "@/features/purchases/components/PurchaseDetailModal";
import { Transaction } from "@/model/model";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/** @deprecated Prefer `PurchaseDetailModal` desde `@/features/purchases`. */
export default function TransactionDetailModal({
  error = null,
  onRetry = () => {},
  ...props
}: TransactionDetailModalProps) {
  return (
    <PurchaseDetailModal error={error} onRetry={onRetry} {...props} />
  );
}
