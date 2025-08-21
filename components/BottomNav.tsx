// components/BottomNav.tsx

"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
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


  const handleLogout = () => {

  }

  // Define nav items
  const navItems = [
    {
      label: "Dashboard",
      icon: HomeIcon,
      path: "/admin/dashboard",
    },
    {
      label: "Issues",
      icon: ClipboardDocumentListIcon,
      path: "/admin/issues",
    },
    {
      label: "Manage",
      icon: BriefcaseIcon,
      path: "/admin/issue-management",
    },
{
  label: "Logout",
  icon: CiLogout,
  action: handleLogout,
},

  ];

  return (
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
  );
};

export default BottomNav;
