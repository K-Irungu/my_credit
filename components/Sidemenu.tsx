"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

interface MenuItem {
  name: string;
  icon: React.ElementType;
  path?: string;
  action?: () => void;
  danger?: boolean;
  special?: boolean;
}

export default function Sidemenu() {
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname(); // Get the current URL path

  //  Generate or load deviceId on mount
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  // ❗ New: useEffect hook to handle clicks outside the modal
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // If the modal ref exists and the click is outside the modal content, close the modal
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsLogoutModalOpen(false);
      }
    };

    if (isLogoutModalOpen) {
      // Add event listener when the modal is open
      document.addEventListener("mousedown", handleOutsideClick);
    }

    // Cleanup function to remove the event listener when the component unmounts or modal closes
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isLogoutModalOpen]);
  // --- Logout Handler ---
  const handleConfirmLogout = async () => {
    setIsLoading(true);
    setIsLogoutModalOpen(false); // Close the modal

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
  // This is the action for the MenuButton
  const handleOpenLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };
  // --- Menu Items ---
  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: HomeIcon, path: "/admin/dashboard" },
    {
      name: "Issues",
      icon: ClipboardDocumentListIcon,
      path: "/admin/issues",
    },
    {
      name: "Issue Management",
      icon: BriefcaseIcon,
      path: "/admin/issue-management",
    },
    // { name: "Analytics", icon: ChartBarIcon, path: "/admin/analytics" },
    { name: "Settings", icon: Cog6ToothIcon, path: "/admin/settings" },
  ];

  // --- Menu Button Component ---
  const MenuButton = ({ item }: { item: MenuItem }) => {
    const isActive = item.path && pathname.includes(item.path);

    // Special case for dashboard to avoid partial path matching issues
    const isDashboardActive = item.path === "/admin" && pathname === "/admin";
    const finalIsActive = item.path === "/admin" ? isDashboardActive : isActive;

    return (
      <button
        onClick={() => {
          if (item.action) {
            item.action();
          } else if (item.path) {
            router.push(item.path);
          }
        }}
        className={`cursor-pointer flex items-center gap-3 w-full text-left transition-all duration-200 rounded-lg
          ${open ? "px-4 py-3" : "p-3"}
          ${
            item.danger
              ? "hover:bg-red-600 text-red-600"
              : item.special
              ? "bg-black text-white hover:bg-[#ffde17] hover:text-black"
              : finalIsActive
              ? "bg-[#ffde17] text-black "
              : "hover:bg-[#ffde17] hover:text-black text-black"
          }
          font-medium`}
        aria-label={item.name}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {open && <span className="truncate">{item.name}</span>}
      </button>
    );
  };

  // --- Render ---
  return (
    <>
      <aside
        className={`h-[calc(100vh-64px)] bg-white border-r border-gray-200 text-black flex flex-col transition-all duration-300 ${
          open ? "w-64" : "w-20"
        }`}
        role="navigation"
      >
        {/* Header / Toggle */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          {open && (
            <span className="font-bold text-lg tracking-tight mx-auto">
              Admin Panel
            </span>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="px-4 py-3 rounded-lg hover:bg-[#ffde17] transition-colors cursor-pointer mx-auto"
            aria-label="Toggle menu"
          >
            {open ? (
              <ChevronDoubleLeftIcon className="h-5 w-5" />
            ) : (
              <ChevronDoubleRightIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <MenuButton key={item.name} item={item} />
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200">
          <MenuButton
            item={{
              name: "Logout",
              icon: ArrowLeftOnRectangleIcon,
              action: handleOpenLogoutModal,
              special: true,
            }}
          />
        </div>

        {/* Loading Overlay */}
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
      </aside>
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            ref={modalRef} // ❗ New: Add this ref to the modal content div
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
            <p className="text-base text-center text-gray-600 mb-6 font-light">
              Are you sure you want to log out of your account? Your session
              will be terminated.
            </p>

            <div className="flex flex-row-reverse justify-end items-center gap-4">
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
                  "Yes, Log Me Out"
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
}
