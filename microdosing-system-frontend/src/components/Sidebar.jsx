import React, { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaTachometerAlt,
  FaBox,
  FaClipboardList,
  FaShoppingCart,
  FaLayerGroup,
  FaUserShield
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/image copy.png"; // ✅ Importing logo

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeLink, setActiveLink] = useState("/");
  const location = useLocation();

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  return (
    <div className="relative flex h-screen bg-gray-100">
      <aside
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-[#D4D6D9] text-black h-full shadow-md transition-all duration-300 flex flex-col border-r`}
      >
        {/* ✅ Logo at the top with matching background */}
        <div className="p-4 flex justify-center items-center bg-[#D4D6D9]">
          <img
            src={Logo}
            alt="Hercules Logo"
            className={`transition-all duration-300 ${
              isOpen ? "h-16" : "h-10"
            }`}
          />
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-2 px-4 text-sm flex-1">
          {[
            { path: "/", icon: FaTachometerAlt, label: "Dashboard" },
            { path: "/material", icon: FaBox, label: "Materials" },
            { path: "/recipes", icon: FaClipboardList, label: "Formulas" },
            { path: "/orders", icon: FaShoppingCart, label: "Orders" },
            { path: "/activeorders", icon: FaShoppingCart, label: "Active Orders" },
            { path: "/batches", icon: FaLayerGroup, label: "Batches" },
            { path: "/Login", icon: FaUserShield, label: "Login" },
            { path: "/admin", icon: FaUserShield, label: "Administrator" },
            { path: "/storage", icon: FaUserShield, label: "Storage" }
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 py-2 font-medium px-2 rounded-md transition ${
                activeLink === item.path
                  ? "bg-gray-700 text-white"
                  : "hover:bg-gray-300 hover:text-black"
              }`}
              onClick={() => handleLinkClick(item.path)}
            >
              <item.icon />
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
