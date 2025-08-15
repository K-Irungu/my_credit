"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-1  z-40" />
      )}
      Dashboard
    </div>
  );
};

export default Dashboard;
