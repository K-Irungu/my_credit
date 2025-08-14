"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const forgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  const router = useRouter();

  // Generate or load deviceId once on component mount
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID(); // generate UUID (modern browsers)
      localStorage.setItem("deviceId", storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  // Clear inputs when loading finishes (isLoading changes from true to false)
  useEffect(() => {
    if (!isLoading) {
      setEmail("");
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // --- Validate input ---
    if (!email) {
      toast.error("Ensure all fields are filled!");
      return;
    }

    setIsLoading(true);

    try {
      const browser = navigator.userAgent;

      // --- Make forgot-password request ---
      const response = await fetch("/api/auth/password/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, deviceId, browser }),
      });

      const data = await response.json();

      // --- Handle unsuccessful  ---
      if (data.status !== 200) {
        setTimeout(() => {
          toast.error(data.message || "Login failed");
        }, 500);

        setTimeout(() => {
          setIsLoading(false);
        }, 4500);
        return;
      }

      // --- Handle success ---
      setTimeout(() => {
        toast.success(data.message || "Login failed");
        router.push("/auth/login");
      }, 4500);
    } catch (error) {
      // --- Handle network or unexpected errors ---
      toast.error("Something went wrong. Please try again.");
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center py-10 px-2 h-[60vh]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <svg
            className="animate-spin h-6 w-6 text-[#ffde17]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        </div>
      )}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        {/* Logo or title */}
        <div className="text-center mb-4">
          <img
            src="/images/MyCredit-Logo.webp"
            alt="MyCredit Logo"
            className="mx-auto h-13 mb-2"
          />
          <p className="text-gray-500 text-sm text-left">
            Enter email address to receive password reset link
          </p>
        </div>

        {/* Password reset form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            id="email"
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400 text-sm"
            placeholder="Email Address"
            required
          />

          {/* Send Reset Link Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
          w-full font-bold py-3 rounded-md cursor-pointer
          transition duration-300 ease-in-out transform-gpu
          ${
            isLoading
              ? "bg-[#3C3C3C] text-[#FAD41A] cursor-not-allowed"
              : "bg-[#FAD41A] text-[#3C3C3C] hover:text-[#FAD41A] hover:bg-[#3C3C3C] active:scale-95"
          }
        `}
          >
            {isLoading ? <>Loading...</> : "Send Reset Link"}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-right text-sm text-[#58595d]">
          <a href="/auth/login" className="text-[#58595d] hover:underline">
            Already have an account?
          </a>
        </div>
      </div>
    </main>
  );
};

export default forgotPassword;
