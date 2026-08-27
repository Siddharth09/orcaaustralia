"use client";

import { useActionState } from "react";
import { approveRefund, denyRefund } from "@/app/admin/(dashboard)/refunds/actions";

export function RefundRequestActions({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveRefund.bind(null, id),
    null
  );
  const [denyState, denyAction, denyPending] = useActionState(
    denyRefund.bind(null, id),
    null
  );

  const error = approveState?.error || denyState?.error;

  if (compact) {
    return (
      <div className="mt-2">
        {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <form action={approveAction}>
            <button
              type="submit"
              disabled={approvePending || denyPending}
              className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              {approvePending ? "Processing..." : "Approve & Refund"}
            </button>
          </form>
          <form action={denyAction}>
            <button
              type="submit"
              disabled={approvePending || denyPending}
              className="rounded-full border border-black/20 px-3 py-1 text-xs font-semibold text-navy disabled:opacity-50"
            >
              {denyPending ? "Saving..." : "Deny"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-black/10 pt-4">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex flex-wrap items-end gap-3">
        <form action={approveAction}>
          <button
            type="submit"
            disabled={approvePending || denyPending}
            className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-50"
          >
            {approvePending ? "Processing..." : "Approve & Refund"}
          </button>
        </form>
        <form action={denyAction} className="flex flex-wrap items-end gap-2">
          <input
            name="adminNote"
            placeholder="Optional note to customer"
            className="rounded border border-black/20 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={approvePending || denyPending}
            className="rounded-full border border-black/20 px-5 py-2 text-sm font-semibold text-navy hover:bg-sand disabled:opacity-50"
          >
            {denyPending ? "Saving..." : "Deny"}
          </button>
        </form>
      </div>
    </div>
  );
}
