import { useState } from "react";
import { Form, useNavigation, useActionData, redirect } from "react-router-dom";
import { getAuthUser } from "../utils/auth";
import { API_BASE } from "../config/api";

function LoginPage() {
  const data = useActionData();
  const navigation = useNavigation();
  const [mode, setMode] = useState("admin"); // "admin" | "customer"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        {/* Tab toggle */}
        <div className="flex">
          <button
            type="button"
            onClick={() => setMode("admin")}
            className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${
              mode === "admin"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setMode("customer")}
            className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${
              mode === "customer"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Customer
          </button>
        </div>

        <div className="p-8">
          {data && data.error && (
            <div className="mb-4 text-red-600 bg-red-50 p-4 rounded text-center">
              <p>⚠️ {data.error}</p>
            </div>
          )}

          <Form method="post">
            {/* Hidden field so the action knows which mode */}
            <input type="hidden" name="mode" value={mode} />

            {mode === "admin" ? (
              <>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </>
            ) : (
              <div className="mb-6">
                <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="Enter your phone number"
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={navigation.state === "submitting"}
              className={"px-6 py-3 text-white rounded-lg transition-colors w-full font-semibold disabled:opacity-50 bg-gray-800 hover:bg-black"}
            >
              {navigation.state === "submitting"
                ? "Logging in..."
                : mode === "admin"
                ? "Login as Admin"
                : "Login as Customer"}
            </button>
          </Form>
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

  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

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
  return null;
}
