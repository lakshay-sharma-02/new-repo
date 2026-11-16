/** The single source of truth for the laundry lifecycle. */

export const STAGES = [
  "submitted",
  "received",
  "washing",
  "drying",
  "folding",
  "ready",
  "picked_up",
];

export const LABELS = {
  submitted: "Submitted",
  received: "Received by staff",
  washing: "Washing",
  drying: "Drying",
  folding: "Folding",
  ready: "Ready for pickup",
  picked_up: "Picked up",
};

/** Forward-only pipeline. Corrections require a warden override + reason. */
export const ALLOWED_NEXT = {
  submitted: ["received"],
  received: ["washing"],
  washing: ["drying"],
  drying: ["folding"],
  folding: ["ready"],
  ready: ["picked_up"],
  picked_up: [],
};

export function isStage(value) {
  return STAGES.includes(value);
}

export function canTransition(from, to) {
  return (ALLOWED_NEXT[from] || []).includes(to);
}

export function nextStage(from) {
  return (ALLOWED_NEXT[from] || [])[0] || null;
}

/** One entry shape for the audit trail, used by every transition. */
export function historyEntry({ status, by, byName, reason }) {
  return {
    status,
    by: by || null,
    byName: byName || "",
    reason: reason || "",
    updatedAt: new Date(),
  };
}
