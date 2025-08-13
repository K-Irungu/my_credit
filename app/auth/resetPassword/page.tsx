'use client'

import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const ResetPassword = () => {
  // State for form inputs and UI messages
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [isLinkValid, setIsLinkValid] = useState(false); // To control form rendering

  const router = useRouter();

  // Generate or load deviceId once on component mount
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  // Extract token and email from URL and validate link
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlToken = queryParams.get("token");
    const urlEmail = queryParams.get("email");

    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(urlEmail);
      setIsLinkValid(true);
    } else {
      toast.error("Invalid or missing password reset link.");
      setIsLinkValid(false);
    }
  }, []);

  // Clear inputs when loading finishes
  useEffect(() => {
    if (!isLoading) {
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // --- Validate inputs ---
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      // --- Make reset-password request ---
      const response = await fetch("/api/auth/password/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword,
          deviceId,
        }),
      });

      const data = await response.json();

      // --- Handle response ---
      if (data.status === 200) {
        toast.success(data.message || "Password reset successful.");
        router.push("/auth/login");
      } else {
        toast.error(data.message || "An unexpected error occurred.");
      }
    } catch (error) {
      // --- Handle network or unexpected errors ---
      toast.error("Failed to connect to the server. Please try again.");
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center py-10 px-2 h-[60vh]">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-1 z-40" />
      )}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        {/* Logo and title */}
        <div className="text-center mb-4">
          <img
            src="/images/MyCredit-Logo.webp"
            alt="MyCredit Logo"
            className="mx-auto h-13 mb-2"
          />
          <p className="text-gray-500 text-sm text-left">
            Please enter and confirm your new password below.
          </p>
        </div>

        {/* Render the form only if the link is valid */}
        {isLinkValid ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <input
              type="password"
              id="newPassword"
              disabled={isLoading}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400 text-sm"
              placeholder="New Password"
              required
            />

            {/* Confirm New Password */}
            <input
              type="password"
              id="confirmPassword"
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400 text-sm"
              placeholder="Confirm New Password"
              required
            />

            {/* Reset Password Button */}
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
                "Reset Password"
              )}
            </button>
          </form>
        ) : (
            <p className="text-center text-sm text-red-500">
                The password reset link is invalid or expired. Please request a new one.
            </p>
        )}

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

export default ResetPassword;
