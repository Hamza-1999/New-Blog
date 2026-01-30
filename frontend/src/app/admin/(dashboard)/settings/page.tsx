"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { authApi, settingsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { AdSlotManager } from "@/components/admin/ad-slot-manager";
import {
  User,
  Lock,
  MonitorPlay,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  Shield,
  LayoutGrid,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [adsenseId, setAdsenseId] = useState("");
  const [adsenseLoading, setAdsenseLoading] = useState(true);
  const [savingAdsense, setSavingAdsense] = useState(false);

  useEffect(() => {
    settingsApi
      .get("adsense_client_id")
      .then((res) => {
        setAdsenseId(res.data.setting?.value || "");
      })
      .catch(() => {})
      .finally(() => setAdsenseLoading(false));
  }, []);

  const isAdsenseConfigured = adsenseId && adsenseId !== "ca-pub-XXXXXXXXXX";

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ name, bio });
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...userData, name, bio }));
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success("Password changed!");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("Failed to change password. Check your current password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAdsenseSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdsense(true);
    try {
      await settingsApi.update("adsense_client_id", adsenseId.trim());
      toast.success("AdSense Publisher ID saved!");
    } catch {
      toast.error("Failed to save AdSense settings");
    } finally {
      setSavingAdsense(false);
    }
  };

  return (
    <div className="animate-fade-up">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {user?.name?.charAt(0) || "A"}
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Settings
          </h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Manage your profile, security, and monetization
          </p>
        </div>
      </div>

      {/* Two-column layout: Left = Profile & Security, Right = AdSense */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile Section */}
          <section className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up stagger-1">
            <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-secondary/30">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <User size={13} className="text-primary" />
              </div>
              <h2 className="text-[13px] font-semibold tracking-wide uppercase" style={{ letterSpacing: "0.06em" }}>
                Profile
              </h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Email</label>
                <Input value={user?.email || ""} disabled className="h-9 text-[13px] bg-secondary/50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="A short description that appears on your blog posts"
                  className="text-[13px] resize-none"
                />
              </div>
              <div className="flex justify-end pt-1">
                <Button type="submit" disabled={saving} size="sm" className="text-[12px] h-8 px-4">
                  {saving ? "Saving..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </section>

          {/* Password Section */}
          <section className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up stagger-2">
            <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-secondary/30">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Lock size={13} className="text-primary" />
              </div>
              <h2 className="text-[13px] font-semibold tracking-wide uppercase" style={{ letterSpacing: "0.06em" }}>
                Security
              </h2>
            </div>
            <form onSubmit={handlePasswordChange} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="h-9 text-[13px] pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-9 text-[13px] pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button type="submit" disabled={changingPassword} size="sm" className="text-[12px] h-8 px-4">
                  {changingPassword ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </form>
          </section>
        </div>

        {/* Right column — AdSense */}
        <div className="lg:col-span-3">
          <section className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up stagger-2">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <MonitorPlay size={13} className="text-primary" />
                </div>
                <h2 className="text-[13px] font-semibold tracking-wide uppercase" style={{ letterSpacing: "0.06em" }}>
                  Google AdSense
                </h2>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                  isAdsenseConfigured
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAdsenseConfigured ? "bg-emerald-500" : "bg-amber-500"}`} />
                {isAdsenseConfigured ? "Connected" : "Not configured"}
              </span>
            </div>

            <div className="p-5">
              {/* Publisher ID form */}
              <form onSubmit={handleAdsenseSave} className="mb-5">
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Publisher ID</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-mono select-none">
                      ca-pub-
                    </span>
                    <Input
                      value={adsenseLoading ? "Loading..." : adsenseId.replace("ca-pub-", "")}
                      onChange={(e) => {
                        const val = e.target.value.replace("ca-pub-", "");
                        setAdsenseId(val ? `ca-pub-${val}` : "");
                      }}
                      placeholder="XXXXXXXXXXXXXXXX"
                      disabled={adsenseLoading}
                      className="h-9 text-[13px] font-mono pl-[58px]"
                    />
                  </div>
                  <Button type="submit" disabled={savingAdsense || adsenseLoading} size="sm" className="text-[12px] h-9 px-4 gap-1.5">
                    <Save size={12} />
                    {savingAdsense ? "Saving..." : "Save"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Ads will automatically appear across all designated slots once saved. No restart needed.
                </p>
              </form>

              {/* Setup steps */}
              <div className="border border-border rounded-lg overflow-hidden mb-4">
                <div className="px-4 py-2.5 bg-secondary/30 border-b border-border">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Setup Guide</h3>
                </div>
                <div className="divide-y divide-border">
                  {[
                    {
                      step: "1",
                      title: "Create an AdSense account",
                      desc: (
                        <>
                          Sign up at{" "}
                          <a
                            href="https://www.google.com/adsense"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-0.5"
                          >
                            google.com/adsense <ExternalLink size={9} />
                          </a>
                        </>
                      ),
                    },
                    {
                      step: "2",
                      title: "Submit your site for review",
                      desc: "Add your site URL in the AdSense dashboard. Google reviews for compliance.",
                    },
                    {
                      step: "3",
                      title: "Copy your Publisher ID",
                      desc: (
                        <>
                          Find it in AdSense &gt; Account &gt; Account info. Starts with{" "}
                          <code className="bg-secondary px-1 py-0.5 rounded text-[10px] font-mono">ca-pub-</code>
                        </>
                      ),
                    },
                    {
                      step: "4",
                      title: "Paste it above and save",
                      desc: "Ads appear instantly across all ad slots. No code changes or restart required.",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 px-4 py-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {item.step}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium leading-tight">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ad placements & checklist in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-border rounded-lg p-3.5">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <LayoutGrid size={12} className="text-primary" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ad Placements</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {[
                      "Home - After Featured Post",
                      "Home - Below Blog Grid",
                      "Home - Sidebar",
                      "Blog Post - Above Content",
                      "Blog Post - Below Content",
                      "Blog Post - Sidebar",
                    ].map((loc) => (
                      <li key={loc} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                        {loc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-3.5">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Shield size={12} className="text-primary" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Approval Checklist</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {[
                      { label: "Privacy Policy", done: true },
                      { label: "Terms of Service", done: true },
                      { label: "About page", done: true },
                      { label: "Contact page", done: true },
                      { label: "ads.txt file", done: true },
                      { label: "Clean layout", done: true },
                      { label: "15-20 articles (300+ words)", done: false },
                      { label: "Custom domain with SSL", done: false },
                    ].map((item) => (
                      <li key={item.label} className="flex items-center gap-2 text-[11px]">
                        {item.done ? (
                          <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle size={11} className="text-amber-500 flex-shrink-0" />
                        )}
                        <span className={item.done ? "text-muted-foreground" : "text-foreground font-medium"}>
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Ad Slots Manager — full width */}
      <div className="mt-4">
        <AdSlotManager />
      </div>
    </div>
  );
}
