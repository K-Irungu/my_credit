import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FileText, User, Clipboard, Check, Download, Printer, Settings } from 'lucide-react';

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

// Define the props interface for the IssueModal component
interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
}

const IssueModal: React.FC<IssueModalProps> = ({ isOpen, onClose, issue }) => {
  // isMounted controls the component's presence in the DOM
  const [isMounted, setIsMounted] = useState(false);
  // isAnimating controls the transition classes
  const [isAnimating, setIsAnimating] = useState(false);
  // isCopied state for the copy to clipboard button feedback
  const [isCopied, setIsCopied] = useState(false);

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

  // If the component is not mounted, don't render anything
  if (!isMounted || !issue) {
    return null;
  }

  // Helper function to format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Helper function to handle copying the ID to the clipboard
  const copyToClipboard = () => {
    if (issue) {
      const el = document.createElement('textarea');
      el.value = issue._id;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
    }
  };

  // Helper function to get the status badge styles
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleManage = () => {
    console.log('Navigating to manage view for issue ID:', issue._id);
    // In a real application, you would use a router here to navigate
    // e.g., router.push(`/manage/${issue._id}`);
  };

  return (
    // The main modal container with transition for the backdrop
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-gray-900 transition-opacity duration-300 ${
        isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal content with combined transform and opacity transitions */}
        <div
          className={`relative w-full max-w-4xl max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl transition-all duration-300 ease-in-out transform ${
            isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b rounded-t border-[#E0E0E0] bg-[#ffde17] text-black sticky top-0 z-10">
            <h3 className="text-xl font-medium flex items-center">
              Issue:{' '}
              <span className="ml-2 font-mono text-base md:text-lg">
                {issue._id.slice(0, 8)}
              </span>
              <button
                onClick={copyToClipboard}
                className="ml-2 p-1 text-black hover:bg-black hover:text-[#ffde17] rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffde17]"
                aria-label="Copy issue ID"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
              </button>
              <span className="ml-4 text-xl font-bold">
                - {issue.malpractice.type}
              </span>
            </h3>
            <button
              type="button"
              className="text-black bg-transparent hover:bg-black hover:text-[#ffde17] rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
              onClick={onClose}
              aria-label="Close modal"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 text-sm md:text-base">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <p className="leading-relaxed text-[#333333]">
                <span className="font-bold text-black">Status:</span>{' '}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold ${getStatusBadge(issue.status)}`}
                >
                  {issue.status}
                </span>
              </p>
              <p className="leading-relaxed text-[#333333]">
                <span className="font-bold text-black">Type of Malpractice:</span>{' '}
                {issue.malpractice.type}
              </p>
              <p className="leading-relaxed text-[#333333]">
                <span className="font-bold text-black">Is Ongoing:</span>{' '}
                {issue.malpractice.isOngoing}
              </p>
              <p className="leading-relaxed text-[#333333]">
                <span className="font-bold text-black">Location:</span>{' '}
                {issue.malpractice.location}
              </p>
              <p className="leading-relaxed text-[#333333]">
                <span className="font-bold text-black">Reporter:</span>{' '}
                {issue.reporter}
              </p>
              <p className="leading-relaxed text-[#333333]">
                <span className="font-bold text-black">Source:</span>{' '}
                {issue.source}
              </p>
            </div>
            
            <div className="border-t border-[#E0E0E0] pt-4">
              <h4 className="text-md font-bold text-black mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Description
              </h4>
              <p className="leading-relaxed text-[#333333]">{issue.malpractice.description}</p>
            </div>

            <div className="border-t border-[#E0E0E0] pt-4">
              <h4 className="text-md font-bold text-black mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Implicated Personnel
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="leading-relaxed text-[#333333]">
                  <span className="font-bold text-black">Name:</span>{' '}
                  {issue.implicatedPersonel.firstName}{' '}
                  {issue.implicatedPersonel.lastName}
                </p>
                <p className="leading-relaxed text-[#333333]">
                  <span className="font-bold text-black">Position:</span>{' '}
                  {issue.implicatedPersonel.rolePosition}
                </p>
                <p className="leading-relaxed text-[#333333]">
                  <span className="font-bold text-black">Location:</span>{' '}
                  {issue.implicatedPersonel.companyLocation}
                </p>
                <p className="leading-relaxed text-[#333333]">
                  <span className="font-bold text-black">Phone Number:</span>{' '}
                  {issue.implicatedPersonel.phoneNumber}
                </p>
              </div>
            </div>

            {/* Attachments and actions */}
            <div className="border-t border-[#E0E0E0] pt-4">
              <h4 className="text-md font-bold text-black mb-2">Actions</h4>
              <div className="flex flex-wrap items-center gap-4">
                {issue.filename && (
                  <a
                    href={`#`}
                    download={issue.filename}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-[#E0E0E0] hover:bg-[#FFF9E0] hover:border-[#ffde17] transform active:scale-95 transition-all duration-200"
                    aria-label="Download attachment"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Attachment
                  </a>
                )}
                <button
                  onClick={handlePrint}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-[#E0E0E0] hover:bg-[#FFF9E0] hover:border-[#ffde17] transform active:scale-95 transition-all duration-200"
                  aria-label="Print report"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Report
                </button>
                <button
                  onClick={handleManage}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-[#E0E0E0] hover:bg-[#FFF9E0] hover:border-[#ffde17] transform active:scale-95 transition-all duration-200"
                  aria-label="Open manage view"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Open Manage
                </button>
              </div>
            </div>

            <div className="border-t border-[#E0E0E0] pt-4 text-xs text-gray-500">
              <div className="flex justify-between flex-col md:flex-row space-y-2 md:space-y-0">
                <p>
                  <span className="font-semibold text-black">Date Submitted:</span>{' '}
                  {formatDate(issue.createdAt)}
                </p>
                <p>
                  <span className="font-semibold text-black">Last Updated:</span>{' '}
                  {formatDate(issue.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center p-4 border-t border-[#E0E0E0] rounded-b sticky bottom-0 z-10 bg-white">
            <button
              type="button"
              className="text-[#ffde17] bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-[#ffde17] font-medium rounded-lg text-sm px-5 py-2.5 text-center transform active:scale-95 transition-all duration-200"
              onClick={() => {
                // Implement your "Mark as Resolved" logic here
                onClose();
              }}
            >
              Mark as Resolved
            </button>
            <button
              type="button"
              className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-[#E0E0E0] hover:bg-[#FFF9E0] hover:border-[#ffde17] focus:z-10 focus:ring-4 focus:ring-[#ffde17] transform active:scale-95 transition-all duration-200"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueModal;
