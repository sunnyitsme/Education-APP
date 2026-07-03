"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "parent">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, full_name: fullName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push(`/${role}/dashboard`);
      router.refresh();
      return;
    }

    // Email confirmation is enabled in the Supabase project.
    setNotice("Account created. Please check your email to confirm, then sign in.");
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-indigo-600 p-3">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Students get a parent link code automatically. Admin accounts are created by promotion
            (see README).
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="mb-1.5 block text-sm font-medium text-slate-700">I am a</p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "student", label: "Student", icon: BookOpen },
                    { value: "parent", label: "Parent", icon: Users },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition",
                      role === r.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <r.icon className="h-4 w-4" /> {r.label}
                  </button>
                ))}
              </div>
            </div>

            <FormInput
              label="Full name"
              name="full_name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={role === "student" ? "Student's name" : "Parent's name"}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <FormInput
              label="Password"
              name="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />

            {error && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            )}
            {notice && (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : `Create ${role} account`}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
