import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight mb-2">
        Herramientas
      </h1>
      <p className="text-sm sm:text-base text-neutral-500 max-w-md mb-10">
        Manage products, customers, sales and payments — all in one place.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full">
        {[
          { to: "/products", label: "Products", icon: "🔧" },
          { to: "/customers", label: "Customers", icon: "👥" },
          { to: "/sales", label: "Sales", icon: "📋" },
          { to: "/payments", label: "Payments", icon: "💰" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 flex flex-col items-center gap-2.5 hover:border-neutral-300 hover:bg-neutral-50 transition-all active:scale-[0.98]"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
