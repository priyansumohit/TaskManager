"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";
import Spinner from "@/components/Spinner";
import { validateEmail, validatePassword } from "@/lib/validators";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr) newErrors.email = emailErr;
    if (passErr) newErrors.password = passErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      toast.success("Login successful");
      window.location.href = "/dashboard";
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-6">
            Login
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                className={`w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                className={`w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Min 8 characters"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
            >
              {loading && <Spinner />}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm mt-4 text-center text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
