"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/admin");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.04]" />
      <div className="w-full max-w-sm relative animate-fade-up">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Flavor<span className="text-primary">Journal</span>
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">Sign in to your dashboard</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@blog.com"
                required
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-9 text-[13px]"
              />
            </div>
            <Button type="submit" className="w-full h-9 gap-2 text-[13px]" disabled={loading}>
              <LogIn size={14} />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          Default: admin@blog.com / admin123
        </p>
      </div>
    </div>
  );
}
