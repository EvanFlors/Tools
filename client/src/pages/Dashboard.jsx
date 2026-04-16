import { useLoaderData, Link } from "react-router-dom";
import { API_BASE } from "../config/api";
import { fetchWithAuth } from "../utils/auth";

function DashboardPage() {
  const { data: metrics } = useLoaderData();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Overview of your business</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="Active Sales" value={metrics.sales.active} accent="text-green-600" />
        <KPICard label="Completed" value={metrics.sales.completed} accent="text-neutral-600" />
        <KPICard label="Cancelled" value={metrics.sales.cancelled} accent="text-brand-600" />
        <KPICard label="Customers" value={metrics.customerCount} accent="text-blue-600" />
      </div>

      {/* Revenue Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
          <p className="text-xs font-medium text-neutral-400 mb-1">Revenue This Month</p>
          <p className="text-2xl font-semibold text-neutral-900">
            ${metrics.payments.thisMonth.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-neutral-400 mt-1">{metrics.payments.thisMonth.count} payments</p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
          <p className="text-xs font-medium text-neutral-400 mb-1">Pending Balance</p>
          <p className="text-2xl font-semibold text-brand-600">
            ${metrics.pendingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-neutral-400 mt-1">across {metrics.sales.active} active sales</p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
          <p className="text-xs font-medium text-neutral-400 mb-1">Total Payments</p>
          <p className="text-2xl font-semibold text-neutral-900">{metrics.payments.total}</p>
          <p className="text-xs text-neutral-400 mt-1">all time</p>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-700">Recent Sales</h2>
            <Link to="/sales" className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
              View all →
            </Link>
          </div>
          {metrics.recentSales.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {metrics.recentSales.map((sale) => (
                <Link
                  key={sale._id}
                  to={`/sales/${sale._id}`}
                  className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg hover:bg-neutral-150 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {sale.productId?.name || "Product"}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {sale.customerId?.nameEncrypted ? "Customer" : "—"} · {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900">${sale.totalAmount?.toFixed(2)}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      sale.status === "active" ? "bg-green-100 text-green-700" :
                      sale.status === "completed" ? "bg-neutral-200 text-neutral-600" :
                      "bg-brand-50 text-brand-600"
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-700">Top Products</h2>
            <Link to="/products" className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
              View all →
            </Link>
          </div>
          {metrics.topProducts.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">No products yet</p>
          ) : (
            <div className="space-y-3">
              {metrics.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center text-xs font-medium text-neutral-600">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-neutral-900">{p.productName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900">${p.totalRevenue?.toFixed(2)}</p>
                    <p className="text-xs text-neutral-400">{p.salesCount} sales</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        {[
          { to: "/products", label: "Products", icon: "🔧" },
          { to: "/customers", label: "Customers", icon: "👥" },
          { to: "/sales", label: "Sales", icon: "📋" },
          { to: "/payments", label: "Payments", icon: "💰" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group bg-neutral-50 border border-neutral-200/80 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-neutral-300 transition-all active:scale-[0.98]"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function KPICard({ label, value, accent = "text-neutral-900" }) {
  return (
    <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
      <p className="text-xs font-medium text-neutral-400 mb-1">{label}</p>
      <p className={`text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default DashboardPage;

export async function dashboardLoader() {
  const response = await fetchWithAuth(`${API_BASE}/admin/dashboard`);

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ message: "Could not load dashboard." }),
      { status: 500 }
    );
  }

  return response.json();
}
