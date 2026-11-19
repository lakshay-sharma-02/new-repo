/**
 * Consistent page heading used across the app: optional icon + eyebrow,
 * title, supporting copy, and a right-aligned action cluster.
 */
export default function PageHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  actions,
  align = "left",
  className = "",
}) {
  const centered = align === "center";

  return (
    <div
      className={`${
        centered
          ? "text-center"
          : "flex flex-col sm:flex-row sm:items-end sm:justify-between"
      } gap-4 mb-8 animate-fade-up ${className}`}
    >
      <div className={centered ? "mx-auto max-w-2xl" : "min-w-0"}>
        {(icon || eyebrow) && (
          <div className={`flex items-center gap-3 mb-3 ${centered ? "justify-center" : ""}`}>
            {icon && (
              <span className="inline-flex w-11 h-11 rounded-2xl bg-slate-900/[0.04] border border-slate-900/10 items-center justify-center text-xl shrink-0">
                {icon}
              </span>
            )}
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600">
                {eyebrow}
              </p>
            )}
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className={`muted mt-2 ${centered ? "mx-auto" : "max-w-2xl"}`}>{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className={`flex flex-wrap items-center gap-3 ${centered ? "justify-center" : "sm:justify-end"}`}>
          {actions}
        </div>
      )}
    </div>
  );
}
