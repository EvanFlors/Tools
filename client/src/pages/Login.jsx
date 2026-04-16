import { useState, useEffect } from "react";
import { Form, Link, useNavigation, useActionData, useLoaderData, redirect } from "react-router-dom";
import { getAuthUser } from "../utils/auth";
import { API_BASE } from "../config/api";
import { useToast, ToastMessage } from "../components/Toast";
import ProductsGrid from "../components/ProductsGrid";

function LoginPage() {
  const data = useActionData();
  const loaderData = useLoaderData();
  const navigation = useNavigation();
  const [mode, setMode] = useState("admin");
  const [showCatalog, setShowCatalog] = useState(true);
  const { toast, showToast, dismissToast } = useToast();

  const products = loaderData?.products || [];

  useEffect(() => {
    if (data?.error) {
      showToast(data.error, "error");
    }
  }, [data, showToast]);

  /* ───── Catalog View ───── */
  if (showCatalog) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <ToastMessage toast={toast} onDismiss={dismissToast} />

        {/* Nav */}
        <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-50 border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
            <span className="text-neutral-900 font-semibold text-base tracking-tight">
              Herramientas
            </span>
            <button
              onClick={() => setShowCatalog(false)}
              className="px-3.5 py-1.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition text-sm font-medium"
            >
              Login
            </button>
          </div>
        </nav>

        {/* Product grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pt-22">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Product Catalog</h2>
            <p className="text-sm text-neutral-500 mt-1">
              {products.length > 0 ? `${products.length} item${products.length !== 1 ? "s" : ""} available` : "Browse our collection"}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center text-neutral-400 py-20">
              <p>No products available at the moment.</p>
            </div>
          ) : (
            <ProductsGrid products={products} />
          )}
        </div>
      </div>
    );
  }

  /* ───── Login View ───── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <ToastMessage toast={toast} onDismiss={dismissToast} />

      <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl w-full max-w-md overflow-hidden">
        {/* Tab toggle */}
        <div className="flex border-b border-neutral-200">
          <button
            type="button"
            onClick={() => setMode("admin")}
            className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
              mode === "admin"
                ? "text-neutral-900 border-b-2 border-neutral-900"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setMode("customer")}
            className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
              mode === "customer"
                ? "text-neutral-900 border-b-2 border-neutral-900"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Customer
          </button>
        </div>

        <div className="p-7">
          <h1 className="text-xl font-semibold text-neutral-900 mb-6 text-center tracking-tight">
            Herramientas
          </h1>

          <Form method="post">
            <input type="hidden" name="mode" value={mode} />

            {mode === "admin" ? (
              <>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 bg-neutral-50"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 bg-neutral-50"
                  />
                </div>
              </>
            ) : (
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="Enter your phone number"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 bg-neutral-50"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={navigation.state === "submitting"}
              className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50"
            >
              {navigation.state === "submitting"
                ? "Logging in..."
                : mode === "admin"
                ? "Login as Admin"
                : "Login as Customer"}
            </button>
          </Form>

          {mode === "admin" && (
            <div className="mt-3 text-center">
              <Link to="/password-reset" className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                Forgot password?
              </Link>
            </div>
          )}

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setShowCatalog(true)}
              className="text-neutral-500 hover:text-neutral-800 font-medium text-sm transition-colors"
            >
              Browse product catalog →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

export async function loginAction({ request }) {
  const formData = await request.formData();
  const mode = formData.get("mode");

  let url;
  let body;

  if (mode === "customer") {
    url = `${API_BASE}/client/auth/login`;
    body = { phone: formData.get("phone") };
  } else {
    url = `${API_BASE}/auth/login`;
    body = {
      username: formData.get("username"),
      password: formData.get("password"),
    };
  }

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      error:
        "Unable to connect to the server. Please make sure the backend is running and try again.",
    };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { error: errorData.message || "Invalid credentials" };
  }

  // Admin → "/" , Customer → "/portal"
  return redirect(mode === "customer" ? "/portal" : "/");
}

export async function loginLoader() {
  const user = await getAuthUser();
  if (user) {
    return redirect(user.role === "customer" ? "/portal" : "/");
  }

  // Fetch public product catalog
  let products = [];
  try {
    const res = await fetch(`${API_BASE}/catalog/products`);
    if (res.ok) {
      const data = await res.json();
      products = data.data || [];
    }
  } catch {
    // Server unreachable — show empty catalog
  }

  return { products };
}
