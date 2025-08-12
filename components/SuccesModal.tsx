// SuccessModal.tsx

import React from 'react';

// 1. Define an interface for the component's props for type safety.
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 2. Type the component as a React Functional Component (React.FC).
const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="success-modal"
      tabIndex={-1} // tabIndex is a number in JSX
      className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="p-4 md:p-5 text-center">
            <svg
              className="mx-auto mb-4 text-green-500 w-12 h-12"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                // 3. Use camelCase for SVG attributes in JSX
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Submission Successful!
            </h3>
            <p className="mb-6 text-gray-500">
              Thank you for your report. We have received it and will begin our
              review.
            </p>
            <button
              onClick={onClose}
              type="button"
              className="text-white bg-[#ffde17] hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm inline-flex items-center px-8 py-2.5 text-center text-gray-900"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;