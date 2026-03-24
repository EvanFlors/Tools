import { useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import { API_BASE } from "../config/api";

function ProfilePage() {
  const profile = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  // Controlled inputs to track changes
  const [username, setUsername] = useState(profile.username || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  function handleInputChange(setter) {
    return (e) => {
      setter(e.target.value);
    };
  }

  const hasProfileChanges =
    username !== (profile.username || "") ||
    phone !== (profile.phone || "") ||
    newPassword.length > 0;

  async function handleDelete() {
    setDeleteError(null);

    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm.");
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch(`${API_BASE}/admin/profile`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete account.");
        setDeleting(false);
        return;
      }

      // Account deleted — redirect to login
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      setDeleteError("An error occurred. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        to="/"
        className="text-brand-600 hover:underline mb-6 inline-block"
      >
        ← Back to Home
      </Link>

      <h1 className="text-4xl font-bold text-gray-800 mb-8">My Profile</h1>

      {/* Profile Info Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {(profile.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {profile.username}
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 uppercase">
              {profile.role}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Phone: {profile.phone || "Not set"}</p>
          <p>Member since: {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Update Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Edit Profile
        </h2>

        {(actionData?.message && !actionData.errors) && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
            ✓ {actionData.message}
          </div>
        )}

        {actionData?.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
            ⚠️ {actionData.error}
          </div>
        )}

        {actionData?.errors && (
          <ul className="mb-4 p-3 bg-red-50 text-red-600 rounded">
            {Object.entries(actionData.errors).map(([field, msg]) => (
              <li key={field}>• {msg}</li>
            ))}
          </ul>
        )}

        <Form method="put" className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-gray-700 font-semibold mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleInputChange(setUsername)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-gray-700 font-semibold mb-1"
            >
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={phone}
              onChange={handleInputChange(setPhone)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <hr className="my-4" />
          <p className="text-sm text-gray-500">
            Leave password fields empty to keep your current password.
          </p>

          <div>
            <label
              htmlFor="currentPassword"
              className="block text-gray-700 font-semibold mb-1"
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={handleInputChange(setCurrentPassword)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-gray-700 font-semibold mb-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={handleInputChange(setNewPassword)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-semibold mb-1"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !hasProfileChanges}
            className="w-full px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold disabled:bg-brand-300"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </Form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-red-200">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Danger Zone
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Deleting your account will permanently remove all your data including
          products, customers, sales, and payments. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Delete My Account
          </button>
        ) : (
          <div className="space-y-4 bg-red-50 p-4 rounded-lg">
            <p className="text-red-700 font-semibold">
              Enter your password to confirm account deletion:
            </p>

            {deleteError && (
              <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                ⚠️ {deleteError}
              </div>
            )}

            <input
              type="password"
              placeholder="Your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="border border-red-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-red-300"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setDeleteError(null);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;

export async function profileLoader() {
  const response = await fetch(`${API_BASE}/admin/profile`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ message: "Could not load profile." }),
      { status: 500 }
    );
  }

  const resData = await response.json();
  return resData.data;
}

export async function profileAction({ request }) {
  const formData = await request.formData();

  const profileData = {
    username: formData.get("username"),
    phone: formData.get("phone"),
  };

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (newPassword && newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  if (newPassword) {
    profileData.currentPassword = currentPassword;
    profileData.newPassword = newPassword;
  }

  const response = await fetch(`${API_BASE}/admin/profile`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });

  const resData = await response.json();

  if (response.status === 422 || response.status === 400) {
    return resData;
  }

  if (!response.ok) {
    return { error: resData.error || "Failed to update profile." };
  }

  return { message: "Profile updated successfully!" };
}
