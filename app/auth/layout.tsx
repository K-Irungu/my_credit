// app/(auth)/layout.tsx
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className=" bg-[#fefadd]">

        {/* Render the actual page content (login, register, forgot password, etc.) */}
        <div>{children}</div>

    </div>
  );
}
