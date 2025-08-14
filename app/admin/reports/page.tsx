"use client";
import React, { useState, useEffect } from "react";


const Reports = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    // Connect to the new streaming API endpoint
    const eventSource = new EventSource("/api/admin/issues/stream");

    eventSource.onopen = () => {
      console.log("SSE connection opened.");
      setLoading(false);
    };

    eventSource.onmessage = (event) => {
      try {
        const newIssues = JSON.parse(event.data);
        // Assuming the server sends the full list of issues on each update
        setIssues(newIssues.issues);
      } catch (e) {
        console.error("Failed to parse event data:", e);
        setError("Failed to process data from server.");
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close(); // Close the connection on error
      setError("Connection to server lost. Please refresh.");
      setLoading(false);
    };

    // Cleanup function to close the connection when the component unmounts
    return () => {
      console.log("SSE connection closed.");
      eventSource.close();
    };
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading reports...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="shadow-sm rounded-lg ">
      <div className="relative overflow-x-auto sm:rounded-lg">
        {/* Table layout for medium screens and above */}
        <table className="min-w-full text-sm text-left text-[#333333] border-collapse hidden md:table">
          <thead className="text-xs uppercase bg-[#ffde17] text-black">
            <tr>
              <th scope="col" className="p-4 rounded-tl-lg">
                <div className="flex items-center">
                  <input
                    id="checkbox-all"
                    type="checkbox"
                    className="w-4 h-4 text-black bg-white border border-[#E0E0E0] rounded focus:ring-black focus:ring-2"
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
              <th scope="col" className="px-6 py-3 rounded-tr-lg font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
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
                <td className="px-6 py-4 font-semibold text-yellow-500">
                  {issue.status}
                </td>
                <td className="px-6 py-4 space-x-2 flex items-center justify-between">
                  <a
                    href="#"
                    className="text-black hover:underline font-medium"
                  >
                    View
                  </a>
                  <a
                    href="#"
                    className="bg-[#ffde17] text-black px-3 py-1 rounded hover:bg-gray-900 hover:text-[#ffde17] transition-colors duration-200"
                  >
                    Manage
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Card layout for mobile screens */}
        <div className="md:hidden space-y-4 p-4">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-white border border-[#E0E0E0] rounded-lg p-4"
            >
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <h4 className="font-semibold text-sm">
                  Issue ID: #{issue._id.slice(0, 8)}
                </h4>
                <div className="text-yellow-500 font-semibold">
                  {issue.status}
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Implicated Personnel:</strong>{" "}
                  {issue.implicatedPersonel.firstName}{" "}
                  {issue.implicatedPersonel.lastName}
                </p>
                <p>
                  <strong>Type of Malpractice:</strong> {issue.malpractice.type}
                </p>
                <p>
                  <strong>Location:</strong> {issue.malpractice.location}
                </p>
              </div>
              <div className="mt-4 flex space-x-2 justify-end">
                <a href="#" className="text-black hover:underline font-medium">
                  View
                </a>
                <a
                  href="#"
                  className="bg-[#ffde17] text-black px-3 py-1 rounded hover:bg-gray-900 hover:text-[#ffde17] transition-colors duration-200"
                >
                  Manage
                </a>
              </div>
            </div>
          ))}
        </div>
        <nav
          className="flex items-center justify-between p-4"
          aria-label="Table navigation"
        >
          <span className="text-sm text-[#333333]">
            Showing <span className="font-semibold">1-10</span> of{" "}
            <span className="font-semibold">100</span>
          </span>
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 leading-tight text-[#333333] bg-white border border-[#E0E0E0] rounded-l-lg hover:bg-[#FFF9E0]"
              >
                Previous
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 leading-tight text-[#333333] bg-white border border-[#E0E0E0] hover:bg-[#FFF9E0]"
              >
                1
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 leading-tight text-black bg-[#ffde17] border border-[#ffde17] hover:bg-[#e6c500] hover:border-[#e6c500] transition-colors duration-200"
              >
                2
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 leading-tight text-[#333333] bg-white border border-[#E0E0E0] rounded-r-lg hover:bg-[#FFF9E0]"
              >
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Reports;
