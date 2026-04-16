import { useState, useRef, useEffect } from "react";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import { API_BASE } from "../config/api";

const inputClass =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 bg-neutral-50";

function ProfilePage() {
  const formRef = useRef();

  const profile = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const [username, setUsername] = useState(profile.username || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handle = (setter) => (e) => setter(e.target.value);

  // Reset password fields after successful update
  useEffect(() => {
    if (actionData?.status === "success") {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [actionData]);

  const hasProfileChanges =
    username !== (profile.username || "") ||
    phone !== (profile.phone || "") ||
    newPassword.length > 0;

  async function handleDelete() {
    setDeleteError(null);
    if (!deletePassword) { setDeleteError("Please enter your password to confirm."); return; }
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/profile`, {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) { setDeleteError(data.error || "Failed to delete account."); setDeleting(false); return; }
      navigate("/login", { replace: true });
    } catch {
      setDeleteError("An error occurred. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-8">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 sm:p-6 mb-5">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-50 text-lg font-medium">
            {(profile.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{profile.username}</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-200 text-neutral-600">
              {profile.role}
            </span>
          </div>
        </div>
        <div className="text-sm text-neutral-500 space-y-1">
          <p>Phone: {profile.phone || "Not set"}</p>
          <p>Member since: {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 sm:p-6 mb-5">
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Edit Profile</h2>

        {actionData?.message && !actionData.errors && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">✓ {actionData.message}</div>
        )}
        {actionData?.error && (
          <div className="mb-4 p-3 bg-brand-50 border border-brand-100 text-brand-600 rounded-lg text-sm">{actionData.error}</div>
        )}
        {actionData?.errors && (
          <ul className="mb-4 p-3 bg-brand-50 border border-brand-100 text-brand-600 rounded-lg text-sm">
            {Object.entries(actionData.errors).map(([field, msg]) => <li key={field}>• {msg}</li>)}
          </ul>
        )}

        <Form ref={formRef} method="put" className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1.5">Username</label>
            <input type="text" id="username" name="username" value={username} onChange={handle(setUsername)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">Phone</label>
            <input type="text" id="phone" name="phone" value={phone} onChange={handle(setPhone)} className={inputClass} />
          </div>

          <hr className="border-neutral-200 my-2" />
          <p className="text-xs text-neutral-400">Leave password fields empty to keep your current password.</p>

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">Current Password</label>
            <input type="password" id="currentPassword" name="currentPassword" value={currentPassword} onChange={handle(setCurrentPassword)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">New Password</label>
            <input type="password" id="newPassword" name="newPassword" value={newPassword} onChange={handle(setNewPassword)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm New Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={handle(setConfirmPassword)} className={inputClass} />
          </div>

          <button type="submit" disabled={isSubmitting || !hasProfileChanges}
            className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </Form>
      </div>

      {/* Danger Zone */}
      <div className="bg-neutral-50 border border-brand-200 rounded-xl p-5 sm:p-6">
        <h2 className="text-base font-semibold text-brand-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Deleting your account will permanently remove all your data. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition text-sm font-medium">
            Delete my account
          </button>
        ) : (
          <div className="space-y-3 bg-brand-50 border border-brand-100 p-4 rounded-lg">
            <p className="text-brand-700 font-medium text-sm">Enter your password to confirm:</p>
            {deleteError && <div className="p-2 bg-brand-100 text-brand-700 rounded text-xs">{deleteError}</div>}
            <input type="password" placeholder="Your password" value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <div className="flex flex-wrap gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition text-sm font-medium disabled:opacity-50">
                {deleting ? "Deleting..." : "Confirm delete"}
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(null); }}
                className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition text-sm font-medium">
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

  return { status: "success", message: "Profile updated successfully!" };
}
