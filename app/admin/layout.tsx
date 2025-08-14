// app/(auth)/layout.tsx
import { ReactNode } from "react";
import Sidemenu from "@/components/Sidemenu";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className=" bg-white mx-auto flex">
      {/* Render the actual page content (login, register, forgot password, etc.) */}
      <Sidemenu />

      <div className="p-5 mx-auto w-screen h-[calc(100vh-64px)">{children}</div>
    </div>
  );
}
