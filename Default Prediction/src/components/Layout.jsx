import React from "react";
import { Link, useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation(); // This will track route changes

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white">
          <div className="flex items-center ml-7 h-16 px-4 border-b border-blue-700">
            <div className="flex items-left">
              <i className="fas fa-chart-line text-2xl text-blue-300"></i>
              <span className="text-xl font-semibold">RiskAnalyzer</span>
            </div>
          </div>

          <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              <Link
                to="/"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  location.pathname === "/"
                    ? "bg-blue-700 text-white"
                    : "text-blue-200 hover:bg-blue-700 hover:text-white"
                }`}
              >
                <i className="fas fa-home mr-3"></i>
                Dashboard
              </Link>

              <Link
                to="/analyze"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  location.pathname === "/analyze"
                    ? "bg-blue-700 text-white"
                    : "text-blue-200 hover:bg-blue-700 hover:text-white"
                }`}
              >
                <i className="fas fa-file-upload mr-3"></i>
                Analyze Data
              </Link>

              <Link
                to="/history"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  location.pathname === "/history"
                    ? "bg-blue-700 text-white"
                    : "text-blue-200 hover:bg-blue-700 hover:text-white"
                }`}
              >
                <i className="fas fa-history mr-3"></i>
                Analysis History
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-blue-800 text-white">
          <div className="flex items-center">
            <i className="fas fa-chart-line text-xl text-blue-300 mr-2"></i>
            <span className="text-lg font-semibold">RiskAnalyzer</span>
          </div>
          <button className="p-1 rounded-md text-blue-200 hover:text-white">
            <i className="fas fa-bars"></i>
          </button>
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
