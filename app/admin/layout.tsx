// app/(auth)/layout.tsx
import { ReactNode } from "react";
import Sidemenu from "@/components/Sidemenu";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className=" bg-white flex">

        {/* Render the actual page content (login, register, forgot password, etc.) */}
              <Sidemenu />

        <div>{children}</div>

    </div>
  );
}
