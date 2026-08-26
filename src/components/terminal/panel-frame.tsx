"use client";

import { useState, useRef } from "react";
import { X, Plus } from "lucide-react";
import { PickerMenu } from "./tools/picker-menu";

interface PanelFrameProps {
  title: string;
  onClose?: () => void;
  onToolSelect?: (toolId: string) => void;
  tabs?: { label: string; active: boolean; onClick: () => void }[];
  children: React.ReactNode;
}

export function PanelFrame({ title, onClose, onToolSelect, tabs, children }: PanelFrameProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const plusBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header bar */}
      <div className="relative flex h-7 shrink-0 items-center gap-1 border-b border-white/[0.08] bg-[#0e0e10] px-2">
        {tabs ? (
          <div className="flex min-w-0 flex-1 items-center gap-0">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={tab.onClick}
                className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  tab.active ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-white/50">
            {title}
          </span>
        )}

        <div className="relative flex shrink-0 items-center gap-0.5 ml-1">
          {onToolSelect && (
            <button
              ref={plusBtnRef}
              onClick={() => setPickerOpen((v) => !v)}
              className="flex h-4.5 w-4.5 items-center justify-center rounded text-white/25 transition-colors hover:bg-white/10 hover:text-white/50"
            >
              <Plus className="size-3" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-4.5 w-4.5 items-center justify-center rounded text-white/25 transition-colors hover:bg-white/10 hover:text-white/50"
            >
              <X className="size-3" />
            </button>
          )}
          {pickerOpen && onToolSelect && (
            <PickerMenu
              anchorRef={plusBtnRef}
              onSelect={(id) => {
                onToolSelect(id);
                setPickerOpen(false);
              }}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col min-h-0 overflow-y-auto overflow-x-hidden">{children}</div>
    </div>
  );
}
