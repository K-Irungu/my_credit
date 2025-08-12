"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Ensure all fields are filled!");
      return;
    }

    if (email === "dev@tierdata.co.ke" && password === "password") {
      toast.success("Login successful!");
      router.push("/admin/dashboard");
    } else {
      toast.error("Invalid email or password!");
    }
  };

  return (
    <main className="flex items-center justify-center py-10 px-2 h-[60vh]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        {/* Logo or title */}
        <div className="text-center mb-4">
          <img
            src="/images/MyCredit-Logo.webp"
            alt="MyCredit Logo"
            className="mx-auto h-13 mb-2"
          />
          <p className="text-gray-500 text-sm text-left">
            Enter admin credentials to access the dashboard
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400 text-sm"
            placeholder="Email Address"
            required
          />

          {/* Password */}
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400 text-sm"
            placeholder="Password"
            required
          />

          {/* Submit button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#ffde17] py-3 font-semibold text-[#58595d] hover:text-[#ffde17] hover:bg-[#58595d] transition duration-200 cursor-pointer"
          >
            Sign In
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-right text-sm text-[#58595d]">
          <a href="#" className="text-[#58595d] hover:underline">
            Forgot your password?
          </a>
        </div>
      </div>
    </main>
  );
};

export default Login;
