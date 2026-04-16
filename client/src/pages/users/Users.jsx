import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function UsersPage() {
    const data = useLoaderData();
    const users = data.data || data;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Admin Users</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        {users && users.length > 0
                            ? `${users.length} admin${users.length !== 1 ? "s" : ""}`
                            : "No admin users yet"}
                    </p>
                </div>
                <Link
                    to="/users/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition text-sm font-medium"
                >
                    <span className="text-base leading-none">+</span>
                    New admin
                </Link>
            </div>

            {!users || users.length === 0 ? (
                <div className="text-center text-neutral-400 py-20">
                    <p>No admin users yet. Create one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {users.map((user) => (
                        <Link
                            key={user._id}
                            to={`/users/${user._id}`}
                            className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 hover:border-neutral-300 transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-50 text-sm font-medium">
                                    {(user.username || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                                        {user.username}
                                    </h2>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1 text-sm">
                                {user.email && <p className="text-neutral-500">{user.email}</p>}
                                {user.phone && <p className="text-neutral-400">{user.phone}</p>}
                                <p className="text-neutral-300 text-xs">
                                    Created {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UsersPage;

export async function loader() {
    const response = await fetch(`${API_BASE}/admin/users`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Response(
            JSON.stringify({ message: "Failed to fetch users" }),
            { status: 500 }
        );
    }

    const resData = await response.json();
    return resData;
}
