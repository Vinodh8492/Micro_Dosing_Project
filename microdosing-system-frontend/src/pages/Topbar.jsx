import React from "react";
import companyLogo from "../assets/Asm_Logo.png";

const Topbar = () => {
  return (
    <div className="w-full h-16 bg-[#D4D6D9] flex items-center justify-between px-4 shadow">
      {/* Left section - Placeholder for spacing */}
      <div className="flex items-center gap-4">
        {/* Leave empty or use a toggle icon here if needed */}
      </div>

      {/* Right section - Welcome + Avatar + Logos */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-700">
          Hello, <span className="font-bold">ASM</span>
        </p>
        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
          A
        </div>
        <img src={companyLogo} alt="Company" className="h-10" />
      </div>
    </div>
  );
};

export default Topbar;
