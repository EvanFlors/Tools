import { useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function PortalRewardsPage() {
  const data = useLoaderData();
  const rewards = data?.data || data || {};
  const coupons = rewards.coupons || [];
  const summary = rewards.summary || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-2">
        Rewards
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        Earn coupons for every $1,000 in payments. Coupons are worth $50 each.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
          <p className="text-xs font-medium text-neutral-400 mb-1">Total Paid</p>
          <p className="text-2xl font-semibold text-neutral-900">
            ${typeof summary.totalPaid === "number" ? summary.totalPaid.toFixed(2) : "0.00"}
          </p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
          <p className="text-xs font-medium text-neutral-400 mb-1">Coupons Earned</p>
          <p className="text-2xl font-semibold text-neutral-900">
            {summary.totalCouponsEarned || 0}
          </p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
          <p className="text-xs font-medium text-neutral-400 mb-1">Next Coupon In</p>
          <p className="text-2xl font-semibold text-green-600">
            ${typeof summary.amountUntilNext === "number" ? summary.amountUntilNext.toFixed(2) : "—"}
          </p>
          {typeof summary.progressPercent === "number" && (
            <div className="mt-2">
              <div className="w-full bg-neutral-200 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${summary.progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">{summary.progressPercent}% progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Coupons list */}
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Your Coupons</h2>
      {coupons.length === 0 ? (
        <div className="text-center text-neutral-400 py-16">
          <p>No coupons yet. Keep making payments to earn rewards!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className={`bg-neutral-50 border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                coupon.status === "available"
                  ? "border-green-200"
                  : "border-neutral-200/80"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-semibold text-neutral-900">
                    {coupon.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      coupon.status === "available"
                        ? "bg-green-100 text-green-700"
                        : coupon.status === "used"
                        ? "bg-neutral-200 text-neutral-600"
                        : "bg-brand-100 text-brand-700"
                    }`}
                  >
                    {coupon.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-xl font-semibold text-neutral-900">
                ${typeof coupon.value === "number" ? coupon.value.toFixed(2) : coupon.value}
              </p>
            </div>
          ))}
        </div>
      )}
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
