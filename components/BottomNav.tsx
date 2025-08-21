// components/BottomNav.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { CiLogout } from "react-icons/ci";

const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Generate or load deviceId on mount
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  // Handle clicks outside modal
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsLogoutModalOpen(false);
      }
    };

    if (isLogoutModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isLogoutModalOpen]);

  // Logout confirm
  const handleConfirmLogout = async () => {
    setIsLoading(true);
    setIsLogoutModalOpen(false);

    try {
      const browser = navigator.userAgent;
      const logoutEndpoint = "/api/auth/logout";

      const response = await fetch(logoutEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ deviceId, browser }),
      });

      const data = await response.json();

      if (data.status !== 200) {
        setTimeout(() => toast.error(data.message || "Logout failed"), 500);
        setTimeout(() => setIsLoading(false), 4500);
        return;
      }

      localStorage.removeItem("deviceId");

      setTimeout(() => {
        toast.success(data.message || "Logout successful");
        router.push("/auth/login");
      }, 4500);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong during logout");
      setIsLoading(false);
    }
  };

  const handleOpenLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  // Define nav items
  const navItems = [
    { label: "Dashboard", icon: HomeIcon, path: "/admin/dashboard" },
    { label: "Issues", icon: ClipboardDocumentListIcon, path: "/admin/issues" },
    { label: "Manage", icon: BriefcaseIcon, path: "/admin/issue-management" },
    { label: "Logout", icon: CiLogout, action: handleOpenLogoutModal },
  ];

  return (
    <>
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
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 sm:hidden">
  
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium text-black">
          {navItems.map((item) => {
            const isActive = item.path && pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.path) router.push(item.path);
                }}
                className={`inline-flex flex-col items-center justify-center px-5 transition-colors group border-[0.5px] border-gray-200
                  ${isActive ? "bg-[#ffde17]" : "hover:bg-[#ffde17]"}`}
              >
                <Icon
                  className={`w-5 h-5 mb-1 ${
                    isActive
                      ? "text-black"
                      : "text-gray-500 group-hover:text-black"
                  }`}
                />
                <span
                  className={`text-xs ${
                    isActive
                      ? "text-black"
                      : "text-gray-500 group-hover:text-black"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-[#E0E0E0] transform transition-all duration-300 scale-100 opacity-100 ease-out-back"
          >
            <div className="absolute inset-x-0 -top-6 flex justify-center">
              <div className="bg-[#ffde17] p-3 rounded-full shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-center text-gray-900 mt-4 mb-2 tracking-tight">
              Confirm Logout
            </h3>
            <p className="text-base text-left text-gray-600 mb-6 font-light">
              Are you sure you want to log out of your account? Your session
              will be terminated.
            </p>

            <div className="flex flex-row-reverse justify-between items-center gap-4">
              <button
                onClick={handleConfirmLogout}
                disabled={isLoading}
                className={`min-w-[130px] px-5 py-2.5 text-base cursor-pointer font-semibold rounded-lg text-black transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 shadow-sm
              ${
                isLoading
                  ? "bg-gray-200 cursor-not-allowed opacity-75"
                  : "bg-[#ffde17] hover:bg-gray-900 hover:text-[#ffde17] focus:outline-none focus:ring-2 focus:ring-[#ffde17] focus:ring-offset-2"
              }`}
              >
                {isLoading ? (
                  <div className="">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-800 "
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging out...
                  </div>
                ) : (
                  "Log Out"
                )}
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="cursor-pointer min-w-[130px] px-5 py-2.5 text-base font-medium text-gray-600 bg-transparent rounded-lg border border-gray-200 hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-gray-200 focus:outline-none transform active:scale-98 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;
