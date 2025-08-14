"use client";

import { usePathname } from "next/navigation";

const MainTitle = () => {
  const pathname = usePathname();
  const hideHeader = pathname?.startsWith("/admin");

  return (
    <>
      {!hideHeader && (
        <header className="bg-[#ffde17] py-4 shadow-md">
          <div className="w-full container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 py-12 pl-5 sm:pl-5">
              Whistleblower Portal
            </h2>
          </div>
        </header>
      )}
    </>
  );
};

export default MainTitle;
