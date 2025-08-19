"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GoChevronUp, GoChevronDown } from "react-icons/go";
import { FaEye } from "react-icons/fa";
import { HiChartBar, HiDocumentText } from "react-icons/hi";
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

// Assuming these icons are available and imported from a library
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

// Dashboard component
const Dashboard = () => {
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

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const router = useRouter();

  // SSE setup to fetch real-time data from the server
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

    return () => {
      eventSource.close();
    };
  }, []);

  // Memoize dashboard data to prevent re-calculation on every render
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

    // Sort issues by creation date for "Recent Issues" table
    const sortedIssues = [...issues].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const recentIssues = sortedIssues.slice(0, 5); // Get the 5 most recent issues

    const issuesByCategory = issues.reduce((acc, issue) => {
      acc[issue.malpractice.type] = (acc[issue.malpractice.type] || 0) + 1;
      return acc;
    }, {});

    const issuesByStatus = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {});

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

  // Chart data and options
  const barChartData = useMemo(() => {
    const categories = Object.keys(dashboardData.issuesByCategory);
    const values = Object.values(dashboardData.issuesByCategory);

    return {
      labels: categories,
      datasets: [
        {
          label: "Number of Issues",
          data: values,
          backgroundColor: [
            "#FFD700", // Gold
            "#FFA500", // Orange
            "#FF6B35", // Red-Orange
            "#4ECDC4", // Teal
            "#45B7D1", // Blue
            "#96CEB4", // Mint
            "#FFEAA7", // Light Yellow
            "#DDA0DD", // Plum
          ],
          borderColor: [
            "#E6C200", // Darker Gold
            "#E6940A", // Darker Orange
            "#E55A2B", // Darker Red-Orange
            "#3FB8AF", // Darker Teal
            "#3A9BC1", // Darker Blue
            "#7FB069", // Darker Mint
            "#F0D43A", // Darker Light Yellow
            "#C885C8", // Darker Plum
          ],
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
      labels: statuses.map(status => status.charAt(0).toUpperCase() + status.slice(1)),
      datasets: [
        {
          label: "Issues by Status",
          data: values,
          backgroundColor: [
            "#FFD700", // Gold for pending
            "#4ECDC4", // Teal for in-progress
            "#96CEB4", // Mint for resolved
            "#FFA500", // Orange for other statuses
            "#45B7D1", // Blue
            "#FF6B35", // Red-Orange
          ],
          borderColor: [
            "#E6C200",
            "#3FB8AF",
            "#7FB069",
            "#E6940A",
            "#3A9BC1",
            "#E55A2B",
          ],
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  }, [dashboardData.issuesByStatus]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 12,
            family: "Inter, system-ui, sans-serif",
          },
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
        font: {
          family: "Inter, system-ui, sans-serif",
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
            family: "Inter, system-ui, sans-serif",
          },
        },
        grid: {
          color: "#E5E7EB",
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
            family: "Inter, system-ui, sans-serif",
          },
          maxRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const pieChartOptions = {
    ...chartOptions,
    cutout: "40%", // Creates a donut chart effect
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: "bottom" as const,
      },
    },
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading dashboard data...</p>
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

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <GoChevronUp className="h-5 w-5 text-green-500" />;
    } else if (change < 0) {
      return <GoChevronDown className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="flex flex-col p-6 space-y-6 bg-white border border-gray-200 rounded-lg h-[calc(100vh-100px)] overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Issues Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Total Issues</h2>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {totalIssues}
            </span>
          </div>
        </div>

        {/* Open Issues Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Open Issues</h2>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {openIssues}
            </span>
          </div>
        </div>

        {/* Issues This Week Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">
              New Issues This Week
            </h2>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {issuesThisWeek}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Issues and Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Issues Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header with yellow background and black text, rounded on top */}
          <div className="rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900 pl-6 py-4">
              Recent Issues
            </h2>
          </div>

          <div className="overflow-x-auto rounded-t-lg">
            <table className="min-w-full text-sm text-left text-[#333333] border-collapse">
              <thead className="text-xs uppercase bg-[#ffde17] text-black ">
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
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Issue ID
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Date Submitted
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 font-semibold text-right"
                  >
                    Actions
                  </th>
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
                      <td className="px-6 py-4 font-medium text-[#333333] whitespace-nowrap">
                        #{issue.REF.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-[#333333]">
                        {issue.malpractice.description.substring(0, 30)}...
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`p-2 text-md w-full font-semibold rounded-sm ${getStatusBadge(
                            issue.status
                          )}`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#333333]">
                        {new Date(issue.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          className="cursor-pointer text-black font-semibold border-[0.5px] border-gray-300 rounded-md px-4 py-2 transform active:scale-95 transition-transform duration-200 flex items-center justify-center gap-2
                          hover:bg-gray-100 hover:border-gray-400"
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
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No recent issues to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Container */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Issues by Category
            </h2>
            <div className="h-60">
              {Object.keys(issuesByCategory).length > 0 ? (
                <Bar data={barChartData} options={barChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
                  <p className="text-gray-400">No data available</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Issue Status Breakdown
            </h2>
            <div className="h-60">
              {Object.keys(issuesByStatus).length > 0 ? (
                <Pie data={pieChartData} options={pieChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
                  <p className="text-gray-400">No data available</p>
                </div>
              )}
            </div>
          </div>
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

export default Dashboard;