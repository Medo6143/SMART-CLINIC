"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/lib/i18n/useTranslation";
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
import {
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoLockClosedOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";

const db = getFirestore(app);

export default function PatientProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change state
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
      setPasswordError(t("profile.passwordsNotMatch"));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t("profile.passwordTooShort"));
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
      setPasswordError(t("profile.currentPasswordIncorrect"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <IoPersonOutline className="text-xl text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("profile.title")}</h1>
          <p className="text-sm text-gray-500">{t("profile.subtitle")}</p>
        </div>
      </div>

      {/* Toasts */}
      {saveSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <IoCheckmarkCircleOutline className="text-lg" />
          {t("profile.profileUpdated")}
        </div>
      )}
      {passwordSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <IoLockClosedOutline className="text-lg" />
          {t("profile.passwordChanged")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 border border-gray-100 rounded-xl flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white mb-4">
              {(name || user?.displayName || "P")[0].toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">
              {name || user?.displayName || "Patient"}
            </h2>
            <p className="text-xs font-semibold text-primary mb-5">{t("profile.registeredPatient")}</p>
            <div className="w-full pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{t("profile.accountId")}</span>
                <span className="text-gray-900 font-medium font-mono text-[11px]">
                  #{user?.uid.slice(0, 6)}...
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{t("profile.role")}</span>
                <span className="text-gray-900 font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{t("profile.language")}</span>
                <span className="text-gray-900 font-medium uppercase">{user?.languagePrefs || "EN"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Identity Details */}
          <div className="bg-white p-6 border border-gray-100 rounded-xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-50">
              <h3 className="text-base font-bold text-gray-900">{t("profile.identityDetails")}</h3>
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={isSaving}
                className={`text-xs font-semibold transition-all px-4 py-2 rounded-lg ${
                  isEditing
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-primary hover:bg-primary/5"
                } disabled:opacity-50`}
              >
                {isSaving ? t("profile.saving") : isEditing ? t("profile.saveChanges") : t("profile.editProfile")}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">{t("profile.fullName")}</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-medium text-gray-900"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{name || user?.displayName || "N/A"}</p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">{t("profile.emailAddress")}</label>
                <p className="font-medium text-gray-900 truncate">{user?.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">{t("profile.phoneNumber")}</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 1xx xxx xxxx"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-medium text-gray-900"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{phone || user?.phone || t("profile.notSet")}</p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">{t("profile.memberSince")}</label>
                <p className="font-medium text-gray-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                    : "2024"}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 text-xs font-semibold hover:text-gray-900 transition-colors"
                >
                  {t("common.cancel")}
                </button>
              </div>
            )}
          </div>

          {/* Security Card */}
          <div className="bg-gray-900 text-white p-6 rounded-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold mb-1">{t("profile.securityAccess")}</h3>
                  <p className="text-gray-400 text-sm">{t("profile.securityDesc")}</p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="px-5 py-2.5 bg-white text-gray-900 rounded-lg font-semibold text-xs hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                >
                  {showPasswordForm ? t("common.cancel") : t("profile.changePassword")}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-3 mt-4 pt-4 border-t border-white/10">
                  {passwordError && (
                    <p className="text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-lg flex items-center gap-2">
                      <IoAlertCircleOutline className="text-base shrink-0" />
                      {passwordError}
                    </p>
                  )}
                  {[
                    { label: t("profile.currentPassword"), value: currentPassword, setter: setCurrentPassword },
                    { label: t("profile.newPassword"), value: newPassword, setter: setNewPassword },
                    { label: t("profile.confirmNewPassword"), value: confirmPassword, setter: setConfirmPassword },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">
                        {field.label}
                      </label>
                      <input
                        type="password"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:bg-white/15 outline-none transition-all text-sm font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 mt-1"
                  >
                    {isChangingPassword ? t("profile.updating") : t("profile.updatePassword")}
                  </button>
                </form>
              )}
            </div>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
