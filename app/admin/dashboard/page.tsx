"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GoChevronUp, GoChevronDown } from "react-icons/go";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import IssueModal from "@/components/IssueModal";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);


interface Issue {
  _id: string;
  implicatedPersonel: {
    firstName: string;
    lastName: string;
    companyLocation: string;
    rolePosition: string;
    phoneNumber: string;
  };
  malpractice: {
    type: string;
    location: string;
    description: string;
    isOngoing: string;
  };
  reporter: {
    _id: string;
    REF: string;
  };
  status: string;
  source: string;
  filename: string;
  createdAt: string;
  updatedAt: string;
  REF: string;
  __v: number;
}

const CHART_COLORS = {
  background: [
    "#FFD700",
    "#FFA500",
    "#FF6B35",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
  ],
  border: [
    "#E6C200",
    "#E6940A",
    "#E55A2B",
    "#3FB8AF",
    "#3A9BC1",
    "#7FB069",
    "#F0D43A",
    "#C885C8",
  ],
};

const STATUS_COLORS = {
  resolved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  default: "bg-gray-100 text-gray-800",
};

const Dashboard = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const router = useRouter();

  // Server-Sent Events Connection
  useEffect(() => {
    const eventSource = new EventSource("/api/admin/issues/stream");

    eventSource.onmessage = (event) => {
      try {
        const newIssuesList = JSON.parse(event.data);
        if (newIssuesList && Array.isArray(newIssuesList)) {
          setIssues(newIssuesList);
        } else {
          setError("Failed to process data from server.");
        }
        setLoading(false);
      } catch (e) {
        setError("Failed to process data from server.");
        setLoading(false);
      }
    };

    eventSource.onerror = (e) => {
      console.error("SSE connection failed:", e);
      setError("Connection to server lost. Please refresh.");
      eventSource.close();
      setLoading(false);
    };

    return () => eventSource.close();
  }, []);

  // Dashboard Data Processing
  const dashboardData = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));

    const previousWeekIssues = issues.filter(
      (issue) => new Date(issue.createdAt) < oneWeekAgo
    );
    const thisWeekIssues = issues.filter(
      (issue) => new Date(issue.createdAt) >= oneWeekAgo
    );

    const totalIssues = issues.length;
    const openIssues = issues.filter(
      (issue) => issue.status !== "resolved"
    ).length;
    const issuesThisWeek = thisWeekIssues.length;
    const issuesLastWeek = previousWeekIssues.length;

    const issuesThisWeekChange =
      issuesLastWeek > 0
        ? ((issuesThisWeek - issuesLastWeek) / issuesLastWeek) * 100
        : issuesThisWeek > 0
        ? 100
        : 0;

    const recentIssues = [...issues]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 7);

    const issuesByCategory = issues.reduce(
      (acc: Record<string, number>, issue) => {
        acc[issue.malpractice.type] = (acc[issue.malpractice.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const issuesByStatus = issues.reduce(
      (acc: Record<string, number>, issue) => {
        acc[issue.status] = (acc[issue.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalIssues,
      openIssues,
      issuesThisWeek,
      issuesThisWeekChange,
      recentIssues,
      issuesByCategory,
      issuesByStatus,
    };
  }, [issues]);

  // Chart Configuration
  const baseChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            font: { size: 12, family: "Inter, system-ui, sans-serif" },
            color: "#374151",
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: "#1F2937",
          titleColor: "#F9FAFB",
          bodyColor: "#F9FAFB",
          borderColor: "#374151",
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          font: { family: "Inter, system-ui, sans-serif" },
        },
      },
    }),
    []
  );

  const barChartData = useMemo(() => {
    const categories = Object.keys(dashboardData.issuesByCategory);
    const values = Object.values(dashboardData.issuesByCategory);

    return {
      labels: categories,
      datasets: [
        {
          label: "Number of Issues",
          data: values,
          backgroundColor: CHART_COLORS.background,
          borderColor: CHART_COLORS.border,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }, [dashboardData.issuesByCategory]);

  const pieChartData = useMemo(() => {
    const statuses = Object.keys(dashboardData.issuesByStatus);
    const values = Object.values(dashboardData.issuesByStatus);

    return {
      labels: statuses.map(
        (status) => status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [
        {
          label: "Issues by Status",
          data: values,
          backgroundColor: CHART_COLORS.background.slice(0, 6),
          borderColor: CHART_COLORS.border.slice(0, 6),
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  }, [dashboardData.issuesByStatus]);

  const barChartOptions = useMemo(
    () => ({
      ...baseChartOptions,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#6B7280",
            font: { size: 11, family: "Inter, system-ui, sans-serif" },
          },
          grid: { color: "#E5E7EB", drawBorder: false },
        },
        x: {
          ticks: {
            color: "#6B7280",
            font: { size: 11, family: "Inter, system-ui, sans-serif" },
            maxRotation: 45,
          },
          grid: { display: false },
        },
      },
    }),
    [baseChartOptions]
  );

  const pieChartOptions = useMemo(
    () => ({
      ...baseChartOptions,
      cutout: "40%",
      plugins: {
        ...baseChartOptions.plugins,
        legend: {
          ...baseChartOptions.plugins.legend,
          position: "bottom" as const,
        },
      },
    }),
    [baseChartOptions]
  );

  // Utility Functions
  const getStatusBadge = (status: string) =>
    STATUS_COLORS[status.toLowerCase() as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS.default;

  const getChangeIcon = (change: number) => {
    if (change > 0) return <GoChevronUp className="h-5 w-5 text-green-500" />;
    if (change < 0) return <GoChevronDown className="h-5 w-5 text-red-500" />;
    return null;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  // Loading and Error States
if (loading) {
  return (
    <div className="flex flex-col p-6 space-y-6 bg-white border border-gray-200 rounded-lg h-[calc(100vh-100px)] overflow-y-auto">
      {/* Page Title */}
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 p-6 rounded-lg shadow-xs border border-gray-200 animate-pulse"
          >
            <div className="h-4 w-24 bg-gray-300 rounded mb-4"></div>
            <div className="h-8 w-16 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>

      {/* Table & Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Placeholder */}
        <div className="lg:col-span-2 bg-gray-100 rounded-lg shadow-xs border border-gray-200 p-6 animate-pulse">
          <div className="h-5 w-32 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 h-60 rounded-lg shadow-xs border border-gray-200 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}


  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  const {
    totalIssues,
    openIssues,
    issuesThisWeek,
    issuesThisWeekChange,
    recentIssues,
    issuesByCategory,
    issuesByStatus,
  } = dashboardData;

  return (
    <div className="flex flex-col p-6 space-y-6 bg-white border border-gray-200 rounded-lg h-[calc(100vh-100px)] overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard title="Total Issues" value={totalIssues} />
        <StatsCard title="Open Issues" value={openIssues} />
        <StatsCard title="New Issues This Week" value={issuesThisWeek} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Issues Table */}
        <div className="lg:col-span-2 bg-white rounded-lg sm:shadow-xs sm:border sm:border-gray-200">
<div className="rounded-t-lg bg-[#ffde17] sm:bg-white">
  <h2 className="text-lg font-semibold text-gray-900 pl-6 pt-4">
    Recent Issues
  </h2>
  <p className="text-xs text-gray-700 pl-6 pb-3">
    (Showing the 7 most recent issues)
  </p>
</div>


     {/* Desktop Table */}
<div className="overflow-x-auto rounded-t-lg hidden sm:flex">
  <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
    <thead className="text-xs uppercase bg-[#ffde17] text-gray-900 font-semibold">
      <tr>
        <th scope="col" className="p-4">
          <div className="flex items-center">
            <input
              id="checkbox-all"
              type="checkbox"
              className="w-4 h-4 text-black bg-white border border-[#E0E0E0] rounded focus:ring-black focus:ring-1"
            />
            <label htmlFor="checkbox-all" className="sr-only">
              Select all
            </label>
          </div>
        </th>
        <th scope="col" className="px-6 py-3">Issue ID</th>
        <th scope="col" className="px-6 py-3">Malpractice Type</th>
        <th scope="col" className="px-6 py-3">Status</th>
        <th scope="col" className="px-6 py-3 hidden lg:flex">Date Submitted</th>
        <th scope="col" className="px-6 py-3 text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      {recentIssues.length > 0 ? (
        recentIssues.map((issue) => (
          <tr
            key={issue.REF}
            className="bg-white border-b border-[#E0E0E0] hover:bg-[#fefadd]"
          >
            <td className="w-4 p-4">
              <div className="flex items-center">
                <input
                  id={`checkbox-${issue.REF}`}
                  type="checkbox"
                  className="w-4 h-4 text-black bg-white border border-[#E0E0E0] rounded focus:ring-black focus:ring-1"
                />
                <label
                  htmlFor={`checkbox-${issue.REF}`}
                  className="sr-only"
                >
                  Select issue
                </label>
              </div>
            </td>
            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
              #{issue.REF.slice(0, 8)}...
            </td>
            <td className="px-6 py-4 text-gray-700 font-medium">
              {issue.malpractice.type.substring(0, 30)}
            </td>
            <td className="px-6 py-4">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-sm ${getStatusBadge(
                  issue.status
                )}`}
              >
                {issue.status}
              </span>
            </td>
            <td className="px-6 py-4 text-gray-700 hidden lg:flex">
              {formatDate(issue.createdAt)}
            </td>
            <td className="px-6 py-4 text-right">
              <button
                type="button"
                className="cursor-pointer text-gray-900 font-medium border border-gray-300 rounded-md px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-transform duration-200"
                onClick={() => handleViewIssue(issue)}
              >
                <FaEye className="w-4 h-4" />
                View
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={6} className="text-center py-8 text-gray-500 font-medium">
            No recent issues to display.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


          {/* Mobile View */}
          <div className="sm:hidden text-sm">
            {recentIssues.length > 0 ? (
              <>
                <div className="max-h-[540px] overflow-y-auto space-y-4 pr-1 scroll-smooth">
                  {recentIssues.map((issue) => (
                    <div
                      key={issue.REF}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:shadow transition-shadow duration-200 mt-4"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">
                          REF: #{issue.REF.slice(0, 8)}...
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-sm text-xs font-semibold ${getStatusBadge(
                            issue.status
                          )}`}
                        >
                          {issue.status}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-2 text-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500">
                            Malpractice
                          </span>
                          <span className="text-xs capitalize text-right max-w-[50%] truncate">
                            {issue.malpractice.type}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500">
                            Submitted
                          </span>
                          <span className="text-xs text-right">
                            {formatDate(issue.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => handleViewIssue(issue)}
                          className="w-full text-black font-semibold text-xs border border-gray-300 rounded-md py-2 px-4 uppercase flex items-center justify-center gap-2 hover:bg-gray-100 transition active:scale-95"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No recent issues to display.
              </div>
            )}
          </div>
        </div>

        {/* Charts Container */}
        <div className="space-y-6">
          <ChartCard
            title="Issues by Category"
            hasData={Object.keys(issuesByCategory).length > 0}
          >
            <Bar data={barChartData} options={barChartOptions} />
          </ChartCard>

          <ChartCard
            title="Issue Status Breakdown"
            hasData={Object.keys(issuesByStatus).length > 0}
          >
            <Pie data={pieChartData} options={pieChartOptions} />
          </ChartCard>
        </div>
      </div>

      {/* Issue Modal */}
      {selectedIssue && (
        <IssueModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          issue={selectedIssue}
        />
      )}
    </div>
  );
};

// Reusable Components
const StatsCard: React.FC<{ title: string; value: number }> = ({
  title,
  value,
}) => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xs border border-gray-200">
    <div className="flex items-center justify-between">
      <h2 className="text-xs sm:text-sm font-medium text-gray-500">
        {title}
      </h2>
    </div>
    <div className="mt-1 flex items-baseline justify-between">
      <span className="text-2xl sm:text-3xl font-bold text-gray-900">
        {value}
      </span>
    </div>
  </div>
);


const ChartCard: React.FC<{
  title: string;
  hasData: boolean;
  children: React.ReactNode;
}> = ({ title, hasData, children }) => (
  <div className="bg-white p-5 rounded-lg shadow-xs border border-gray-200">
    <h2 className="text-sm font-semibold text-gray-800 mb-4">{title}</h2>{" "}
    {/* Updated */}
    <div className="h-60">
      {hasData ? (
        children
      ) : (
        <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
          <p className="text-xs text-gray-400">No data available</p>{" "}
          {/* Updated */}
        </div>
      )}
    </div>
  </div>
);

export default Dashboard;
