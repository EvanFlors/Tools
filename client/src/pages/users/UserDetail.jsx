import { Link, useRouteLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_BASE } from "../../config/api";
import { showGlobalToast } from "../../components/Toast";

function UserDetailPage() {
    const user = useRouteLoaderData("user-detail");
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    function navigateHandler() {
        navigate("edit");
    }

    async function startDeleteHandling() {
        const proceed = window.confirm("Are you sure you want to delete this admin user? All their data will be soft-deleted.");
        if (!proceed) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`${API_BASE}/admin/users/${userData._id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.status === 422 || response.status === 400) {
                const errorData = await response.json();
                showGlobalToast(errorData.error || "Cannot delete this user.", "error");
                setIsDeleting(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                showGlobalToast(errorData.error || "Failed to delete user.", "error");
                setIsDeleting(false);
                return;
            }

            showGlobalToast("Admin user deleted successfully.", "success");
            navigate("/users", { replace: true });
        } catch (error) {
            console.error("Error deleting user:", error);
            showGlobalToast("Unable to connect to the server. Please try again.", "error");
            setIsDeleting(false);
        }
    }

    if (!user || !user.data) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-4">User Not Found</h1>
                <Link to="/users" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    ← Back to Users
                </Link>
            </div>
        );
    }

    const userData = user.data;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <Link to="../" relative="path" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6 inline-block">
                ← Back to Users
            </Link>

            <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl overflow-hidden">
                <div className="p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-50 text-lg font-medium">
                                {(userData.username || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
                                    {userData.username}
                                </h1>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    {userData.role}
                                </span>
                            </div>
                        </div>
                        <button
                            className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            aria-label="Delete"
                            onClick={startDeleteHandling}
                            disabled={isDeleting}
                        >
                            {isDeleting ? '…' : '✕'}
                        </button>
                    </div>

                    {/* Details */}
                    <div className="bg-neutral-100 border border-neutral-200/60 rounded-lg p-5 mb-6">
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-neutral-400">Username</p>
                                <p className="text-sm font-medium text-neutral-900">{userData.username}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400">Email</p>
                                <p className="text-sm font-medium text-neutral-900">{userData.email || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400">Phone</p>
                                <p className="text-sm font-medium text-neutral-900">{userData.phone || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-neutral-400 mb-6 gap-1">
                        <p>Created: {new Date(userData.createdAt).toLocaleString()}</p>
                        <p>Updated: {new Date(userData.updatedAt).toLocaleString()}</p>
                    </div>

                    <button
                        onClick={navigateHandler}
                        className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm"
                    >
                        Edit admin
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserDetailPage;

export async function UserDetailLoader({ params }) {
    const { userId } = params;
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Response(
            JSON.stringify({ message: 'Could not fetch user details.' }),
            { status: 500 }
        );
    }

    const resData = await response.json();
    return resData;
}
