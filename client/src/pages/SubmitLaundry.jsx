import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";

const SIZES = [
  { value: "small", label: "Small", hint: "1–5 items", icon: "🎒" },
  { value: "medium", label: "Medium", hint: "6–12 items", icon: "🛍️" },
  { value: "large", label: "Large", hint: "13–20 items", icon: "🧳" },
  { value: "extra-large", label: "XL", hint: "20+ items", icon: "📦" },
];

export default function SubmitLaundry() {
  const navigate = useNavigate();
  const toast = useToast();
  const [timings, setTimings] = useState(null);
  const [services, setServices] = useState([]);
  const [description, setDescription] = useState("");
  const [itemEstimate, setItemEstimate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pricing / coupon state
  const [showPricing, setShowPricing] = useState(false);
  const [priceQuote, setPriceQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    api.get("/timings")
      .then((res) => setTimings(res.data))
      .catch(() => {});
    api.get("/services")
      .then((res) => setServices(res.data || []))
      .catch(() => {});
    setLoading(false);
  }, []);

  const calculatePrice = async () => {
    if (!itemEstimate) {
      setError("Pick an approximate size");
      return;
    }
    setError("");
    setLoadingQuote(true);
    try {
      const res = await api.post("/payments/calculate", {
        itemEstimate,
        description,
        couponCode: couponCode || undefined,
      });
      setPriceQuote(res.data);
      setShowPricing(true);
      toast.success("Price calculated");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to calculate price");
    } finally {
      setLoadingQuote(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await api.post("/payments/calculate", {
        itemEstimate,
        description,
        couponCode,
      });
      setPriceQuote(res.data);
      toast.success(`Coupon ${res.data.couponCode} applied — save ₹${res.data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    calculatePrice();
  };

  const handleComplete = async () => {
    if (!priceQuote) return;
    setProcessingPayment(true);
    try {
      // Step 1: Create the batch
      const batchRes = await api.post("/batches", { description, itemEstimate });
      const batch = batchRes.data;

      // Step 2: Process payment
      const paymentRes = await api.post("/payments/process", {
        amount: priceQuote.total,
        breakdown: {
          subtotal: priceQuote.subtotal,
          discount: priceQuote.discount,
          tax: priceQuote.tax,
          total: priceQuote.total,
          couponCode: priceQuote.couponCode || "",
          items: priceQuote.items,
        },
        batchId: batch._id,
        method: "upi",
        couponCode: priceQuote.couponCode || undefined,
      });

      toast.success("Batch submitted & payment processed!");
      navigate(`/track/${batch._id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to complete transaction");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-5">
        <div className="skeleton h-10 w-56" />
        <div className="skeleton h-40" />
        <div className="skeleton h-56" />
      </div>
    );
  }

  if (!timings) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="card p-10 text-center animate-scale-in">
          <p className="text-4xl mb-4">🗓️</p>
          <p className="text-lg font-semibold text-white">No schedule published yet</p>
          <p className="muted text-sm mt-1.5 max-w-sm mx-auto">
            The laundry service for your block hasn't published its drop-off days yet.
            Once they do, this page unlocks and submitting takes under a minute.
          </p>
          <button onClick={() => navigate("/", { replace: true })} className="btn-ghost mt-6">Back to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Submit laundry</h1>
        <p className="muted mt-2">Dropping clothes off? Log it — you'll get a live tracker + ETA.</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-rose-200 border animate-scale-in"
            style={{ background: "rgba(251,113,133,0.08)", borderColor: "rgba(251,113,133,0.25)" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Schedule summary */}
        <div className="card p-5 animate-fade-up" style={{ animationDelay: "0.04s" }}>
          <p className="text-[11px] uppercase tracking-wider text-[#5d6577] font-semibold mb-3">Your block schedule</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              ["Days", timings.laundryDays.join(" ")],
              ["Drop-off", `${timings.dropoffStart}–${timings.dropoffEnd}`],
              ["Pickup", `${timings.pickupStart}–${timings.pickupEnd}`],
              ["ETA", `~${timings.turnaroundDays}d`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-2 py-2.5">
                <p className="text-[10px] text-[#5d6577] uppercase tracking-wider font-semibold">{l}</p>
                <p className="text-xs font-bold text-white mt-1">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="card p-6 space-y-6 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <div>
            <label className="block text-sm font-medium text-[#b9c0d0] mb-2">📝 What are you dropping off?</label>
            <input className="field" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 2 shirts, 3 t-shirts, 1 pair of jeans" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b9c0d0] mb-3">👕 Approximate size</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SIZES.map((s) => {
                const on = itemEstimate === s.value;
                return (
                  <button key={s.value} type="button" onClick={() => setItemEstimate(s.value)}
                    className={`rounded-xl border p-3.5 text-center transition-all cursor-pointer ${
                      on
                        ? "border-transparent text-white shadow-lg shadow-accent-600/30"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                    style={on ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : {}}>
                    <span className="block text-xl mb-1">{s.icon}</span>
                    <span className="block text-sm font-semibold">{s.label}</span>
                    <span className={`block text-[10px] mt-0.5 ${on ? "text-white/70" : "text-[#5d6577]"}`}>{s.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        {showPricing && (
          <div className="card p-6 space-y-5 animate-fade-up" style={{ animationDelay: "0.12s" }}>
            <h2 className="text-lg font-semibold text-white">💰 Price breakdown</h2>

            {priceQuote && (
              <div className="space-y-3">
                {/* Service tier */}
                <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
                  <span className="text-sm text-[#b9c0d0]">Service tier</span>
                  <span className="text-sm font-semibold text-white">{priceQuote.service?.name || "Standard"}</span>
                </div>

                {/* Items */}
                {priceQuote.items && priceQuote.items.length > 0 && (
                  <div>
                    <p className="text-xs text-[#5d6577] mb-2.5">Items</p>
                    <div className="space-y-2">
                      {priceQuote.items.map((it, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-[#b9c0d0] capitalize">{it.type} × {it.count}</span>
                          <span className="text-sm text-white">₹{it.price * it.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-[#8b93a7]">Subtotal</span>
                  <span className="text-sm text-white">₹{priceQuote.subtotal}</span>
                </div>

                {/* Discount */}
                {priceQuote.discount > 0 && (
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-emerald-300">Discount {priceQuote.couponCode && `(code: ${priceQuote.couponCode})`}</span>
                    <span className="text-sm text-emerald-300">-₹{priceQuote.discount}</span>
                  </div>
                )}

                {/* Tax */}
                <div className="flex items-center justify-between py-2.5 border-t border-white/[0.06]">
                  <span className="text-sm text-[#8b93a7]">Tax (5%)</span>
                  <span className="text-sm text-white">₹{priceQuote.tax}</span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-2.5 border-t border-white/[0.12]">
                  <span className="font-bold text-white text-lg">Total</span>
                  <span className="font-bold text-accent-300 text-xl">₹{priceQuote.total}</span>
                </div>
              </div>
            )}

            {/* Coupon input */}
            <div className="pt-3 border-t border-white/[0.06]">
              {priceQuote?.couponCode ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-emerald-400/10 border-emerald-400/25 text-emerald-300 text-xs py-1">
                      ✅ {priceQuote.couponCode} applied
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-rose-300 hover:text-rose-200 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="field text-xs flex-1"
                    placeholder="Have a coupon code?"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="btn-ghost py-2 px-4 text-xs disabled:opacity-50"
                  >
                    {applyingCoupon ? "…" : "Apply"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit / Complete button */}
        {!showPricing ? (
          <button
            type="button"
            onClick={calculatePrice}
            disabled={loadingQuote || !itemEstimate}
            className="btn-primary w-full py-3.5 text-[15px]"
          >
            {loadingQuote ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> Calculating…
              </span>
            ) : "View price & submit"}
          </button>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleComplete}
              disabled={processingPayment || !priceQuote}
              className="btn-primary w-full py-3.5 text-[15px]"
            >
              {processingPayment ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> Finalizing payment…
                </span>
              ) : `Confirm & pay ₹${priceQuote?.total || 0}`}
            </button>
            <button
              type="button"
              onClick={() => { setShowPricing(false); setPriceQuote(null); setCouponCode(""); }}
              className="btn-ghost w-full py-2.5 text-xs"
            >
              ← Back to edit batch
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
