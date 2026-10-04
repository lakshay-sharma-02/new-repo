const STAGES = [
  { key: "submitted", label: "Submitted", icon: "📋" },
  { key: "received", label: "Received", icon: "✅" },
  { key: "washing", label: "Washing", icon: "🫧" },
  { key: "drying", label: "Drying", icon: "☀️" },
  { key: "folding", label: "Folding", icon: "👕" },
  { key: "ready", label: "Ready!", icon: "🎉" },
  { key: "picked_up", label: "Picked up", icon: "🏠" },
];

export default function StatusTracker({ currentStatus, compact = false }) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const progress = currentIndex >= 0 ? (currentIndex / (STAGES.length - 1)) * 100 : 0;

  /* ---- Compact segmented bar ---- */
  if (compact) {
    return (
      <div>
        <div className="flex items-center gap-1">
          {STAGES.map((stage, index) => {
            const done = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div key={stage.key} className="flex-1 h-1.5 rounded-full overflow-hidden relative"
                style={{ background: done ? "linear-gradient(90deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.08)" }}>
                {isCurrent && done && <div className="absolute inset-0 bg-white/25 animate-glow" />}
              </div>
            );
          })}
        </div>
        {currentIndex >= 0 && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs font-semibold text-accent-300">
              {STAGES[currentIndex].icon} {STAGES[currentIndex].label}
            </span>
            <span className="text-[10px] text-[#5d6577] font-mono">
              {currentIndex + 1}/{STAGES.length}
            </span>
          </div>
        )}
      </div>
    );
  }

  /* ---- Full stage circles ---- */
  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* track */}
        <div className="absolute top-[22px] left-[calc(100%/14)] right-[calc(100%/14)] h-[3px] rounded-full bg-white/[0.07]" />
        <div
          className="absolute top-[22px] left-[calc(100%/14)] h-[3px] rounded-full transition-all duration-700"
          style={{
            width: currentIndex > 0 ? `calc(${progress}% - ${100 / 14}%)` : "0px",
            background: "linear-gradient(90deg,#6366f1,#a855f7,#22d3ee)",
            boxShadow: "0 0 12px rgba(129,140,248,0.6)",
          }}
        />

        {STAGES.map((stage, index) => {
          const done = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10" style={{ width: `${100 / 7}%` }}>
              {/* node */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-500 ${
                  done ? "" : "bg-white/[0.04] border border-white/10 opacity-60"
                }`}
                style={
                  done
                    ? {
                        background: isCurrent
                          ? "linear-gradient(135deg,#6366f1,#a855f7)"
                          : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                        boxShadow: isCurrent
                          ? "0 0 0 4px rgba(99,102,241,0.2), 0 8px 24px -6px rgba(139,92,246,0.6)"
                          : "0 4px 14px -6px rgba(99,102,241,0.5)",
                        transform: isCurrent ? "scale(1.12)" : "scale(1)",
                      }
                    : {}
                }
              >
                {done && <span className={isCurrent ? "animate-glow" : ""}>{stage.icon}</span>}
              </div>

              <span
                className={`text-[10px] font-semibold mt-2 text-center leading-tight transition-colors ${
                  isCurrent ? "text-accent-300" : done ? "text-white/80" : "text-[#4a5060]"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
