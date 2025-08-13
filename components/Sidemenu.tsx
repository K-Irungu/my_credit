"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  special?: boolean; // Add this line
}

export default function Sidemenu() {
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const browser = navigator.userAgent;
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ browser }),
      });

      const data = await response.json();
      if (data.status !== 200) {
        toast.error(data.message || "Logout failed");
        setIsLoading(false);
        return;
      }

      localStorage.removeItem("deviceId");
      toast.success(data.message || "Logout successful");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong during logout");
      setIsLoading(false);
    }
  };

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: HomeIcon, path: "/admin" },
    { name: "Reports", icon: ClipboardDocumentListIcon, path: "/admin/reports" },
    { name: "Case Management", icon: BriefcaseIcon, path: "/admin/cases" },
    { name: "Analytics", icon: ChartBarIcon, path: "/admin/analytics" },
    { name: "Settings", icon: Cog6ToothIcon, path: "/admin/settings" },
  ];

const MenuButton = ({ item }: { item: MenuItem }) => (
  <button
    onClick={() => {
      if (item.action) {
        item.action();
      } else if (item.path) {
        router.push(item.path);
      }
    }}
    className={`cursor-pointer flex items-center gap-3 w-full text-left transition-all duration-200 rounded-lg
      ${open ? "px-4 py-3" : "px-0 py-3 justify-center"}
      ${
        item.danger
          ? "hover:bg-red-600 text-red-600"
          : item.special
          ? "bg-black text-white hover:bg-[#ffde17] hover:text-black" // New styles for the Logout button
          : "hover:bg-[#ffde17] hover:text-black text-black"
      }
      font-medium`}
    aria-label={item.name}
  >
    <item.icon className="h-5 w-5 shrink-0" />
    {open && <span className="truncate">{item.name}</span>}
  </button>
);
  return (
    <aside
      className={`h-[calc(100vh-64px)] bg-white border-r border-gray-200 text-black flex flex-col transition-all duration-300 ${
        open ? "w-64" : "w-20"
      }`}
      role="navigation"
    >
      {/* Logo / Toggle */}
      <div className="flex items-center justify-between py-3 border-b border-gray-200">
        {open && <span className="font-bold text-lg tracking-tight mx-auto">Admin Panel</span>}
        <button
          onClick={() => setOpen(!open)}
          className="px-4 py-3 rounded-lg hover:bg-[#ffde17] transition-colors cursor-pointer mx-auto "
          aria-label="Toggle menu"
        >
          {open ? (
            <ChevronDoubleLeftIcon className="h-5 w-5 " />
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

  {/* Logout Button - Fixed at bottom */}
<div className="p-3 border-t border-gray-200 ">
  <MenuButton
    item={{
      name: "Logout",
      icon: ArrowLeftOnRectangleIcon,
      action: handleLogout,
      special: true, // Add this property to trigger the new styles
    }}
  />
</div>

      {/* Loading overlay */}
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
  );
}
