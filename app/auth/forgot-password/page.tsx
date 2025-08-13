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

      // --- Handle unsuccessful login ---
      if (data.status !== 200) {
        setTimeout(() => {
          toast.error(data.message || "Login failed");
        }, 500);

        setTimeout(() => {
          setIsLoading(false);
        }, 4500);
        return;
      }

      // --- Handle successful login ---
      setTimeout(() => {
        toast.success(data.message || "Login failed");
        router.push("/admin");
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
        <div className="fixed inset-0 bg-black/20 bg-opacity-1  z-40" />
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
            {isLoading ? (
              <>
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 mr-3 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
                Loading...
              </>
            ) : (
              "Send Reset Link"
            )}
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
