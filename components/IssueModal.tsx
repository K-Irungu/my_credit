import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import {
  FileText,
  User,
  Clipboard,
  Check,
  Download,
  Printer,
  Settings,
} from "lucide-react";
// Import dom-to-image and pdf-lib for direct use in the component
import domToImage from "dom-to-image";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// Import the XLSX library for Excel exports
import { RiSaveLine } from "react-icons/ri";
import * as XLSX from "xlsx";

import { useRouter } from "next/navigation";

// Define the Reporter interface for the populated reporter object
interface Reporter {
  _id: string;
  REF: string; // The unique reference number for the reporter
}

// Define the Issue interface for type safety, now with a populated reporter
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

// Define the props interface for the IssueModal component
interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
}

// A simple utility function to wrap text for PDF-Lib
const wrapText = (
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number
): string[] => {
  if (!text) return [""];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
    if (width < maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

const IssueModal: React.FC<IssueModalProps> = ({ isOpen, onClose, issue }) => {
  // isMounted controls the component's presence in the DOM
  const [isMounted, setIsMounted] = useState(false);
  // isAnimating controls the transition classes
  const [isAnimating, setIsAnimating] = useState(false);
  // isCopied state for the copy to clipboard button feedback
  const [isCopied, setIsCopied] = useState(false);
  // State for showing the export format dropdown
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  // State for loading status during file generation
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // useRef hook to create a reference to the modal content container
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isOpen) {
      // When modal opens, mount the component and start the fade-in animation
      setIsMounted(true);
      timeoutId = setTimeout(() => setIsAnimating(true), 10);
    } else {
      // When modal closes, start the fade-out animation and then unmount
      setIsAnimating(false);
      timeoutId = setTimeout(() => setIsMounted(false), 300); // Match CSS transition duration
    }

    // Cleanup function to clear the timeout
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  // useEffect hook to handle clicks outside the modal
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // If the modal ref exists and the click is outside the modal content, close the modal
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      // Add event listener when the modal is open
      document.addEventListener("mousedown", handleOutsideClick);
    }

    // Cleanup function to remove the event listener when the component unmounts or modal closes
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // If the component is not mounted, don't render anything
  if (!isMounted || !issue) {
    return null;
  }

  // Helper function to format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to handle copying the ID to the clipboard
  const copyToClipboard = () => {
    if (issue) {
      const el = document.createElement("textarea");
      el.value = issue.REF;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
    }
  };

  const handleManage = () => {
    router.push(`/admin/issue-management?ref=${issue.REF}`);
  };
  // Helper function to get the status badge styles
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

  // Function to handle exporting the issue data as a PDF or PNG
  const handleExport = async (format: "pdf" | "png") => {
    if (!issue) return;

    setIsLoading(true);
    setIsExportDropdownOpen(false);

    try {
      if (format === "png") {
        if (modalRef.current) {
          const pngDataUrl = await domToImage.toPng(modalRef.current);
          const link = document.createElement("a");
          link.href = pngDataUrl;
          link.download = `issue-report-${issue.REF.slice(0, 8)}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else if (format === "pdf") {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        let y = height - 50;
        const x = 50;
        const line_height = 20;

        // Title
        page.drawText(`Issue Report: ${issue.REF.slice(0, 8)}`, {
          x,
          y,
          size: 24,
          font,
          color: rgb(0, 0, 0),
        });
        y -= 40;

        // Status and Dates
        page.drawText(`Status: ${issue.status}`, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
        y -= line_height;
        page.drawText(`Date Submitted: ${formatDate(issue.createdAt)}`, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= line_height;
        page.drawText(`Last Updated: ${formatDate(issue.updatedAt)}`, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 40;

        // Malpractice Details
        page.drawText("Malpractice Details", {
          x,
          y,
          size: 18,
          font,
          color: rgb(0, 0, 0),
        });
        y -= line_height;
        page.drawText(`Type: ${issue.malpractice.type}`, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= line_height;
        page.drawText(`Location: ${issue.malpractice.location}`, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= line_height;
        page.drawText(`Is Ongoing: ${issue.malpractice.isOngoing}`, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 25;
        // Description, wrapping text if needed
        const descriptionLines = wrapText(
          issue.malpractice.description,
          font,
          12,
          width - 100
        );
        page.drawText("Description:", {
          x,
          y,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
        y -= line_height;
        descriptionLines.forEach((line) => {
          page.drawText(line, {
            x,
            y,
            size: 12,
            font,
            color: rgb(0.2, 0.2, 0.2),
          });
          y -= line_height;
        });
        y -= 40;

        // Implicated Personnel
        page.drawText("Implicated Personnel", {
          x,
          y,
          size: 18,
          font,
          color: rgb(0, 0, 0),
        });
        y -= line_height;
        page.drawText(
          `Name: ${issue.implicatedPersonel.firstName} ${issue.implicatedPersonel.lastName}`,
          { x, y, size: 12, font, color: rgb(0.2, 0.2, 0.2) }
        );
        y -= line_height;
        page.drawText(`Position: ${issue.implicatedPersonel.rolePosition}`, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= line_height;
        page.drawText(
          `Work Location: ${issue.implicatedPersonel.companyLocation}`,
          { x, y, size: 12, font, color: rgb(0.2, 0.2, 0.2) }
        );
        y -= line_height;
        page.drawText(`Phone Number: ${issue.implicatedPersonel.phoneNumber}`, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 40;

        // Reporter and Source
        page.drawText("Reporting Info", {
          x,
          y,
          size: 18,
          font,
          color: rgb(0, 0, 0),
        });
        y -= line_height;
        // page.drawText(`Reporter: ${issue.reporter}`, {
        //   x,
        //   y,
        //   size: 12,
        //   font,
        //   color: rgb(0.2, 0.2, 0.2),
        // });
        // y -= line_height;
        page.drawText(`Source: ${issue.source}`, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });

        const pdfBytes = await pdfDoc.save();
        //   const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        const buffer = new ArrayBuffer(pdfBytes.byteLength);
        const view = new Uint8Array(buffer);
        view.set(pdfBytes);
        const blob = new Blob([view], { type: "application/pdf" });

        const pdfUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `issue-report-${issue.REF.slice(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfUrl);
      }
    } catch (error) {
      console.error("Failed to generate file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (!issue) return;

    setIsLoading(true);
    setIsExportDropdownOpen(false);

    try {
      const data = [
        {
          "Issue REF": issue.REF,
          Status: issue.status,
          "Malpractice Type": issue.malpractice.type,
          "Malpractice Location": issue.malpractice.location,
          "Malpractice Description": issue.malpractice.description,
          "Is Ongoing": issue.malpractice.isOngoing,
          // Reporter: issue.reporter,
          Source: issue.source,
          "Implicated Personel Name": `${issue.implicatedPersonel.firstName} ${issue.implicatedPersonel.lastName}`,
          "Implicated Personel Role": issue.implicatedPersonel.rolePosition,
          "Implicated Personel Phone": issue.implicatedPersonel.phoneNumber,
          "Implicated Personel Location":
            issue.implicatedPersonel.companyLocation,
          "Date Submitted": formatDate(issue.createdAt),
          "Last Updated": formatDate(issue.updatedAt),
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Issue Report");
      XLSX.writeFile(workbook, `issue-report-${issue.REF.slice(0, 8)}.xlsx`);
    } catch (error) {
      console.error("Failed to generate Excel file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // The main modal container with transition for the backdrop
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-black/70 transition-opacity duration-300 ${
        isAnimating ? "bg-opacity-50" : "bg-opacity-0"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8">
        {/* Modal content with combined transform and opacity transitions */}
        <div
          ref={modalRef}
          className={`relative w-full max-w-4xl max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl transition-all duration-300 ease-in-out transform ${
            isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b rounded-t border-[#E0E0E0] bg-[#ffde17] text-black sticky top-0 z-10 ">
            <h3 className="text-xl font-medium flex items-center">
              Issue:{" "}
              <span className="ml-2 font-mono text-base md:text-lg">
                {issue.REF.slice(0, 8)}...
              </span>
              <button
                onClick={copyToClipboard}
                className="cursor-pointer flex items-center gap-1 ml-2 w-24 px-2 py-1 justify-center text-black bg-white/20 hover:bg-white/40 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffde17]"
                aria-label="Copy issue ID"
              >
                {isCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Clipboard className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold ">
                  {isCopied ? "Copied!" : "Copy ID"}
                </span>
              </button>
              <span className="ml-4 text-xl font-bold hidden md:block">
                - {issue.malpractice.type}
              </span>
            </h3>
            <button
              type="button"
              className="cursor-pointer text-black bg-transparent hover:bg-gray-900 hover:text-[#ffde17] rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
              onClick={onClose}
              aria-label="Close modal"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>



      {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex justify-between items-center sm:block">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 sm:text-base sm:font-bold sm:text-black sm:flex sm:items-center">
                Status
              </h4>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-semibold ${getStatusBadge(
                    issue.status
                  )}`}
                >
                  {issue.status}
                </span>
              </div>
              <div className="flex justify-between items-center sm:block">
                <span className="text-xs font-medium text-gray-500 sm:text-sm sm:font-bold sm:text-black">
                  Malpractice Type:
                </span>
                <span className="capitalize text-xs text-right max-w-[50%] sm:max-w-none truncate sm:text-sm text-gray-700 sm:text-[#333333]">
                  {issue.malpractice.type}
                </span>
              </div>
              <div className="flex justify-between items-center sm:block">
                <span className="text-xs font-medium text-gray-500 sm:text-sm sm:font-bold sm:text-black">Ongoing:</span>
                <span className="capitalize text-xs sm:text-sm text-gray-700 sm:text-[#333333]">
                  {issue.malpractice.isOngoing}
                </span>
              </div>
              <div className="flex justify-between items-center sm:block">
                <span className=" capitalize text-xs font-medium text-gray-500 sm:text-sm sm:font-bold sm:text-black">
                  Location:
                </span>
                <span className="text-xs text-right max-w-[50%] sm:max-w-none truncate sm:text-sm text-gray-700 sm:text-[#333333]">
                  {issue.malpractice.location}
                </span>
              </div>
              <div className="flex justify-between items-center sm:block">
                <span className="text-xs font-medium text-gray-500 sm:text-sm sm:font-bold sm:text-black">Source:</span>
                <span className="capitalize text-xs sm:text-sm text-gray-700 sm:text-[#333333]">
                  {issue.source}
                </span>
              </div>
            </div>
            
            <div className="border-t border-[#E0E0E0] pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 sm:text-base sm:font-bold sm:text-black sm:flex sm:items-center">
                Description
              </h4>
              <p className="text-xs leading-relaxed text-gray-700 sm:text-sm sm:text-[#333333]">
                {issue.malpractice.description}
              </p>
            </div>
            
            <div className="border-t border-[#E0E0E0] pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 sm:text-base sm:font-bold sm:text-black sm:flex sm:items-center">
                Implicated Personnel
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex justify-between items-center sm:block">
                  <span className="text-xs font-medium text-gray-500 sm:text-sm sm:font-bold sm:text-black">Name:</span>
                  <span className="capitalize text-xs text-right max-w-[50%] sm:max-w-none truncate sm:text-sm text-gray-700 sm:text-[#333333]">
                    {issue.implicatedPersonel.firstName} {issue.implicatedPersonel.lastName}
                  </span>
                </div>
                <div className="flex justify-between items-center sm:block">
                  <span className="text-xs font-medium text-gray-500 sm:text-sm sm:font-bold sm:text-black">Position:</span>
                  <span className="capitalize text-xs text-right max-w-[50%] sm:max-w-none truncate sm:text-sm text-gray-700 sm:text-[#333333]">
                    {issue.implicatedPersonel.rolePosition}
                  </span>
                </div>
                <div className="flex justify-between items-center sm:block">
                  <span className="text-xs font-medium text-gray-500 sm:text-sm sm:font-bold sm:text-black">Work Location:</span>
                  <span className="capitalize text-xs text-right max-w-[50%] sm:max-w-none truncate sm:text-sm text-gray-700 sm:text-[#333333]">
                    {issue.implicatedPersonel.companyLocation}
                  </span>
                </div>
                <div className="flex justify-between items-center sm:block">
                  <span className="text-xs font-medium text-gray-500 sm:text-sm sm:font-bold sm:text-black">Phone Number:</span>
                  <span className="text-xs sm:text-sm text-gray-700 sm:text-[#333333]">
                    {issue.implicatedPersonel.phoneNumber}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions section */}
            <div className="border-t border-[#E0E0E0] pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 sm:text-base sm:font-bold sm:text-black">
                Actions
              </h4>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {issue.filename && (
                  <a
                    href={`/uploads/${issue.filename}`}
                    download={issue.filename}
                    className="flex w-full sm:w-auto justify-center sm:justify-start items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 bg-white rounded-lg border border-[#E0E0E0] hover:bg-[#FFF9E0] hover:border-[#ffde17] transform active:scale-95 transition-all duration-200"
                    aria-label="Download attachment"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Attached File
                  </a>
                )}
                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                    disabled={isLoading}
                    className="flex w-full sm:w-auto cursor-pointer justify-center sm:justify-start items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 bg-white rounded-lg border border-[#E0E0E0] hover:bg-[#FFF9E0] hover:border-[#ffde17] transform active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Save report"
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <RiSaveLine className="w-4 h-4 mr-2" />
                    )}
                    Save This Issue
                  </button>
                  {isExportDropdownOpen && (
                    <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-full sm:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                          onClick={() => handleExport("pdf")}
                          className="block w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Save as PDF
                        </button>
                        <button
                          onClick={handleExportToExcel}
                          className="block w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Save as Excel
                        </button>
                        <button
                          onClick={() => handleExport("png")}
                          className="block w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Save as PNG
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t border-[#E0E0E0] pt-4">
              <div className="flex justify-between flex-col md:flex-row space-y-2 md:space-y-0">
                <div className="flex justify-between items-center sm:block">
                  <span className="text-xs font-medium text-gray-500 sm:text-xs sm:font-semibold sm:text-black">
                    Date Submitted:
                  </span>
                  <span className="text-xs text-gray-700 sm:text-xs sm:text-gray-500">
                    {formatDate(issue.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center sm:block">
                  <span className="text-xs font-medium text-gray-500 sm:text-xs sm:font-semibold sm:text-black">
                    Last Updated:
                  </span>
                  <span className="text-xs text-gray-700 sm:text-xs sm:text-gray-500">
                    {formatDate(issue.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center gap-3 p-3 sm:p-4 border-t border-[#E0E0E0] rounded-b sticky bottom-0 z-10 bg-white justify-between flex-col sm:flex-row">
            <button
              type="button"
              className="w-full sm:w-32 mb-2 sm:mb-0 py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-[#E0E0E0] hover:bg-[#FFF9E0] hover:border-[#ffde17] transform active:scale-95 transition-all duration-200"
              onClick={onClose}
            >
              Close
            </button>
            <button
              onClick={handleManage}
              className="w-full sm:w-32 py-2.5 px-5 text-sm font-medium text-[#ffde17] bg-gray-900 rounded-lg hover:bg-gray-800 focus:ring-0.5 focus:outline-none focus:ring-[#ffde17] transform active:scale-95 transition-all duration-200"
              aria-label="Open manage view"
            >
              Manage Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueModal;
