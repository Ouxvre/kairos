"use client";

import { useState } from "react";

const TABS = ["Positions", "Orders", "News"];

export function PositionsPanel() {
  const [activeTab, setActiveTab] = useState("Positions");

  return (
    <>
      {/* Tabs */}
      <div className="flex h-7 shrink-0 items-center border-b border-white/[0.06]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-2.5 py-1 text-[11px] font-medium transition-colors ${
              activeTab === tab ? "bg-white/[0.06] text-white" : "text-white/35 hover:text-white/55"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mb-1 font-mono text-[13px] text-white/30">
            {activeTab === "Positions"
              ? "No open positions"
              : activeTab === "Orders"
                ? "No pending orders"
                : "No news yet"}
          </div>
          <div className="cursor-pointer font-mono text-[11px] text-blue-400/50 transition-colors hover:text-blue-400/70">
            {activeTab === "Positions"
              ? "Place a trade to see active positions"
              : "Configure to get started"}
          </div>
        </div>
      </div>
    </>
  );
}
