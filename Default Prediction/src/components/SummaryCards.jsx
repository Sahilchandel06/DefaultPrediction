// src/components/SummaryCards.jsx
import React from "react";

function SummaryCards({ data }) {
  return (
    <div className="summary-cards">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
        {["Approve", "Review", "Reject"].map((type) => (
          <div
            key={type}
            className={`p-4 rounded-lg shadow-md text-white ${
              type === "Approve"
                ? "bg-green-500"
                : type === "Review"
                ? "bg-yellow-500 text-black"
                : "bg-red-500"
            }`}
          >
            <div className="flex items-center gap-3 text-xl font-semibold">
              <i
                className={`fas ${
                  type === "Approve"
                    ? "fa-check-circle"
                    : type === "Review"
                    ? "fa-exclamation-circle"
                    : "fa-times-circle"
                }`}
              ></i>
              {type}
            </div>
            <p className="text-3xl mt-2">{data[type] || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SummaryCards;
