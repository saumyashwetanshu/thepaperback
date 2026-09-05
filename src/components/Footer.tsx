import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 full-width bottom-0 mt-auto z-40 relative">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 w-full max-w-[1440px] mx-auto gap-6 md:gap-0">
        <div className="font-semibold text-lg text-gray-900">The Paperback</div>
        <nav className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
          <Link to="/protocol" className="hover:text-black">Protocol</Link>
          <Link to="/source-directory" className="hover:text-black">Sources</Link>
          <Link to="/fact-check" className="hover:text-black">Fact Check</Link>
          <Link to="/voices" className="hover:text-black">Voices</Link>
          <Link to="/pulse" className="hover:text-black">Pulse</Link>
        </nav>
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} The Paperback
        </div>
      </div>
    </footer>
  );
};
