import { Form, useNavigation, useActionData, redirect } from "react-router-dom";
import { API_BASE } from "../config/api";

const inputClass =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 bg-neutral-50";

function UserForm({ user }) {
    const data = useActionData();
    const navigation = useNavigation();
    const method = user ? "put" : "post";

    return (
        <Form method={method} className="bg-neutral-50 border border-neutral-200/80 p-5 sm:p-6 rounded-xl max-w-2xl mx-auto">
            {data && data.error && (
                <div className="mb-4 text-sm text-brand-600 bg-brand-50 border border-brand-100 p-3 rounded-lg">
                    • {data.error}
                </div>
            )}
            {data && data.errors && (
                <ul className="mb-4 text-sm text-brand-600 bg-brand-50 border border-brand-100 p-3 rounded-lg">
                    {Object.entries(data.errors).map(([field, message]) => (
                        <li key={field}>• {message}</li>
                    ))}
                </ul>
            )}

            <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Username
                </label>
                <input type="text" id="username" name="username"
                    defaultValue={user ? user.username : ''} required className={inputClass} />
            </div>

            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Email <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input type="email" id="email" name="email"
                    defaultValue={user ? user.email : ''} className={inputClass} />
            </div>

            <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Phone <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input type="text" id="phone" name="phone"
                    defaultValue={user ? user.phone : ''} className={inputClass} />
            </div>

            <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {user ? "New Password" : "Password"}
                    {user && <span className="text-neutral-400 font-normal"> (leave blank to keep current)</span>}
                </label>
                <input type="password" id="password" name="password"
                    required={!user} minLength={6} className={inputClass}
                    placeholder={user ? "••••••••" : ""} />
            </div>

            <button type="submit" disabled={navigation.state === "submitting"}
                className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50 mt-2">
                {navigation.state === "submitting"
                    ? "Submitting..."
                    : user ? 'Update admin' : 'Create admin'}
            </button>
        </Form>
    );
}

export default UserForm;

export async function action({ request, params }) {
    const method = request.method.toUpperCase();
    const formData = await request.formData();

    const userData = {
        username: formData.get("username"),
        email: formData.get("email") || undefined,
        phone: formData.get("phone") || undefined,
    };

    const password = formData.get("password");
    if (password) {
        userData.password = password;
    }

    let url;
    let userId;

    if (method === "POST") {
        url = `${API_BASE}/admin/users`;
    } else if (method === "PUT") {
        userId = params.userId;
        url = `${API_BASE}/admin/users/${userId}`;
    } else if (method === "DELETE") {
        userId = params.userId;
        url = `${API_BASE}/admin/users/${userId}`;
    }

    const response = await fetch(url, {
        method: method,
        credentials: "include",
        headers: method !== "DELETE" ? {
            "Content-Type": "application/json",
        } : undefined,
        body: method !== "DELETE" ? JSON.stringify(userData) : undefined,
    });

    if (response.status === 422 || response.status === 400) {
        const resData = await response.json();
        return resData;
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Response(
            JSON.stringify({ message: errorData.error || 'Could not process request.' }),
            { status: response.status }
        );
    }

    if (method === "DELETE") {
        return redirect("/users");
    }

    const resData = await response.json();

    if (method === "PUT") {
        return redirect(`/users/${userId}`);
    } else {
        return redirect(`/users/${resData.data._id}`);
    }
}
