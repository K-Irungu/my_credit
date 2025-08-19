"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react"; // 1. Import hooks

const Login = () => {
  // Add this line to use the session hook
  const { data: session } = useSession();

  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  const router = useRouter();

  // 1) Generate or load deviceId on mount
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  // 2) Clear inputs when loading finishes
  useEffect(() => {
    if (!isLoading) {
      setEmail("");
      setPassword("");
    }
  }, [isLoading]);

  // 3) Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Ensure all fields are filled!");
      return;
    }

    setIsLoading(true);

    try {
      const browser = navigator.userAgent;
      const loginEndpoint = "/api/auth/login";

      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, deviceId, browser }),
      });

      const data = await response.json();

      if (data.status !== 200) {
        setTimeout(() => toast.error(data.message || "Login failed"), 500);
        setTimeout(() => setIsLoading(false), 4500);
        return;
      }

      setTimeout(() => {
        toast.success(data.message || "Login successful");
        router.push("/admin/dashboard");
      }, 4500);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  // 4) Render UI
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
        {/* Header */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <input
            type="password"
            id="password"
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400 text-sm"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`cursor-pointer w-full font-bold py-3 rounded-md transition duration-300 ease-in-out transform-gpu ${
              isLoading
                ? "bg-[#3C3C3C] text-[#FAD41A] cursor-not-allowed"
                : "bg-[#FAD41A] text-[#3C3C3C] hover:text-[#FAD41A] hover:bg-[#3C3C3C] active:scale-95"
            }`}
          >
            {isLoading ? <>Loading...</> : "Sign In"}
          </button>
        </form>

        {/* Google Login Section */}
        {session ? (
          <div className="flex flex-col items-center mt-6">
            <p className="text-gray-600">Signed in as {session.user?.email}</p>
            <button
              onClick={() => signOut()}
              className="mt-2 text-sm text-red-500 hover:underline"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-6">
            <div className="relative flex items-center w-full my-4">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="flex-shrink mx-4 text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>
            <button
              onClick={() => signIn("google")}
              className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <img
                src="/images/google-icon.svg"
                alt="Google Icon"
                className="w-5 h-5 mr-2"
              />
              Sign in with Google
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-right text-sm text-[#58595d]">
          <a
            href="/auth/forgot-password"
            className="text-[#58595d] hover:underline"
          >
            Forgot your password?
          </a>
        </div>
      </div>
    </main>
  );
};

export default Login;