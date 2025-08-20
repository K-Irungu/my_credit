"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GoChevronUp, GoChevronDown } from "react-icons/go";
import { FaEye, FaFilter, FaDownload, FaExclamationTriangle, FaClock, FaCheckCircle } from "react-icons/fa";
import { HiDocumentText, HiChartBar } from "react-icons/hi";
import { useRouter } from "next/navigation";
import IssueModal from "@/components/IssueModal";

import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
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
  const [filteredLocation, setFilteredLocation] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState({ label: "Last 30 Days", value: 30 });
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    type: null,
    source: null,
  });

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

  // Filter issues based on active filters
  const filteredIssues = useMemo(() => {
    let result = issues;
    
    // Apply location filter
    if (filteredLocation) {
      result = result.filter(issue => issue.malpractice.location === filteredLocation);
    }
    
    // Apply status filter
    if (activeFilters.status) {
      result = result.filter(issue => issue.status === activeFilters.status);
    }
    
    // Apply type filter
    if (activeFilters.type) {
      result = result.filter(issue => issue.malpractice.type === activeFilters.type);
    }
    
    // Apply source filter
    if (activeFilters.source) {
      result = result.filter(issue => issue.source === activeFilters.source);
    }
    
    // Apply date filter
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - dateFilter.value);
    
    result = result.filter(issue => {
      const issueDate = new Date(issue.createdAt);
      return issueDate >= startDate;
    });
    
    return result;
  }, [issues, filteredLocation, activeFilters, dateFilter]);

  // Memoize analytics data to prevent re-calculation on every render
  const analyticsData = useMemo(() => {
    // Calculate issues by source (web vs ussd)
    const issuesBySource = filteredIssues.reduce((acc, issue) => {
      acc[issue.source] = (acc[issue.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate malpractice type distribution
    const issuesByCategory = filteredIssues.reduce((acc, issue) => {
      acc[issue.malpractice.type] = (acc[issue.malpractice.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate top 5 most affected locations
    const locationsCount = filteredIssues.reduce((acc, issue) => {
      const location = issue.malpractice.location;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort locations by count and take top 5
    const topLocations = Object.entries(locationsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    // Calculate trend data (reports over time)
    const now = new Date();
    const periodDays = typeof dateFilter.value === 'number' ? dateFilter.value : 30;
    const periodDates = Array.from({ length: periodDays }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (periodDays - 1 - i));
      return date.toISOString().split('T')[0];
    });

    const trendData = periodDates.map(date => {
      const count = filteredIssues.filter(issue => 
        issue.createdAt.split('T')[0] === date
      ).length;
      return { date, count };
    });

    // Calculate resolution time metrics
    const resolvedIssues = filteredIssues.filter(issue => issue.status === 'resolved');
    const resolutionTimes = resolvedIssues.map(issue => {
      const created = new Date(issue.createdAt);
      const updated = new Date(issue.updatedAt);
      return Math.round((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)); // Days
    });
    
    const avgResolutionTime = resolutionTimes.length > 0 
      ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length) 
      : 0;
    
    // Calculate high severity issues (pending for more than 7 days)
    const highSeverityIssues = filteredIssues.filter(issue => {
      if (issue.status !== 'resolved') {
        const created = new Date(issue.createdAt);
        const now = new Date();
        const daysOpen = Math.round((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return daysOpen > 7;
      }
      return false;
    });

    // Calculate financial impact (this would need actual data, using placeholder)
    const financialImpact = filteredIssues.length * 1250; // Placeholder calculation

    return {
      issuesBySource,
      issuesByCategory,
      topLocations,
      trendData,
      totalIssues: filteredIssues.length,
      openIssues: filteredIssues.filter(issue => issue.status !== 'resolved').length,
      resolvedIssues: resolvedIssues.length,
      avgResolutionTime,
      highSeverityIssues: highSeverityIssues.length,
      financialImpact,
    };
  }, [filteredIssues, dateFilter]);

  // Chart data and options for source distribution
  const sourceChartData = useMemo(() => {
    const sources = Object.keys(analyticsData.issuesBySource);
    const values = Object.values(analyticsData.issuesBySource);

    return {
      labels: sources.map(source => source.toUpperCase()),
      datasets: [
        {
          label: "Number of Issues",
          data: values,
          backgroundColor: [
            "#FFD700", // Gold for web
            "#4ECDC4", // Teal for USSD
          ],
          borderColor: [
            "#E6C200", // Darker Gold
            "#3FB8AF", // Darker Teal
          ],
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }, [analyticsData.issuesBySource]);

  // Chart data and options for malpractice type distribution
  const categoryChartData = useMemo(() => {
    const categories = Object.keys(analyticsData.issuesByCategory);
    const values = Object.values(analyticsData.issuesByCategory);

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
  }, [analyticsData.issuesByCategory]);

  // Chart data and options for trend line
  const trendChartData = useMemo(() => {
    const dates = analyticsData.trendData.map(item => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    const counts = analyticsData.trendData.map(item => item.count);

    return {
      labels: dates,
      datasets: [
        {
          label: "Reports Over Time",
          data: counts,
          borderColor: "#FFD700",
          backgroundColor: "rgba(255, 215, 0, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#FFD700",
          pointBorderColor: "#E6C200",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [analyticsData.trendData]);

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

  const lineChartOptions = {
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
          color: "#E5E7EB",
          drawBorder: false,
        },
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

  const handleFilterByLocation = (location: string) => {
    if (filteredLocation === location) {
      setFilteredLocation(null);
    } else {
      setFilteredLocation(location);
    }
  };

  const handleClearFilter = () => {
    setFilteredLocation(null);
    setActiveFilters({
      status: null,
      type: null,
      source: null,
    });
    setDateFilter({ label: "Last 30 Days", value: 30 });
  };

  const handleExportData = () => {
    // In a real implementation, this would generate a CSV or Excel file
    console.log("Exporting data:", analyticsData);
    alert("Data export functionality would be implemented here. This would generate a CSV or Excel file download.");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col p-6 space-y-6 bg-white border border-gray-200 rounded-lg min-h-screen overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Business Analytics Dashboard</h1>
        {(filteredLocation || activeFilters.status || activeFilters.type || activeFilters.source || dateFilter.value !== 30) && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Active filters: 
              {filteredLocation && <span className="font-semibold ml-1">Location: {filteredLocation}</span>}
              {activeFilters.status && <span className="font-semibold ml-1">Status: {activeFilters.status}</span>}
              {activeFilters.type && <span className="font-semibold ml-1">Type: {activeFilters.type}</span>}
              {activeFilters.source && <span className="font-semibold ml-1">Source: {activeFilters.source}</span>}
              {dateFilter.value !== 30 && <span className="font-semibold ml-1">Period: {dateFilter.label}</span>}
            </span>
            <button
              onClick={handleClearFilter}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <select
            value={dateFilter.value}
            onChange={(e) => setDateFilter({ 
              value: Number(e.target.value), 
              label: e.target.options[e.target.selectedIndex].text 
            })}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-black focus:border-black"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last Quarter</option>
            <option value={365}>Last Year</option>
          </select>

          <select
            value={activeFilters.status || ''}
            onChange={(e) => setActiveFilters({ ...activeFilters, status: e.target.value || null })}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-black focus:border-black"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={activeFilters.type || ''}
            onChange={(e) => setActiveFilters({ ...activeFilters, type: e.target.value || null })}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-black focus:border-black"
          >
            <option value="">All Types</option>
            {Object.keys(analyticsData.issuesByCategory).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={activeFilters.source || ''}
            onChange={(e) => setActiveFilters({ ...activeFilters, source: e.target.value || null })}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-black focus:border-black"
          >
            <option value="">All Sources</option>
            <option value="web">Web</option>
            <option value="ussd">USSD</option>
          </select>
        </div>

        <button 
          onClick={handleExportData}
          className="flex items-center gap-2 text-sm bg-[#ffde17] border border-[#ffde17] text-black rounded-md px-3 py-2 shadow-sm hover:bg-[#f8d500]"
        >
          <FaDownload className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Total Issues</h2>
            <div className={`p-2 rounded-full ${analyticsData.totalIssues > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <FaExclamationTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {analyticsData.totalIssues}
            </span>
            <span className="text-sm text-gray-500">
              {analyticsData.openIssues} open
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analyticsData.totalIssues > 0 ? 
              `Requires immediate attention across ${Object.keys(analyticsData.issuesByCategory).length} categories` : 
              'No issues reported in selected period'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Avg. Resolution Time</h2>
            <div className={`p-2 rounded-full ${analyticsData.avgResolutionTime > 14 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <FaClock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {analyticsData.avgResolutionTime}
            </span>
            <span className="text-sm text-gray-500">days</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analyticsData.avgResolutionTime > 14 ? 
              'Resolution time exceeds target. Review investigation processes.' : 
              'Within acceptable resolution timeframe'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">High Severity Issues</h2>
            <div className={`p-2 rounded-full ${analyticsData.highSeverityIssues > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <FaExclamationTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {analyticsData.highSeverityIssues}
            </span>
            <span className="text-sm text-gray-500">7 days old</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analyticsData.highSeverityIssues > 0 ? 
              'Critical issues pending resolution. Immediate action required.' : 
              'No long-pending issues detected'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Estimated Financial Impact</h2>
            <div className={`p-2 rounded-full ${analyticsData.financialImpact > 10000 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <FaCheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">
              ${(analyticsData.financialImpact / 1000).toFixed(1)}K
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analyticsData.financialImpact > 10000 ? 
              'Significant financial impact. Review control measures.' : 
              'Minimal financial impact detected'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Issue Source Distribution
          </h2>
          <div className="h-60">
            {Object.keys(analyticsData.issuesBySource).length > 0 ? (
              <Bar data={sourceChartData} options={barChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-400">No data available</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analyticsData.issuesBySource.web > analyticsData.issuesBySource.ussd ? 
              'Web platform is the primary reporting channel' : 
              'USSD is the primary reporting channel'}
          </p>
        </div>

        {/* Malpractice Type Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Malpractice Type Distribution
          </h2>
          <div className="h-60">
            {Object.keys(analyticsData.issuesByCategory).length > 0 ? (
              <Bar data={categoryChartData} options={barChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-400">No data available</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Object.keys(analyticsData.issuesByCategory).length > 0 ? 
              `Top issue: ${Object.entries(analyticsData.issuesByCategory).sort((a, b) => b[1] - a[1])[0][0]}` : 
              'No malpractice types to display'}
          </p>
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reports Over Time ({dateFilter.label})
          </h2>
          <div className="h-60">
            {analyticsData.trendData.some(item => item.count > 0) ? (
              <Line data={trendChartData} options={lineChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-400">No data available</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analyticsData.trendData.filter(item => item.count > 0).length > 0 ? 
              `Peak reporting on ${analyticsData.trendData.reduce((max, item) => item.count > max.count ? item : max, {date: '', count: 0}).date}` : 
              'No reporting trends detected'}
          </p>
        </div>
      </div>

      {/* Top Locations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with yellow background and black text, rounded on top */}
        <div className="rounded-t-lg bg-[#ffde17]">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-lg font-semibold text-black">
              Top 5 Most Affected Locations
            </h2>
            <span className="text-sm text-black font-medium">
              {filteredIssues.length} issues total
            </span>
          </div>
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
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Number of Reports
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  % of Total
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
              {analyticsData.topLocations.length > 0 ? (
                analyticsData.topLocations.map((location, index) => (
                  <tr
                    key={location.location}
                    className="bg-white border-b border-[#E0E0E0] hover:bg-[#fefadd]"
                  >
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input
                          id={`checkbox-${location.location}`}
                          type="checkbox"
                          className="w-4 h-4 text-black bg-white border border-[#E0E0E0] rounded focus:ring-black focus:ring-1"
                        />
                        <label
                          htmlFor={`checkbox-${location.location}`}
                          className="sr-only"
                        >
                          Select location
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#333333] whitespace-nowrap">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 text-[#333333]">
                      {location.location}
                    </td>
                    <td className="px-6 py-4">
                      <span className="p-2 text-md w-full font-semibold rounded-sm bg-blue-100 text-blue-800">
                        {location.count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="p-2 text-md w-full font-semibold rounded-sm bg-purple-100 text-purple-800">
                        {analyticsData.totalIssues > 0 ? Math.round((location.count / analyticsData.totalIssues) * 100) : 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className={`cursor-pointer font-semibold border-[0.5px] border-gray-300 rounded-md px-4 py-2 transform active:scale-95 transition-transform duration-200 flex items-center justify-center gap-2
                          ${filteredLocation === location.location 
                            ? "bg-[#ffde17] text-black border-[#ffde17]" 
                            : "text-black hover:bg-gray-100 hover:border-gray-400"}`}
                        onClick={() => handleFilterByLocation(location.location)}
                      >
                        <FaFilter className="w-4 h-4" />
                        {filteredLocation === location.location ? "Filtered" : "Filter"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No location data to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Insights Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actionable Insights & Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Operational Efficiency</h3>
            <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
              {analyticsData.avgResolutionTime > 14 && (
                <li>Resolution time exceeds 14 days. Consider allocating more resources to investigation team.</li>
              )}
              {analyticsData.highSeverityIssues > 0 && (
                <li>{analyticsData.highSeverityIssues} high-severity issues need immediate attention.</li>
              )}
              {analyticsData.openIssues > 0 && (
                <li>{analyticsData.openIssues} open issues require follow-up.</li>
              )}
            </ul>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg">
            <h3 className="font-medium text-amber-800 mb-2">Risk Management</h3>
            <ul className="text-sm text-amber-700 list-disc pl-5 space-y-1">
              {analyticsData.topLocations.length > 0 && (
                <li>Focus resources on {analyticsData.topLocations[0].location} (highest incident location).</li>
              )}
              {Object.keys(analyticsData.issuesByCategory).length > 0 && (
                <li>Address {Object.entries(analyticsData.issuesByCategory).sort((a, b) => b[1] - a[1])[0][0]} as the most frequent malpractice type.</li>
              )}
              {analyticsData.financialImpact > 10000 && (
                <li>Financial impact exceeds $10K. Review insurance coverage and control measures.</li>
              )}
            </ul>
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

export default Analytics;