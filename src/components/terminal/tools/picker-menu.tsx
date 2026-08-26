"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getToolGroups } from "./registry";

interface PickerMenuProps {
  onSelect: (toolId: string) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function PickerMenu({ onSelect, onClose, anchorRef }: PickerMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left + rect.width / 2,
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const groups = getToolGroups();

  const menu = (
    <div
      ref={ref}
      style={
        coords
          ? {
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: "translateX(-50%)",
            }
          : undefined
      }
      className={`z-[9999] w-56 overflow-hidden rounded-lg border border-white/[0.1] bg-[#161618] shadow-2xl shadow-black/80 ${
        !coords ? "absolute left-1/2 top-full mt-1 -translate-x-1/2" : ""
      }`}
    >
      {groups.map((group, gi) => (
        <div key={gi} className={gi > 0 ? "border-t border-white/[0.06]" : ""}>
          {group.label && (
            <div className="px-3 pb-1 pt-2.5 text-[10px] font-medium uppercase tracking-wider text-white/30">
              {group.label}
            </div>
          )}
          <div className={group.label ? "pb-1.5" : "pt-1.5"}>
            {group.items.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  onSelect(tool.id);
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[12px] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <tool.icon className="size-3.5 text-white/30" />
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Render to document.body via Portal to avoid overflow:hidden clipping
  if (typeof document === "undefined") return null;
  return createPortal(menu, document.body);
}
