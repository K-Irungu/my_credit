import React from "react";

const mainPage = () => {
  return (
    <div className="sm:h-[60vh] flex flex-col justify-center">
      {/* Introduction Section */}
      <section className="bg-white py-4 ">
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-xl sm:text-3xl font-semibold text-gray-900 py-8 text-left">
            Welcome to MyCredit’s Whistleblower Portal
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            This secure platform is designed for employees, partners, and
            members of the public to report suspected misconduct or unethical
            behavior within the organization.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            Your identity will remain confidential, and you may choose to submit
            your report anonymously. We encourage full disclosure to ensure
            thorough and effective investigations.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            To file a report, please provide:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700  mb-6 space-y-1">
            <li>Details of the implicated personel</li>
            <li>
              The nature and details of the malpractice, including any
              supporting evidence
            </li>
            <li>
              Your personal details, including an indication of whether or not
              you would want feedback on your submission
            </li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            Once submitted, our compliance team will review your report promptly
            and take the necessary actions to address and resolve the matter.
          </p>
          {/* Fill Form Button */}
          <div className="flex justify-end ">
            <a
              href="/form"
              className="cursor-pointer hover:bg-[#58595d] hover:text-[#ffde17] w-full sm:w-auto text-center sm:text-left inline-block bg-[#ffde17] text-gray-900 font-semibold text-sm px-6 py-3 rounded-md shadow-md  transition duration-300"
            >
              Fill Whistleblower Form
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default mainPage;
