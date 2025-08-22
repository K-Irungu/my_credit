"use client";
import { useState } from "react";
import React from "react";
import { CiMenuBurger } from "react-icons/ci";

import { IoClose } from "react-icons/io5";

const Header = () => {
  // ====== State to control mobile menu visibility ======
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // ====== Navigation Menu Items ======
  const menuItems = [
    { name: "Home", href: "/", current: true },
    { name: "Fill Whistleblower Form", href: "/form", current: false },
  ];

  return (
    // ====== Navigation Bar Container ======
    <nav className="bg-[#fefadd]">
      <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-2 ">
        <a href="/" className="flex items-center ">
          <img
            src="/images/MyCredit-Logo.webp"
            className="h-13"
            alt="MyCredit Logo"
          />
        </a>

        {/* ====== Mobile Menu Toggle Button ====== */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          type="button"
          className="inline-flex items-center p-3 justify-center text-sm hover:border-[0.5px] hover:scale-105 transition duration-200 rounded-lg md:hidden cursor-pointer"
        >
          <span className="sr-only">
            {isMenuOpen ? "Close main menu" : "Open main menu"}
          </span>
          {isMenuOpen ? <IoClose size={28} /> : <CiMenuBurger size={28} />}
        </button>

        {/* ====== Navigation Links ====== */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } w-full md:block md:w-auto`}
          id="navbar-default"
        >
          <ul
            className="font-medium flex flex-col p-4 md:p-0 mt-4 border-t-[0.5px] 
            md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 
            "
          >
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  onClick={() => setActiveIndex(index)}
                  className={`relative block py-2 px-3 rounded-sm md:p-0 text-[#58595d] 
              transition-colors transition-transform duration-200 transform
              after:content-[''] after:absolute after:left-0 after:bottom-0 
              after:h-[1px] after:w-0 after:bg-[#58595d] after:transition-all 
              after:duration-300 hover:after:w-full hover:scale-105 text-sm`}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
