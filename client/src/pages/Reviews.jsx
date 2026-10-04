import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const STARS = [5, 4, 3, 2, 1];

function StarRow({ rating, setRating, interactive = true }) {
  return (
    <div className="flex items-center gap-1">
      {STARS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={interactive ? () => setRating(s) : undefined}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform`}
          style={{ transform: rating >= s ? "scale(1.15)" : "scale(1)" }}
        >
          <span className="text-xl" style={{ color: rating >= s ? "#fbbf24" : "#4a5060" }}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({ average: 0, total: 0, breakdown: {}, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [usableBatches, setUsableBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get("/api/reviews");
      setData(res.data || { average: 0, total: 0, breakdown: {}, reviews: [] });
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchUsableBatches = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/api/reviews/usable-batches");
      setUsableBatches(res.data || []);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    fetchReviews();
    fetchUsableBatches();
  }, [fetchReviews, fetchUsableBatches]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Pick a star rating");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Tell us a bit more (min 10 characters)");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/reviews", {
        rating,
        comment: comment.trim(),
        batch: selectedBatch || undefined,
      });
      toast.success("Review submitted — thank you!");
      setRating(0);
      setComment("");
      setSelectedBatch("");
      setShowForm(false);
      fetchReviews();
      fetchUsableBatches();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const canReview = user && user.role === "student" && usableBatches.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 animate-fade-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Student reviews</h1>
          <p className="muted mt-2">What fellow hostellers are saying about the laundry service.</p>
        </div>
        {canReview && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary py-2.5 px-5 text-[13px]"
          >
            {showForm ? "✕ Cancel" : "✏️ Write a review"}
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="card p-6 mb-10 animate-fade-up" style={{ animationDelay: "0.04s" }}>
          <h2 className="text-lg font-semibold text-white mb-4">Write a review</h2>

          <form onSubmit={handleSubmitReview} className="space-y-5">
            {/* Batch link */}
            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Link to a completed batch (optional)</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="field"
              >
                <option value="">Leave unlinked</option>
                {usableBatches.map((b) => (
                  <option key={b._id} value={b._id} className="bg-[#0b0d15]">
                    #{String(b._id).slice(-5).toUpperCase()} — {b.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Your rating</label>
              <StarRow rating={rating} setRating={setRating} />
              <p className="text-[11px] text-[#5d6577] mt-1.5">{rating} of 5 stars</p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Comment</label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="field resize-none leading-relaxed"
                placeholder="What went well? What could be better?"
              />
              <p className="text-[11px] text-[#5d6577] mt-2">
                Posts anonymously — your name shows as a shortened version.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !rating}
              className="btn-primary w-full py-3.5 text-[15px]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> Posting…
                </span>
              ) : "Submit review"}
            </button>
          </form>
        </div>
      )}

      {!canReview && !showForm && (
        <div className="card p-6 mb-10 text-center animate-fade-up" style={{ animationDelay: "0.04s" }}>
          <p className="text-2xl mb-3">💬</p>
          <p className="text-sm text-[#8b93a7] font-medium">
            {user ? "Only students with completed batches can write reviews." : "Log in to write a review."}
          </p>
        </div>
      )}

      {/* Stats */}
      {data.total > 0 && (
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {/* Average rating */}
          <div className="card p-7 text-center animate-fade-up" style={{ animationDelay: "0.08s" }}>
            <div className="text-5xl font-bold text-white mb-2">{data.average.toFixed(1)}</div>
            <StarRow rating={Math.round(data.average)} setRating={() => {}} interactive={false} />
            <p className="text-xs text-[#5d6577] mt-3">{data.total} review{data.total !== 1 ? "s" : ""}</p>
          </div>

          {/* Star breakdown */}
          <div className="card p-7 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-sm font-semibold text-white mb-4">Rating breakdown</h3>
            {STARS.map((star) => {
              const count = (data.breakdown || {})[star] || 0;
              const pct = data.total > 0 ? (count / data.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 mb-2.5">
                  <span className="text-xs font-medium text-[#b9c0d0] w-8">{star}★</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: star >= 4 ? "linear-gradient(90deg,#fbbf24,#f59e0b)" : "rgba(129,140,248,0.5)",
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#5d6577] w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {data.reviews.length === 0 ? (
          <div className="card p-14 text-center animate-scale-in">
            <p className="text-5xl mb-4 opacity-80">📭</p>
            <p className="text-lg font-semibold text-white">No reviews yet</p>
            <p className="muted text-sm mt-1.5">Be the first to share your experience!</p>
          </div>
        ) : (
          data.reviews.map((r, i) => (
            <div
              key={r._id || i}
              className="card p-5 animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 6) * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-fuchsia-500 flex items-center justify-center text-base shrink-0">
                  {(r.anonymousName || "G").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <span className="font-semibold text-white text-sm">{r.anonymousName || "Anonymous"}</span>
                    <StarRow rating={r.rating} setRating={() => {}} interactive={false} />
                    <span className="text-[10px] text-[#5d6577] font-mono">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-[#b9c0d0] leading-relaxed">{r.comment}</p>
                  )}
                  {!r.comment && <p className="text-xs text-[#5d6577]">No written feedback</p>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
