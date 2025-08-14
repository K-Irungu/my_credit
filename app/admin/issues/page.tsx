"use client";

import React, { useState, useEffect } from "react";
import { GoChevronDown } from "react-icons/go";
import { IoCloseOutline } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { LuClipboardList } from "react-icons/lu";
import IssueModal from "@/components/IssueModal";

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
    reporter: string;
    status: string;
    source: string;
    filename: string;
    createdAt: string;
    updatedAt: string;
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
  // Helper function to get nested property value from an object
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
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
          issue._id.toLowerCase().includes(searchLower) ||
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [issues, searchTerm, filterStatus, sortColumn, sortDirection]);

  // useEffect hook for fetching data from the server using EventSource
  useEffect(() => {
    // const mockIssues: Issue[] = [
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10a",
    //     implicatedPersonel: {
    //       firstName: "John",
    //       lastName: "Doe",
    //       companyLocation: "Nairobi",
    //       rolePosition: "Manager",
    //       phoneNumber: "0712345678",
    //     },
    //     malpractice: {
    //       type: "Fraud",
    //       location: "Nairobi",
    //       description: "Financial fraud case.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report1.pdf",
    //     createdAt: "2024-03-14T10:00:00Z",
    //     updatedAt: "2024-03-14T10:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10b",
    //     implicatedPersonel: {
    //       firstName: "Jane",
    //       lastName: "Smith",
    //       companyLocation: "Mombasa",
    //       rolePosition: "Clerk",
    //       phoneNumber: "0723456789",
    //     },
    //     malpractice: {
    //       type: "Theft",
    //       location: "Mombasa",
    //       description: "Office supplies theft.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "resolved",
    //     source: "whistleblower",
    //     filename: "report2.pdf",
    //     createdAt: "2024-03-13T12:00:00Z",
    //     updatedAt: "2024-03-13T12:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10c",
    //     implicatedPersonel: {
    //       firstName: "Peter",
    //       lastName: "Jones",
    //       companyLocation: "Kisumu",
    //       rolePosition: "Supervisor",
    //       phoneNumber: "0734567890",
    //     },
    //     malpractice: {
    //       type: "Corruption",
    //       location: "Kisumu",
    //       description: "Bribery and corruption.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report3.pdf",
    //     createdAt: "2024-03-12T08:00:00Z",
    //     updatedAt: "2024-03-12T08:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10d",
    //     implicatedPersonel: {
    //       firstName: "Alice",
    //       lastName: "Williams",
    //       companyLocation: "Nairobi",
    //       rolePosition: "Analyst",
    //       phoneNumber: "0745678901",
    //     },
    //     malpractice: {
    //       type: "Misconduct",
    //       location: "Nairobi",
    //       description: "Workplace harassment.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "closed",
    //     source: "whistleblower",
    //     filename: "report4.pdf",
    //     createdAt: "2024-03-11T14:00:00Z",
    //     updatedAt: "2024-03-11T14:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10e",
    //     implicatedPersonel: {
    //       firstName: "Bob",
    //       lastName: "Brown",
    //       companyLocation: "Mombasa",
    //       rolePosition: "Driver",
    //       phoneNumber: "0756789012",
    //     },
    //     malpractice: {
    //       type: "Theft",
    //       location: "Mombasa",
    //       description: "Vehicle fuel theft.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "resolved",
    //     source: "whistleblower",
    //     filename: "report5.pdf",
    //     createdAt: "2024-03-10T09:00:00Z",
    //     updatedAt: "2024-03-10T09:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10f",
    //     implicatedPersonel: {
    //       firstName: "Charlie",
    //       lastName: "Davis",
    //       companyLocation: "Kisumu",
    //       rolePosition: "Guard",
    //       phoneNumber: "0767890123",
    //     },
    //     malpractice: {
    //       type: "Misconduct",
    //       location: "Kisumu",
    //       description: "Negligence on duty.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report6.pdf",
    //     createdAt: "2024-03-09T16:00:00Z",
    //     updatedAt: "2024-03-09T16:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b110",
    //     implicatedPersonel: {
    //       firstName: "Diana",
    //       lastName: "Evans",
    //       companyLocation: "Nairobi",
    //       rolePosition: "IT Technician",
    //       phoneNumber: "0778901234",
    //     },
    //     malpractice: {
    //       type: "Data Breach",
    //       location: "Nairobi",
    //       description: "Unauthorized data access.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report7.pdf",
    //     createdAt: "2024-03-08T11:00:00Z",
    //     updatedAt: "2024-03-08T11:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b111",
    //     implicatedPersonel: {
    //       firstName: "Frank",
    //       lastName: "Garcia",
    //       companyLocation: "Mombasa",
    //       rolePosition: "Engineer",
    //       phoneNumber: "0789012345",
    //     },
    //     malpractice: {
    //       type: "Fraud",
    //       location: "Mombasa",
    //       description: "Falsified project reports.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "resolved",
    //     source: "whistleblower",
    //     filename: "report8.pdf",
    //     createdAt: "2024-03-07T13:00:00Z",
    //     updatedAt: "2024-03-07T13:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b112",
    //     implicatedPersonel: {
    //       firstName: "Grace",
    //       lastName: "Harris",
    //       companyLocation: "Kisumu",
    //       rolePosition: "Sales Rep",
    //       phoneNumber: "0790123456",
    //     },
    //     malpractice: {
    //       type: "Theft",
    //       location: "Kisumu",
    //       description: "Misappropriation of company funds.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "closed",
    //     source: "whistleblower",
    //     filename: "report9.pdf",
    //     createdAt: "2024-03-06T15:00:00Z",
    //     updatedAt: "2024-03-06T15:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b113",
    //     implicatedPersonel: {
    //       firstName: "Henry",
    //       lastName: "Ismail",
    //       companyLocation: "Nairobi",
    //       rolePosition: "Accountant",
    //       phoneNumber: "0701234567",
    //     },
    //     malpractice: {
    //       type: "Fraud",
    //       location: "Nairobi",
    //       description: "Invoice manipulation.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report10.pdf",
    //     createdAt: "2024-03-05T17:00:00Z",
    //     updatedAt: "2024-03-05T17:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b114",
    //     implicatedPersonel: {
    //       firstName: "Irene",
    //       lastName: "Jackson",
    //       companyLocation: "Mombasa",
    //       rolePosition: "HR Manager",
    //       phoneNumber: "0712345678",
    //     },
    //     malpractice: {
    //       type: "Misconduct",
    //       location: "Mombasa",
    //       description: "Violation of company policy.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "resolved",
    //     source: "whistleblower",
    //     filename: "report11.pdf",
    //     createdAt: "2024-03-04T10:00:00Z",
    //     updatedAt: "2024-03-04T10:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b115",
    //     implicatedPersonel: {
    //       firstName: "Jack",
    //       lastName: "King",
    //       companyLocation: "Kisumu",
    //       rolePosition: "Engineer",
    //       phoneNumber: "0723456789",
    //     },
    //     malpractice: {
    //       type: "Theft",
    //       location: "Kisumu",
    //       description: "Equipment theft.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report12.pdf",
    //     createdAt: "2024-03-03T12:00:00Z",
    //     updatedAt: "2024-03-03T12:00:00Z",
    //     __v: 0,
    //   },
    // ];

    // setIssues(mockIssues);
    setLoading(false);

    // EventSource logic
    const eventSource = new EventSource("/api/admin/issues/stream");
    eventSource.onopen = () => {
      setLoading(false);
    };
    eventSource.onmessage = (event) => {
      try {
        const newIssues = JSON.parse(event.data);
        if (newIssues && Array.isArray(newIssues.issues)) {
          setIssues(newIssues.issues);
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
    return () => {
      eventSource.close();
    };
    return () => {};
  }, []);

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

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
        <svg
          className="animate-spin h-6 w-6 text-[#ffde17]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    // Main container with fixed height using flexbox
    <div className="flex flex-col h-[calc(100vh-100px)] shadow-sm rounded-lg">
      {/* Search, sort, filter controls */}
      <div className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#E0E0E0] shrink-0">
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-[#E0E0E0]  hover:border-gray-400 rounded-lg w-full focus:outline-none focus:ring-0.5 focus:ring-[#ffde17] focus:border-[#ffde17] transition-all duration-200 text-sm"
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
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <select
                value={sortColumn}
                onChange={(e) => handleSort(e.target.value)}
                className="appearance-none bg-white border border-[#E0E0E0] text-gray-700 py-2.5 pl-4 pr-10 rounded-lg leading-tight focus:outline-none focus:ring-0.5 focus:ring-[#ffde17] focus:border-[#ffde17] hover:border-gray-400 cursor-pointer transition-all duration-200 text-sm min-w-[140px]"
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
              className={`w-40 flex items-center justify-center cursor-pointer px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium gap-2
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
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="
      appearance-none bg-white border border-[#E0E0E0] text-gray-700
      py-2.5 pl-4 pr-10 rounded-lg leading-tight text-sm min-w-[120px]
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
            className={`cursor-pointer px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center gap-2
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
        </div>
      </div>

      {/* Scrollable content area with flex-1 to take up remaining vertical space */}
      <div className="flex-1 overflow-y-auto relative overflow-x-auto sm:rounded-lg mt-3">
        {/* Desktop Table */}
        <table className="min-w-full text-sm text-left text-[#333333] border-collapse hidden md:table">
          <thead className="text-xs uppercase bg-[#ffde17] text-black">
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
                Implicated Personnel
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">
                Type of Malpractice
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">
                Location
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">
                Date Submitted
              </th>
              <th scope="col" className="px-6 py-3  font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentIssues.map((issue) => (
              <tr
                key={issue._id}
                className="bg-white border-b border-[#E0E0E0] hover:bg-[#fefadd]"
              >
                <td className="w-4 p-4">
                  <div className="flex items-center">
                    <input
                      id={`checkbox-${issue._id}`}
                      type="checkbox"
                      className="w-4 h-4 text-black bg-white border border-[#E0E0E0] rounded focus:ring-black focus:ring-2"
                    />
                    <label
                      htmlFor={`checkbox-${issue._id}`}
                      className="sr-only"
                    >
                      Select issue
                    </label>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-[#333333]">
                  #{issue._id.slice(0, 8)}
                </td>
                <td className="px-6 py-4">
                  {issue.implicatedPersonel.firstName}{" "}
                  {issue.implicatedPersonel.lastName}
                </td>
                <td className="px-6 py-4">{issue.malpractice.type}</td>
                <td className="px-6 py-4">{issue.malpractice.location}</td>
                <td
                  className={` font-semibold flex items-center justify-center text-center`}
                >
                  <div
                    className={`${getStatusBadge(
                      issue.status
                    )} p-1 rounded-sm w-full`}
                  >
                    {issue.status}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {new Date(issue.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-2 px-4 flex items-center justify-start gap-5">
                  <button
                    type="button"
                    className="cursor-pointer text-black font-semibold border-[0.5px] border-gray-300 rounded-md px-4 py-2 transform active:scale-95 transition-transform duration-200 flex items-center gap-2
    hover:bg-gray-100 hover:border-gray-400"
                    onClick={() => handleViewIssue(issue)}
                  >
                    <FaEye />
                    View
                  </button>

                  <button
                    type="button"
                    className="cursor-pointer bg-gray-900 text-[#ffde17] px-4 py-2 rounded-md font-semibold hover:bg-gray-900 transition-colors duration-200 transform active:scale-95 flex items-center gap-2
    hover:text-[#ffea40] hover:shadow-lg"
                  >
                    <LuClipboardList />
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile View */}
        <div className="md:hidden space-y-3 p-6">
          {Array.isArray(currentIssues) &&
            currentIssues.map((issue) => (
              <div
                key={issue._id}
                className="bg-white border border-[#E0E0E0] rounded-lg p-5 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3 mb-3">
                  <h4 className="font-semibold text-sm text-[#333333]">
                    Issue ID: #{issue._id.slice(0, 8)}
                  </h4>
                  <div className="text-yellow-500 font-semibold text-sm">
                    {issue.status}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-[#333333]">
                  <p>
                    <strong className="text-gray-700">
                      Implicated Personnel:
                    </strong>{" "}
                    {issue.implicatedPersonel.firstName}{" "}
                    {issue.implicatedPersonel.lastName}
                  </p>
                  <p>
                    <strong className="text-gray-700">
                      Type of Malpractice:
                    </strong>{" "}
                    {issue.malpractice.type}
                  </p>
                  <p>
                    <strong className="text-gray-700">Location:</strong>{" "}
                    {issue.malpractice.location}
                  </p>
                  <p>
                    <strong className="text-gray-700">Date Submitted:</strong>{" "}
                    {new Date(issue.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="mt-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    className="text-black hover:underline font-medium text-sm transition-colors duration-200"
                    onClick={() => handleViewIssue(issue)}
                  >
                    View
                  </button>
                  <a
                    href="#"
                    className="bg-[#ffde17] text-black px-4 py-2 rounded-lg hover:bg-gray-900 hover:text-[#ffde17] transition-colors duration-200 text-sm font-medium"
                  >
                    Manage
                  </a>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Pagination controls */}
      <nav
        className="flex items-center justify-between p-6 border-t border-[#E0E0E0] bg-gray-50 shrink-0"
        aria-label="Table navigation"
      >
        <span className="text-sm text-[#333333]">
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

      {/* The Issue Modal is rendered here, outside the main flow */}
      {/* It will only be visible when isModalOpen is true and a selectedIssue exists */}
      <IssueModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        issue={selectedIssue}
      />
    </div>
  );
};

export default Issues;
