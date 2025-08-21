// app/(auth)/layout.tsx
import { ReactNode } from "react";
import Sidemenu from "@/components/Sidemenu";
import BottomNav from "@/components/BottomNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className=" bg-white mx-auto flex">
      {/* Render the actual page content (login, register, forgot password, etc.) */}
      <Sidemenu />
      <BottomNav />

      <div className="p-5 mx-auto w-screen h-[calc(100vh-64px) bg-gray-50 overflow-y-scroll">{children}</div>
    </div>
  );
}
