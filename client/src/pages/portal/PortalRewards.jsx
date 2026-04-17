import { useLoaderData } from "react-router-dom";
import { useMemo } from "react";
import { API_BASE } from "../../config/api";

function PortalRewardsPage() {
  const data = useLoaderData();

  // Normalización (single source of truth)
  const { coupons, summary } = useMemo(() => {
    const rewards = data?.data || data || {};

    return {
      coupons: rewards.coupons || [],
      summary: {
        totalPaid: rewards.summary?.totalPaid || 0,
        totalCouponsEarned: rewards.summary?.totalCouponsEarned || 0,
        amountUntilNext: rewards.summary?.amountUntilNext ?? null,
        progressPercent: rewards.summary?.progressPercent ?? null,
      },
    };
  }, [data]);

  const formatCurrency = (value) =>
    typeof value === "number" ? `$${value.toFixed(2)}` : "—";

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "—";

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* HEADER */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
          Rewards
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Earn coupons for every $1,000 in payments. Each coupon is worth $50.
        </p>
      </header>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <SummaryCard label="Total Paid" value={formatCurrency(summary.totalPaid)} />

        <SummaryCard
          label="Coupons Earned"
          value={summary.totalCouponsEarned}
        />

        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
          <p className="text-xs font-medium text-neutral-400 mb-1">
            Next Coupon In
          </p>

          <p className="text-2xl font-semibold text-green-600">
            {formatCurrency(summary.amountUntilNext)}
          </p>

          {typeof summary.progressPercent === "number" && (
            <div className="mt-3">
              <div
                className="w-full bg-neutral-200 rounded-full h-1.5"
                aria-label="Progress to next reward"
              >
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(summary.progressPercent, 100)}%`,
                  }}
                />
              </div>

              <p className="text-xs text-neutral-400 mt-1">
                {summary.progressPercent}% progress
              </p>
            </div>
          )}
        </div>
      </div>

      {/* COUPONS */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Your Coupons
        </h2>

        {coupons.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-3">
            {coupons.map((coupon) => (
              <CouponCard key={coupon._id} coupon={coupon} />
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

/* ───── Subcomponents ───── */

function SummaryCard({ label, value }) {
  return (
    <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
      <p className="text-xs font-medium text-neutral-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function CouponCard({ coupon }) {
  const isAvailable = coupon.status === "available";

  return (
    <li
      className={`bg-neutral-50 border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
        isAvailable ? "border-green-200" : "border-neutral-200/80"
      }`}
    >
      {/* LEFT */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-sm font-semibold text-neutral-900">
            {coupon.code}
          </span>

          <StatusBadge status={coupon.status} />
        </div>

        <p className="text-xs text-neutral-400">
          Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col items-start sm:items-end gap-2">
        <p className="text-xl font-semibold text-neutral-900">
          {typeof coupon.value === "number"
            ? `$${coupon.value.toFixed(2)}`
            : coupon.value}
        </p>
      </div>
    </li>
  );
}

function StatusBadge({ status }) {
  const styles = {
    available: "bg-green-100 text-green-700",
    used: "bg-neutral-200 text-neutral-600",
    expired: "bg-red-100 text-red-600",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || "bg-neutral-200 text-neutral-600"
      }`}
    >
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="text-center text-neutral-400 py-16">
      <p>No coupons yet.</p>
      <p className="text-sm mt-1">
        Keep making payments to unlock rewards.
      </p>
    </div>
  );
}

export default PortalRewardsPage;

export async function loader() {
  const [rewardsRes, couponsRes] = await Promise.all([
    fetch(`${API_BASE}/client/rewards`, { credentials: "include" }),
    fetch(`${API_BASE}/client/coupons`, { credentials: "include" }),
  ]);

  const rewards = rewardsRes.ok ? await rewardsRes.json() : {};
  const coupons = couponsRes.ok ? await couponsRes.json() : {};

  return {
    data: {
      summary: rewards.data || {},
      coupons: coupons.data || [],
    },
  };
}
