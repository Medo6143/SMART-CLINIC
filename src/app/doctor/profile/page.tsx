"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import {
  getAuth,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
} from "firebase/auth";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "@/lib/firebase/config";

const db = getFirestore(app);

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const auth = getAuth(app);
      const firebaseUser = auth.currentUser;
      if (firebaseUser && name !== user.displayName) {
        await updateProfile(firebaseUser, { displayName: name });
      }
      await updateDoc(doc(db, "users", user.uid), {
        displayName: name,
        phone: phone,
        updatedAt: new Date(),
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    setIsChangingPassword(true);
    try {
      const auth = getAuth(app);
      const firebaseUser = auth.currentUser;
      if (!firebaseUser?.email) return;
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch {
      setPasswordError("Current password is incorrect. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          Doctor <span className="text-primary">Profile</span>
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Manage your professional information and security settings.
        </p>
      </div>

      {saveSuccess && (
        <div className="mb-8 bg-green-50 border border-green-200 text-green-700 p-5 rounded-2xl font-bold flex items-center gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined">check_circle</span>
          Profile updated successfully!
        </div>
      )}
      {passwordSuccess && (
        <div className="mb-8 bg-green-50 border border-green-200 text-green-700 p-5 rounded-2xl font-bold flex items-center gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined">lock</span>
          Password changed successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up animate-delay-100">
        {/* Avatar Card */}
        <div className="lg:col-span-1">
          <div className="card p-10 bg-white border-gray-100 flex flex-col items-center text-center rounded-[3rem] shadow-xl relative overflow-hidden group">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-black text-white shadow-2xl mb-6 group-hover:scale-105 transition-transform">
              {(name || user?.displayName || "D")[0].toUpperCase()}
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1 uppercase">
              Dr. {name || user?.displayName || "Doctor"}
            </h2>
            <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6">
              Verified Specialist
            </p>
            <div className="w-full pt-6 border-t border-gray-50 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Account ID</span>
                <span className="text-gray-900 tabular-nums font-mono">
                  #{user?.uid.slice(0, 6)}...
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Role</span>
                <span className="text-gray-900 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Clinic</span>
                <span className="text-gray-900 font-mono text-[10px]">
                  {user?.clinicId ? `#${user.clinicId.slice(0, 6)}` : "Unassigned"}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Clinical Bio */}
          <div className="card p-10 bg-white border-gray-100 rounded-[3rem] shadow-xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                Clinical Bio
              </h3>
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={isSaving}
                className={`text-[10px] font-black uppercase tracking-widest transition-all px-5 py-2.5 rounded-xl ${
                  isEditing
                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    : "text-primary hover:underline"
                } disabled:opacity-50`}
              >
                {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Details"}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 outline-none transition-all font-bold"
                  />
                ) : (
                  <p className="text-lg font-bold text-gray-900">{name || user?.displayName || "N/A"}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                  Email Address
                </label>
                <p className="text-lg font-bold text-gray-900 truncate">{user?.email}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 1xx xxx xxxx"
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 outline-none transition-all font-bold"
                  />
                ) : (
                  <p className="text-lg font-bold text-gray-900">{phone || user?.phone || "Not set"}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 font-black uppercase text-xs tracking-widest hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Security Hub */}
          <div className="card p-10 bg-gray-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Security Hub</h3>
                  <p className="text-gray-400 text-sm font-medium">
                    Protect your medical credentials and system access.
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shrink-0"
                >
                  {showPasswordForm ? "Cancel" : "Change Password"}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-4 mt-6 pt-6 border-t border-white/10">
                  {passwordError && (
                    <p className="text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded-xl">
                      ⚠️ {passwordError}
                    </p>
                  )}
                  {[
                    { label: "Current Password", value: currentPassword, setter: setCurrentPassword },
                    { label: "New Password", value: newPassword, setter: setNewPassword },
                    { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                        {field.label}
                      </label>
                      <input
                        type="password"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        required
                        className="w-full p-4 bg-white/10 border border-white/10 rounded-xl text-white focus:bg-white/20 outline-none transition-all font-bold"
                        placeholder="••••••••"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              )}
            </div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
