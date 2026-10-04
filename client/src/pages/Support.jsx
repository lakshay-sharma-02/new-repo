import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const FAQS = [
  {
    q: "How do I submit a laundry batch?",
    a: "Drop your clothes off at your block's designated collection point during the scheduled window, then log in and submit a batch on the app. You'll get an instant confirmation and live tracker.",
  },
  {
    q: "When will my laundry be ready?",
    a: "Each hostel block has its own turnaround time (usually 2-3 days). You can see the exact ETA on your batch tracker once you submit.",
  },
  {
    q: "How do I apply a coupon?",
    a: "On the Submit page, enter your coupon code in the 'Have a coupon?' field before confirming your batch. The discount will apply to your total.",
  },
  {
    q: "What if my clothes are damaged or missing?",
    a: "Report the issue directly from your batch tracker. We link every batch to a digital record — no more memory-vs-memory disputes.",
  },
  {
    q: "How do I track my batch?",
    a: "Your dashboard shows all active batches with live status. You'll also get a notification the moment your batch moves to each stage.",
  },
  {
    q: "Can I cancel or reschedule a pickup?",
    a: "Once a batch is in progress (washing/drying), you can't cancel it — but you can report an issue. For future batches, just submit at a more convenient time.",
  },
];

export default function Support() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message || form.message.trim().length < 10) {
      toast.error("Please fill in all fields with a meaningful message");
      return;
    }
    setSubmitting(true);
    try {
      // Simulate API call — in production this would hit /api/support
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Message sent — we'll get back to you soon!");
      setForm({ name: user?.name || "", email: user?.email || "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send — try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-up">
        <span className="text-4xl mb-4 block">💬</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Support center</h1>
        <p className="muted mt-3 max-w-xl mx-auto">
          Got a question? Need help with a batch? We're here to help — whether it's about tracking, pricing, or a service issue.
        </p>
      </div>

      {/* FAQ section */}
      <div className="mb-12 animate-fade-up" style={{ animationDelay: "0.06s" }}>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
          <span>❓</span> Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="card p-5 open:bg-white/[0.04] transition-all animate-fade-up"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <summary className="cursor-pointer list-none flex items-center gap-2.5">
                <span className="text-accent-300">{i + 1}</span>
                <span className="font-semibold text-white flex-1">{faq.q}</span>
                <span className="text-[#5d6577] transition-transform text-sm">▸</span>
              </summary>
              <p className="text-sm text-[#b9c0d0] mt-3 leading-relaxed ml-6">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="card p-8 animate-fade-up" style={{ animationDelay: "0.12s" }}>
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2.5">
          <span>📧</span> Contact us
        </h2>
        <p className="text-sm text-[#8b93a7] mb-6">
          Fill out the form below and we'll respond within 24 hours. Or email <span className="text-accent-300">support@hostel.edu</span> directly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Name</label>
              <input
                className="field"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Email</label>
              <input
                type="email"
                className="field"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@hostel.edu"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Subject</label>
            <input
              className="field"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="What's this about?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Message</label>
            <textarea
              rows={5}
              className="field resize-none leading-relaxed"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Describe your issue or question..."
              required
              minLength={10}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-[15px]">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> Sending…
              </span>
            ) : "Send message →"}
          </button>
        </form>
      </div>

      {/* Knowledge base links */}
      <div className="mt-12 animate-fade-up" style={{ animationDelay: "0.18s" }}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
          <span>📚</span> Knowledge base
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "How to book laundry", href: "#", desc: "Step-by-step guide to submitting your first batch" },
            { title: "Understanding the tracker", href: "#", desc: "What each status stage means" },
            { title: "Coupon & discount guide", href: "#", desc: "How to use promo codes" },
            { title: "Reporting issues", href: "#", desc: "What to do when something goes wrong" },
            { title: "Payment & invoices", href: "#", desc: "How payments work and how to get receipts" },
            { title: "Account settings", href: "/profile", desc: "Manage your profile and preferences" },
          ].map((kb) => (
            <Link
              key={kb.title}
              to={kb.href === "#" ? "#" : kb.href}
              onClick={(e) => { kb.href === "#" && e.preventDefault(); }}
              className="card card-hover p-5 block transition-all"
            >
              <h3 className="text-sm font-semibold text-white mb-1.5">{kb.title}</h3>
              <p className="text-xs text-[#8b93a7] leading-relaxed">{kb.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
