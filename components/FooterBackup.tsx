import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 ">
      <div className="max-w-7xl mx-auto px-5 space-y-2">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-700 pb-4">
          <h3 className="text-xl font-semibold text-white">
            MyCredit Whistleblower Portal
          </h3>
          <ul className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <li>
              <a
                href="/auth/login"
                className="hover:text-white transition-colors duration-200 text-sm"
              >
                Admin
              </a>
            </li>
          </ul>
        </div>

        {/* Middle Section - Disclaimer */}
        <p className="text-sm text-gray-400 leading-relaxed text-left">
          This portal is intended solely for the reporting of misconduct or
          unethical behavior related to MyCredit operations. All submissions
          are treated confidentially.
        </p>

        {/* Bottom Section */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>&copy; {new Date().getFullYear()} MyCredit. All rights reserved.</p>
          <a
            href="https://tierdata.co.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 text-sm  hover:text-white transition-colors duration-200"
          >
            Developed by: <strong className="text-white">TIERDATA®</strong>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
