"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";
import Spinner from "@/components/Spinner";
import { validateEmail, validatePassword, validateRequired, getPasswordStrength } from "@/lib/validators";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const strength = getPasswordStrength(password);
  const strengthColors = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"];

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateRequired(name, "Name");
    if (nameErr) newErrors.name = nameErr;
    else if (name.trim().length > 100) newErrors.name = "Name must be 100 characters or less";

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success("Registered successfully");
      router.push("/login");
    } catch {
      toast.error("Registration failed");
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
            Register
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                id="name" type="text" value={name}
                onChange={(e) => { setName(e.target.value); clearError("name"); }}
                className={`w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                placeholder="Your name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                id="email" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                className={`w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                id="password" type="password" value={password}
                onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                className={`w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                placeholder="Min 8 characters" aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined}
              />
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength.level ? strengthColors[strength.level] : "bg-gray-200 dark:bg-gray-600"}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength.level === 1 ? "text-red-500" : strength.level === 2 ? "text-yellow-500" : "text-green-500"}`}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input
                id="confirmPassword" type="password" value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                className={`w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                placeholder="Re-enter password" aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
              />
              {errors.confirmPassword && <p id="confirm-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
            >
              {loading && <Spinner />}
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-sm mt-4 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
