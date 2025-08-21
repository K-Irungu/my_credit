"use client";
import React, { useState, useEffect, KeyboardEvent } from "react";
import {
  FaTimes,
  FaPlus,
  FaCheck,
  FaFileAlt,
  FaCommentAlt,
  FaHistory,
  FaSearch,
  FaExclamationTriangle,
  FaBan
} from "react-icons/fa";


import { FiRefreshCcw } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";


import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import issue from "@/models/issue";
import Image from "next/image";
import { set } from "mongoose";

// Type definitions for issue and personnel
type ImplicatedPersonnel = {
  firstName: string;
  lastName: string;
  companyLocation: string;
  rolePosition: string;
  phoneNumber: string;
};

type Malpractice = {
  type: string;
  location: string;
  description: string;
  isOngoing: string;
};

type Issue = {
  _id: string;
  implicatedPersonel: ImplicatedPersonnel;
  malpractice: Malpractice;
  reporter: string;
  status: string;
  source: string;
  filename: string;
  REF: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ActiveTab = "details" | "communications" | "attachments";

// Define the ordered steps and their corresponding status values
const statusSteps = [
  { key: "pending", label: "Submitted", icon: <FaCheck className="w-5 h-5" /> },
  {
    key: "investigating",
    label: "Investigating",
    icon: <FaSearch className="w-5 h-5" />,
  },
  {
    key: "responded",
    label: "Responded",
    icon: <FaCommentAlt className="w-5 h-5" />,
  },
  { key: "resolved", label: "Resolved", icon: <FaCheck className="w-6 h-6" /> },
];
// Helper to get the current step index
const getCurrentStepIndex = (status: string) => {
  const idx = statusSteps.findIndex(
    (step) => step.key.toLowerCase() === status.toLowerCase()
  );
  return idx === -1 ? 0 : idx;
};

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "resolved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "investigating":
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "dismissed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const IssueManagement: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [issueRef, setIssueRef] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");

  const [statusUpdate, setStatusUpdate] = useState<string>("");

  const [reporterEmails, setReporterEmails] = useState<any>(null); // Replace 'any' with your Reporter type

  useEffect(() => {
    const fetchReporter = async () => {
      if (!currentIssue?.reporter) return;

      try {
        const response = await fetch(
          `/api/reporter/getReporterEmails/${currentIssue.reporter}`
        );
        const emails = await response.json();

        setReporterEmails(emails);

        if (!emails) {
          setReporterEmails(null);
        }
      } catch (error) {
        console.error("Failed to fetch reporter:", error);
        setReporterEmails(null);
      }
    };

    fetchReporter();
  }, [currentIssue?.reporter]); // Only re-run when currentIssue.reporter changes

  // Check for ref parameter on component mount
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      setIssueRef(refParam);
      // Auto-search if ref is found in URL
      handleSearchIssueWithRef(refParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (currentIssue) {
      setStatusUpdate(currentIssue.status);
    }
  }, [currentIssue]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusUpdate(e.target.value);
  };

  // This function will be used for the Update Case Information button
  const handleUpdateCaseInformation = async () => {
    if (!currentIssue) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/issues/${currentIssue.REF}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusUpdate }),
      });
      const result = await response.json();
      if (result.status === "success") {
        setTimeout(
          () => toast.success(result.message || "Update successful"),
          500
        );
        setCurrentIssue(result.data);
        setTimeout(() => setIsLoading(false), 4500);
      } else {
        setTimeout(() => toast.error(result.message || "Update failed"), 500);
        setTimeout(() => setIsLoading(false), 4500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update issue.");
    }
  };

  const handleSearchIssueWithRef = async (ref: string) => {
    if (!ref.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/issues/${ref}`);
      if (!response.ok) {
        throw new Error("Issue not found. Please check the REF and try again.");
      }
      const issueData = await response.json();

      setCurrentIssue(issueData.data);
    } catch (err) {
      setError("Error fetching issue");
      setCurrentIssue(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchIssue = async () => {
    if (!issueRef.trim()) return;

    await handleSearchIssueWithRef(issueRef);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchIssue();
    }
  };

  const clearSearch = () => {
    setIssueRef("");
    setCurrentIssue(null);
    setError("");
    // Clear the URL parameter when clearing search
    const url = new URL(window.location.href);
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url.toString());
  };

  const handleSendNotification = async () => {
    if (!currentIssue) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/issues/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // reporter: currentIssue.reporter,
          issueRef: currentIssue.REF,
          status: currentIssue.status,
        }),
      });
      const result = await response.json();
      if (result.status === "success") {
        setTimeout(
          () =>
            toast.success(result.message || "Notification sent successfully"),
          500
        );
        setTimeout(() => setIsLoading(false), 4500);
      } else {
        setTimeout(
          () => toast.error(result.message || "Notification sending failed"),
          500
        );
        setTimeout(() => setIsLoading(false), 4500);
      }
    } catch (err: any) {
      console.error("Error sending notification:", err.message);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] overflow-y-auto">
      {isLoading && (
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
      )}
      <div className="mx-auto ">
        {/* SEARCH SECTION */}
        <div className="bg-white  border-b border-gray-200 rounded-lg mb-4">
          <div className="p-6 rounded-lg border-gray-200 border-[0.5px]">
            <div className="mb-4 ">
              <h1 className="text-2xl font-bold text-gray-900">
                Issue Management
              </h1>
              <p className="text-gray-600 mt-1">
                Search and manage specific issues by their reference number
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
              <div className="flex-1 max-w-2xl">
                <label
                  htmlFor="issue-ref"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Issue Reference Number
                </label>
                <div className="relative">
                  <input
                    id="issue-ref"
                    type="text"
                    placeholder="Enter Issue REF (e.g., 90d9ae0f-28d3-431f-a060-4720266f4e92)"
                    value={issueRef}
                    onChange={(e) => setIssueRef(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-4 py-3 border border-[#E0E0E0] hover:border-gray-400 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#ffde17] focus:border-[#ffde17] transition-all duration-200 text-sm"
                  />
                  <FaSearch className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSearchIssue}
                  disabled={!issueRef.trim() || loading}
                  className={`px-6 py-3 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                    !issueRef.trim() || loading
                      ? "bg-gray-50 border-[#E0E0E0] text-gray-400 cursor-not-allowed"
                      : "bg-[#ffde17] border-[#ffde17] text-black hover:bg-[#e6c500] hover:border-[#e6c500] shadow-sm cursor-pointer"
                  }`}
                >
                  <FaSearch className="w-4 h-4" />
                  {loading ? "Searching..." : "Search Issue"}
                </button>

                {(currentIssue || error) && (
                  <button
                    onClick={clearSearch}
                    className="px-4 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CASE MANAGEMENT SECTION */}
        <div className=" border-gray-200 ">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffde17] mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for issue...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
              <div className="text-center">
                <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Issue Not Found
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors duration-200 cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : currentIssue ? (
            <>
              {/* Header with Issue Info */}
              <div className="bg-[#ffde17] text-black rounded-t-lg p-6 mb-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold flex flex-col sm:flex-row sm:items-center gap-2">
                      Issue REF:
                      <span className="font-mono font-medium text-lg break-all">
                        #{currentIssue.REF}
                      </span>
                    </h2>
                    <h3 className="text-lg font-semibold flex flex-col sm:flex-row sm:items-center gap-2">
                      Malpractice Type:
                      <span className="font-normal">
                        {currentIssue.malpractice.type}
                      </span>
                    </h3>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg font-semibold ${getStatusBadge(
                      currentIssue.status
                    )}`}
                  >
                    {currentIssue.status}
                  </div>
                </div>
              </div>

              {/* Status Tracker */}
              <div className="bg-white border-x border-gray-200 px-6 py-8">
                <ol className="flex items-center w-full justify-between text-sm font-medium text-center text-gray-500 sm:text-base">
                  {statusSteps.map((step, idx) => {
                    const currentIdx = getCurrentStepIndex(currentIssue.status);
                    const isActive = idx <= currentIdx;
                    return (
                      <React.Fragment key={step.key}>
                        <li
                          className={`flex flex-col items-center flex-1 transition-colors duration-300 ${
                            isActive ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-300 ${
                              isActive
                                ? "bg-[#ffde17] text-gray-900 shadow-md"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {step.icon}
                          </div>
                          <span className="mt-3 font-semibold">
                            {step.label}
                          </span>
                        </li>
                        {idx < statusSteps.length - 1 && (
                          <div
                            className={`flex-grow h-1 mx-4 transition-all duration-300 ${
                              idx < currentIdx ? "bg-[#ffde17]" : "bg-gray-200"
                            }`}
                          ></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </ol>
              </div>

              {/* Main Content */}
              <div className=" rounded-b-lg shadow-sm border border-gray-200 p-6 bg-white">
                {/* Tabs */}

                <ul className="hidden sm:flex text-sm font-medium text-center text-gray-500 border-b border-gray-200 mb-6">
                  <li className="mr-2">
                    <button
                      type="button"
                      className={`cursor-pointer inline-block py-3 px-4 rounded-t-lg ${
                        activeTab === "details"
                          ? "font-semibold text-[#ffde17] bg-gray-900 border-b-2 border-[#ffde17]"
                          : "hover:text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveTab("details")}
                    >
                      Issue Details
                    </button>
                  </li>
                  <li className="mr-2">
                    <button
                      type="button"
                      className={`cursor-pointer inline-block py-3 px-4 rounded-t-lg ${
                        activeTab === "communications"
                          ? "font-semibold text-[#ffde17] bg-gray-900 border-b-2 border-[#ffde17]"
                          : "hover:text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveTab("communications")}
                    >
                      Communications
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={`cursor-pointer inline-block py-3 px-4 rounded-t-lg ${
                        activeTab === "attachments"
                          ? "font-semibold text-[#ffde17] bg-gray-900 border-b-2 border-[#ffde17]"
                          : "hover:text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveTab("attachments")}
                    >
                      Attachments
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className=" rounded-b-lg">
                  {/* Issue Details Tab */}
                  {activeTab === "details" && (
                    <div className="lg:col-span-3 space-y-6">
                      {/* Case Information */}
                      <div className="space-y-6">
                        {/* Issue Overview Card */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                            Issue Overview
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Basic Information Section */}
                            <div className="space-y-4 text-sm">
                              <h4 className="font-semibold text-gray-800 uppercase tracking-wider text-sm mb-4 border-b-2 border-gray-300 pb-2">
                                Basic Information
                              </h4>
                              <div>
                                <div className="flex justify-between items-center py-2">
                                  <span className="font-medium text-gray-600">
                                    Type:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {currentIssue.malpractice.type}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                  <span className="font-medium text-gray-600">
                                    Location:
                                  </span>
                                  <span className="text-gray-900">
                                    {currentIssue.malpractice.location}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                  <span className="font-medium text-gray-600">
                                    Source:
                                  </span>
                                  <span className="text-gray-900 capitalize bg-gray-200 px-2 py-1 rounded text-xs">
                                    {currentIssue.source}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                  <span className="font-medium text-gray-600">
                                    Ongoing:
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                      currentIssue.malpractice.isOngoing ===
                                      "Yes"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {currentIssue.malpractice.isOngoing}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Timeline Section */}
                            <div className="space-y-4 text-sm">
                              <h4 className="font-semibold text-gray-800 uppercase tracking-wider text-sm mb-4 border-b-2 border-gray-300 pb-2">
                                Timeline
                              </h4>
                              <div className="">
                                <div className="flex justify-between items-center py-2">
                                  <span className="font-medium text-gray-600">
                                    Submitted:
                                  </span>
                                  <span className="text-gray-900">
                                    {new Date(
                                      currentIssue.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                  <span className="font-medium text-gray-600">
                                    Last Updated:
                                  </span>
                                  <span className="text-gray-900">
                                    {new Date(
                                      currentIssue.updatedAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                  <span className="font-medium text-gray-600">
                                    Days Open:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {Math.ceil(
                                      (new Date().getTime() -
                                        new Date(
                                          currentIssue.createdAt
                                        ).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )}{" "}
                                    days
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Reference Section */}
                            <div className="space-y-4 text-sm">
                              <h4 className="font-semibold text-gray-800 uppercase tracking-wider text-sm mb-4 border-b-2 border-gray-300 pb-2">
                                Reference
                              </h4>
                              <div className="">
                                <div className="py-1">
                                  <span className="font-medium text-gray-600 block mb-1">
                                    REF Number:
                                  </span>
                                  <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono break-all">
                                    {currentIssue.REF}
                                  </code>
                                </div>
                              </div>
                            </div>

                            {/* Case Description Section */}
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                              <h4 className="font-semibold text-gray-800 uppercase tracking-wider text-sm mb-4 border-b-2 border-gray-300 pb-2">
                                Case Description
                              </h4>
                              <div className="">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {currentIssue.malpractice.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Implicated Personnel Details */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 ">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                            Implicated Personnel
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                              <span className="font-medium text-gray-600 text-sm">
                                Full Name
                              </span>
                              <p className="text-gray-900 font-semibold text-lg">
                                {currentIssue.implicatedPersonel.firstName}{" "}
                                {currentIssue.implicatedPersonel.lastName}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <span className="font-medium text-gray-600 text-sm">
                                Position
                              </span>
                              <p className="text-gray-900 font-medium">
                                {currentIssue.implicatedPersonel.rolePosition}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <span className="font-medium text-gray-600 text-sm">
                                Location
                              </span>
                              <p className="text-gray-900">
                                {
                                  currentIssue.implicatedPersonel
                                    .companyLocation
                                }
                              </p>
                            </div>
                            <div className="space-y-2">
                              <span className="font-medium text-gray-600 text-sm">
                                Contact
                              </span>
                              <p className="text-gray-900 font-mono text-sm">
                                {currentIssue.implicatedPersonel.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Management Actions */}
                        <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg ">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                            Issue Management Actions
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="">
                              <label
                                htmlFor="status"
                                className="text-sm font-semibold text-gray-900 block mb-2"
                              >
                                Update Status
                              </label>
                              <select
                                id="status"
                                className="cursor-pointer w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-[0.5px] focus:ring-[#ffde17] focus:border-[#ffde17] bg-gray-50 transition duration-200"
                                value={statusUpdate}
                                onChange={handleStatusChange}
                              >
                                <option value="submitted">Submitted</option>
                                <option value="investigating">
                                  Investigating
                                </option>
                                <option value="responded">Responded</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <button
                              type="button"
                              className={`cursor-pointer flex-1 w-full font-bold py-3 rounded-md transition duration-300 ease-in-out transform-gpu flex items-center justify-center gap-2 ${
                                statusUpdate === currentIssue.status
                                  ? "bg-[#3C3C3C] text-[#FAD41A] cursor-not-allowed"
                                  : "bg-[#FAD41A] text-[#3C3C3C] hover:text-[#FAD41A] hover:bg-[#3C3C3C] active:scale-95"
                              }`}
                              onClick={handleUpdateCaseInformation}
                              disabled={statusUpdate === currentIssue.status}
                            >
                              {statusUpdate === currentIssue.status ? (
                                <>
                                <FaBan className="w-4 h-4" />
                                No Changes</>
                              ) : (
                                <>
                                    <FiRefreshCcw className="w-4 h-4" />
                                  <span>Update Issue Information</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              className="cursor-pointer flex-1 px-6 py-3 bg-gray-600 text-white rounded-md font-semibold hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                              onClick={handleSendNotification}
                            >

                                    <FaCommentAlt className="w-4 h-4" />

                              
                              Notify Reporter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Communications Tab */}
                  {activeTab === "communications" && (
                    <div className="lg:col-span-3 space-y-6">
                      <div className="">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            Communications History
                          </h3>
                          <button
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#ffde17] text-gray-900 rounded-md hover:bg-[#e6c500] transition-colors text-sm font-medium"
                            onClick={handleSendNotification}
                          >
                            <FaPlus className="w-3 h-3" />
                            New Message
                          </button>
                        </div>

                        {reporterEmails && reporterEmails.length > 0 ? (
                          <div className="space-y-4">
                            {reporterEmails.map((email) => {
                              // Safely get message content
                              const messageContent =
                                email.text?.trim() ||
                                email.html?.trim() ||
                                "No message content available";
                              const isHtml =
                                !email.text?.trim() && email.html?.trim();

                              return (
                                <div
                                  key={email._id || email.messageId}
                                  className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-semibold text-gray-900 text-lg">
                                      {email.subject || "No Subject"}
                                    </h4>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {email.createdAt
                                        ? new Date(
                                            email.createdAt
                                          ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "Date not available"}
                                    </span>
                                  </div>

                                  <div
                                    className={`prose prose-sm max-w-none text-gray-700 ${
                                      isHtml ? "" : "whitespace-pre-line"
                                    }`}
                                  >
                                    {isHtml ? (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: messageContent,
                                        }}
                                      />
                                    ) : (
                                      messageContent
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-white rounded border border-gray-200">
                            <FaCommentAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-500 mb-2">
                              {reporterEmails === null
                                ? "Loading communications..."
                                : "No Communications Found"}
                            </h4>
                            <p className="text-gray-400 mb-4 max-w-md mx-auto">
                              {reporterEmails === null
                                ? "Please wait while we load the communication history"
                                : "No messages have been sent regarding this case yet."}
                            </p>
                            {reporterEmails !== null && (
                              <button
                                className="cursor-pointer px-6 py-2 bg-[#ffde17] text-gray-900 rounded-md hover:bg-[#e6c500] transition-colors font-medium flex items-center gap-2 mx-auto"
                                onClick={handleSendNotification}
                              >
                                <FaPlus className="w-3 h-3" />
                                Send First Message
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachments Tab */}
                  {activeTab === "attachments" && (
                    <div className="lg:col-span-3 space-y-6">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                        Attachments
                      </h3>
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
                        {currentIssue.filename ? (
                          <div className="flex flex-col items-center">
                            <div className="relative w-full max-w-md h-64 border border-gray-200 rounded-lg overflow-hidden">
                              <Image
                                src={`/uploads/${currentIssue.filename}`}
                                alt="Issue attachment"
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                            <p className="mt-4 text-sm text-gray-500">
                              {currentIssue.filename}
                            </p>
                            <a
                              href={`/uploads/${currentIssue.filename}`}
                              download
                              className="mt-4 px-4 py-2 bg-[#ffde17] text-black rounded-md hover:bg-[#e6c500] transition-colors inline-flex items-center gap-2"
                            >
                              <FaFileAlt />
                              Download Attachment
                            </a>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-gray-500">No attachments</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <FaSearch className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No Issue Selected
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Enter an issue reference number in the search field above to
                  view and manage issue.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueManagement;
