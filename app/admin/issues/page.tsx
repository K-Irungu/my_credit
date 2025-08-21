"use client";

import React, { useState, useEffect } from "react";
import { GoChevronDown } from "react-icons/go";
import { IoCloseOutline } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { LuClipboardList } from "react-icons/lu";
import IssueModal from "@/components/IssueModal";
import { fetchIssuesAndExportToExcel } from "../../../utils/fetchIssuesAndConvertToExcel";
import { HiOutlineDownload } from "react-icons/hi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Reporter {
  _id: string;
  REF: string; 
}

const Issues = () => {
  // Define the Issue interface for type safety
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
    reporter: Reporter;
    status: string;
    source: string;
    filename: string;
    createdAt: string;
    updatedAt: string;
    REF: string;
    __v: number;
  }

  // State variables for managing the data and UI
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredAndSortedIssues, setFilteredAndSortedIssues] = useState<
    Issue[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState("");

  const [issueIds, setIssueIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  // State variables for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Helper function to get the status text color
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Helper function to get nested property value from an object
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  const router = useRouter();
  const handleManage = (issueRef: string) => {
    router.push(`/admin/issue-management?ref=${issueRef}`);
  };
  // Sort function to handle column clicks
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // useEffect hook to filter and sort issues whenever dependencies change
  useEffect(() => {
    let result = [...issues];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (issue) =>
          issue.REF.toLowerCase().includes(searchLower) ||
          `${issue.implicatedPersonel.firstName} ${issue.implicatedPersonel.lastName}`
            .toLowerCase()
            .includes(searchLower) ||
          issue.malpractice.type.toLowerCase().includes(searchLower) ||
          issue.malpractice.location.toLowerCase().includes(searchLower) ||
          issue.status.toLowerCase().includes(searchLower) ||
          issue.malpractice.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterStatus) {
      result = result.filter(
        (issue) => issue.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        let aValue = getNestedValue(a, sortColumn);
        let bValue = getNestedValue(b, sortColumn);

        // Handle date sorting by converting to a number
        if (sortColumn === "createdAt") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else {
          // Convert to string for case-insensitive comparison
          aValue = String(aValue || "").toLowerCase();
          bValue = String(bValue || "").toLowerCase();
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredAndSortedIssues(result);
    // setCurrentPage(1); // Reset to first page when filters change

    // Check if the current page is still valid after filtering and sorting
    const newTotalPages = Math.ceil(result.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0) {
      setCurrentPage(1);
    }
  }, [issues, searchTerm, filterStatus, sortColumn, sortDirection]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Modified useEffect for SSE
  useEffect(() => {
    const eventSource = new EventSource("/api/admin/issues/stream");

    eventSource.onopen = () => {
      setLoading(false);
      console.log("SSE connection established.");
    };

    eventSource.onmessage = (event) => {
      try {
        const newIssuesList = JSON.parse(event.data);

        if (newIssuesList && Array.isArray(newIssuesList)) {
          // If this is the initial load, populate the issueIds set
          if (!initialLoadComplete) {
            const ids = new Set(newIssuesList.map((issue) => issue.REF));
            setIssueIds(ids);
            setInitialLoadComplete(true); // Mark initial load as complete
          } else {
            // After initial load, check for newly added issues
            // const latestIssue = newIssuesList[newIssuesList.length - 1];
            const latestIssue = newIssuesList[0];
            if (!issueIds.has(latestIssue.REF)) {
              toast.success(`A new issue has been submitted!`);
              // Add the new ID to the set to prevent repeat notifications
              setIssueIds((prev) => new Set(prev).add(latestIssue.REF));
            }
          }
          setIssues(newIssuesList);
        } else {
          setError("Failed to process data from server.");
        }
      } catch (e) {
        setError("Failed to process data from server.");
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setError("Connection to server lost. Please refresh.");
      setLoading(false);
    };

    // Clean up the event source
    return () => {
      eventSource.close();
    };
  }, [initialLoadComplete, issueIds]); // Add initialLoadComplete to the dependency array
  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIssues = filteredAndSortedIssues.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Handler to open the modal and set the selected issue
  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(currentPage - halfRange, 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  async function handleDownloadAll() {
    // Define the  output filename
    const OUTPUT_FILE = "all_issues.xlsx";

    // Call the helper function
    await fetchIssuesAndExportToExcel(OUTPUT_FILE);
  }

  if (loading) {
    return (
      <div className="flex flex-col p-6 space-y-4 bg-white border border-gray-200 rounded-lg h-[calc(100vh-100px)] overflow-y-auto">
        {/* Page Title Skeleton */}
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>

        {/* Controls Skeleton */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between shrink-0">
          <div className="h-10 w-full lg:w-64 bg-gray-200 rounded-lg animate-pulse mb-4 lg:mb-0"></div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="flex-1 overflow-y-auto relative overflow-x-auto sm:rounded-lg mt-3">
          <div className="bg-white rounded-lg animate-pulse">
            {/* Table Header Skeleton */}
            <div className="grid grid-cols-7 lg:grid-cols-8 gap-4 px-6 py-3 bg-gray-100 rounded-t-lg">
              <div className="h-5 bg-gray-300 rounded col-span-1"></div>
              <div className="h-5 bg-gray-300 rounded col-span-1"></div>
              <div className="h-5 bg-gray-300 rounded col-span-1"></div>
              <div className="h-5 bg-gray-300 rounded col-span-1"></div>
              <div className="h-5 bg-gray-300 rounded col-span-1 hidden lg:block"></div>
              <div className="h-5 bg-gray-300 rounded col-span-1 hidden lg:block"></div>
              <div className="h-5 bg-gray-300 rounded col-span-1"></div>
              <div className="h-5 bg-gray-300 rounded col-span-1"></div>
            </div>
            {/* Table Rows Skeleton */}
            <div className="space-y-4 p-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-7 lg:grid-cols-8 gap-4 items-center"
                >
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded hidden lg:block"></div>
                  <div className="h-5 bg-gray-200 rounded hidden lg:block"></div>
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Skeleton */}
        <nav className="flex items-center justify-between p-6 border-t border-[#E0E0E0] bg-gray-50 shrink-0">
          <div className="h-5 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </nav>
      </div>
    );
  }
  return (
    // Main container with fixed height using flexbox
    <div className="flex flex-col p-6 space-y-6 bg-white border border-gray-200 rounded-lg h-[calc(100vh-100px)] overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
      {/* Search, sort, filter controls */}
   <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-0 shrink-0">
  {/* Search Input */}
  <div className="relative w-full lg:w-auto">
    <input
      type="text"
      placeholder="Search issues..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10 pr-4 py-2.5 border border-[#E0E0E0] hover:border-gray-400 rounded-lg w-full focus:outline-none focus:ring-0.5 focus:ring-[#ffde17] focus:border-[#ffde17] transition-all duration-200 text-sm"
    />
    <svg
      className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      ></path>
    </svg>
  </div>

  {/* Controls */}
  <div className="flex flex-wrap items-center justify-between gap-2 w-full lg:w-auto lg:mt-0">
    <div className="relative flex flex-col sm:flex-row items-center w-full md:w-auto gap-2">
      <div className="relative w-full sm:w-auto">
        <select
          value={sortColumn}
          onChange={(e) => handleSort(e.target.value)}
          className="appearance-none bg-white border border-[#E0E0E0] text-gray-700 py-2.5 pl-4 pr-10 rounded-lg leading-tight focus:outline-none focus:ring-0.5 focus:ring-[#ffde17] focus:border-[#ffde17] hover:border-gray-400 cursor-pointer transition-all duration-200 text-sm min-w-[140px] w-full"
        >
          <option value="">Sort By</option>
          <option value="status">Status</option>
          <option value="implicatedPersonel.firstName">Personnel</option>
          <option value="malpractice.type">Type</option>
          <option value="createdAt">Date</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <GoChevronDown className="h-4 w-4" />
        </div>
      </div>

      <button
        onClick={() =>
          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        }
        className={`w-full sm:w-40 flex items-center justify-center cursor-pointer px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium gap-2
          ${
            sortColumn
              ? "bg-[#fff7d6] border-[#ffde17] text-[#713f12] hover:bg-[#ffe3a8] hover:border-[#ffde17] shadow-sm"
              : "bg-gray-50 border-[#E0E0E0] text-gray-400 cursor-not-allowed"
          }`}
        disabled={!sortColumn}
      >
        {sortDirection === "asc" ? "Ascending Order" : "Descending Order"}
      </button>
    </div>
    <div className="relative w-full sm:w-auto">
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="
            appearance-none bg-white border border-[#E0E0E0] text-gray-700
            py-2.5 pl-4 pr-10 rounded-lg leading-tight text-sm min-w-[120px] w-full
            focus:outline-none focus:ring-0.5 focus:ring-[#ffde17] focus:border-[#ffde17]
            hover:border-gray-400 cursor-pointer transition-all duration-200
          "
      >
        <option value="">Filter By</option>
        <option value="pending">Pending</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
        <GoChevronDown className="h-4 w-4" />
      </div>
    </div>

    <button
      onClick={() => {
        setSearchTerm("");
        setSortColumn("");
        setSortDirection("asc");
        setFilterStatus("");
      }}
      className={`w-full sm:w-auto cursor-pointer px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2
          ${
            searchTerm || sortColumn || filterStatus
              ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
              : "bg-gray-50 border-[#E0E0E0] text-gray-400 cursor-not-allowed"
          }`}
      disabled={!searchTerm && !sortColumn && !filterStatus}
    >
      <IoCloseOutline className="w-4 h-4" />
      Clear Filters
    </button>
    <button
      onClick={handleDownloadAll}
      disabled={isDownloading}
      className={`w-full sm:w-auto cursor-pointer px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2
          ${
            isDownloading
              ? "bg-gray-50 border-[#E0E0E0] text-gray-400 cursor-not-allowed"
              : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
          }`}
    >
      <HiOutlineDownload className="w-4 h-4" />
      {isDownloading ? "Downloading..." : "Download All Issues"}
    </button>
  </div>
</div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        <div className="lg:col-span-3 bg-white rounded-lg sm:shadow-xs sm:border sm:border-gray-200">
          {/* Title */}
          <div className="rounded-t-lg bg-[#ffde17] sm:bg-white">
            <h2 className="text-lg font-semibold text-gray-900 pl-6 py-4">
              All Issues
            </h2>
          </div>
          {/* Desktop Table */}
          <div className="overflow-x-auto rounded-t-lg hidden sm:flex">
            <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
              <thead className="text-xs uppercase bg-[#ffde17] text-black">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Implicated Personnel
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Type of Malpractice
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Date Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 font-semibold hidden md:table-cell"
                  >
                    Malpractice Location
                  </th>
                  <th scope="col" className="px-6 py-3  font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentIssues.map((issue) => (
                  <tr
                    key={issue.REF}
                    className="bg-white border-b border-[#E0E0E0] hover:bg-[#fefadd]"
                  >
                    <td className="px-6 py-4">
                      {issue.implicatedPersonel.firstName}{" "}
                      {issue.implicatedPersonel.lastName}
                    </td>

                    <td className="px-6 py-4 capitalize">
                      {issue.malpractice.type}
                    </td>

                    <td className="px-6 py-4">
                      {new Date(issue.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className={` font-semibold text-center`}>
                      <div
                        className={`${getStatusBadge(
                          issue.status
                        )} p-1 rounded-sm w-full`}
                      >
                        {issue.status}
                      </div>
                    </td>

                    <td className="px-6 py-4 capitalize hidden md:table-cell">
                      {issue.malpractice.location}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-5">
                        <button
                          type="button"
                          className="cursor-pointer text-black font-semibold border-[0.5px] border-gray-300 rounded-md px-4 py-2 transform active:scale-95 transition-transform duration-200 flex items-center gap-2 hover:bg-gray-100 hover:border-gray-400"
                          onClick={() => handleViewIssue(issue)}
                        >
                          <FaEye />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleManage(issue.REF)}
                          className="hidden lg:flex cursor-pointer bg-gray-900 text-[#ffde17] px-4 py-2 rounded-md font-semibold hover:bg-gray-900 transition-colors duration-200 transform active:scale-95  items-center gap-2 hover:text-[#ffea40] hover:shadow-lg"
                        >
                          <LuClipboardList />
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden text-sm">
            <>
              <div className="max-h-[540px] overflow-y-auto space-y-4 pr-1 scroll-smooth">
                {Array.isArray(currentIssues) &&
                  currentIssues.map((issue) => (
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
                            Implicated Personnel
                          </span>
                          <span className="text-xs text-right max-w-[50%] truncate capitalize">
                            {issue.implicatedPersonel.firstName}{" "}
                            {issue.implicatedPersonel.lastName}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500">
                            Malpractice
                          </span>
                          <span className="text-xs text-right max-w-[50%] truncate capitalize">
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
                      <div className="mt-4 flex gap-2 flex-col text-xs">
                        <button
                          type="button"
                          onClick={() => handleViewIssue(issue)}
                          className="w-full text-black font-semibold border border-gray-300 rounded-md py-2 px-4 uppercase hover:bg-gray-100 transition active:scale-95"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleManage(issue.REF)}
                          className="uppercase w-full cursor-pointer bg-gray-900 text-[#ffde17]  px-4 py-2 rounded-md font-semibold hover:bg-[#ffde17] transition-colors duration-200 transform active:scale-95 hover:text-gray-900 hover:shadow-lg"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          </div>

          {/* Pagination */}

          <nav
            className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-[#E0E0E0] bg-gray-50 shrink-0 "
            aria-label="Table navigation"
          >
            <span className="text-sm text-[#333333] mb-4 sm:mb-0">
              Showing{" "}
              <span className="font-semibold text-black">
                {startIndex + 1}-
                {Math.min(endIndex, filteredAndSortedIssues.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-black">
                {filteredAndSortedIssues.length}
              </span>
            </span>
            <ul className="inline-flex -space-x-px text-sm">
              <li>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`cursor-pointer flex items-center justify-center px-4 h-10 leading-tight rounded-l-lg transition-all duration-200 ${
                    currentPage === 1
                      ? "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                      : "text-[#333333] bg-white border border-[#E0E0E0] hover:bg-[#FFF9E0] hover:border-[#ffde17]"
                  }`}
                >
                  Previous
                </button>
              </li>
              {getPageNumbers().map((pageNum) => (
                <li key={pageNum}>
                  <button
                    onClick={() => handlePageClick(pageNum)}
                    className={`cursor-pointer flex items-center justify-center px-4 h-10 leading-tight border transition-all duration-200 ${
                      currentPage === pageNum
                        ? "text-black bg-[#ffde17] border-[#ffde17] hover:bg-[#e6c500] hover:border-[#e6c500] font-medium"
                        : "text-[#333333] bg-white border-[#E0E0E0] hover:bg-[#FFF9E0] hover:border-[#ffde17]"
                    }`}
                  >
                    {pageNum}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`cursor-pointer flex items-center justify-center px-4 h-10 leading-tight rounded-r-lg transition-all duration-200 ${
                    currentPage === totalPages
                      ? "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                      : "text-[#333333] bg-white border border-[#E0E0E0] hover:bg-[#FFF9E0] hover:border-[#ffde17]"
                  }`}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* The Issue Modal is rendered here, outside the main flow */}
        {/* It will only be visible when isModalOpen is true and a selectedIssue exists */}
        <IssueModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          issue={selectedIssue}
        />
      </div>
    </div>
  );
};

export default Issues;
