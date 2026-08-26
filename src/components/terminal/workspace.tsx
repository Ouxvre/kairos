"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { LeftSidebar } from "./panels/left-sidebar";
import { PanelFrame } from "./panel-frame";
import { getTool } from "./tools/registry";
import { PickerMenu } from "./tools/picker-menu";
import { usePair } from "./pair-context";

import { ChartPanel } from "./panels/chart-panel";
import { OrderbookPanel } from "./panels/orderbook-panel";
import { ExecutionPanel } from "./panels/execution-panel";
import { PositionsPanel } from "./panels/positions-panel";
import { AccountSummary } from "./panels/account-summary";
import { LiveTicker } from "@/components/dashboard/live-ticker";

/* ── Types ────────────────────────────────────── */

type Edge = "sidebar" | "sidepanel" | "orderbook" | "execution" | "bottom";
type SlotId = "chart" | "orderbook" | "execution" | "bottom" | "sidepanel";
type ToolId = string | null;

interface DragState {
  edge: Edge;
  startX: number;
  startY: number;
  startValue: number;
}

/* ── Constants ────────────────────────────────── */

const SIZE_KEY = "kairos-terminal-sizes";
const TOOL_KEY = "kairos-terminal-tools";

const DEFAULT_SIZES = {
  sidebarW: 180,
  sidepanelW: 180,
  orderbookW: 220,
  executionW: 180,
  bottomH: 200,
};

const DEFAULT_TOOLS: Record<SlotId, ToolId> = {
  chart: "chart",
  orderbook: "orderbook",
  execution: "execution",
  bottom: "positions",
  sidepanel: "account",
};

const LIMITS: Record<keyof typeof DEFAULT_SIZES, { min: number; max: number }> = {
  sidebarW:   { min: 160, max: 320 },
  sidepanelW: { min: 160, max: 400 },
  orderbookW: { min: 190, max: 420 },
  executionW: { min: 165, max: 340 },
  bottomH:    { min: 120, max: Number.MAX_SAFE_INTEGER },
};

const COMPONENTS: Record<string, React.ComponentType> = {
  chart: ChartPanel,
  orderbook: OrderbookPanel,
  execution: ExecutionPanel,
  positions: PositionsPanel,
  "crypto-price": LiveTicker,
  account: AccountSummary,
};

/* ── Helpers ──────────────────────────────────── */

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function loadSizes() {
  try {
    const raw = localStorage.getItem(SIZE_KEY);
    return raw ? { ...DEFAULT_SIZES, ...JSON.parse(raw) } : DEFAULT_SIZES;
  } catch {
    return DEFAULT_SIZES;
  }
}

function saveSizes(s: typeof DEFAULT_SIZES) {
  try {
    localStorage.setItem(SIZE_KEY, JSON.stringify(s));
  } catch {}
}

function loadTools(): Record<SlotId, ToolId> {
  try {
    const raw = localStorage.getItem(TOOL_KEY);
    return raw ? { ...DEFAULT_TOOLS, ...JSON.parse(raw) } : DEFAULT_TOOLS;
  } catch {
    return DEFAULT_TOOLS;
  }
}

function saveTools(t: Record<SlotId, ToolId>) {
  try {
    localStorage.setItem(TOOL_KEY, JSON.stringify(t));
  } catch {}
}

/* ── Empty slot ────────────────────────────────── */

function EmptySlot({ onPick }: { onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex h-full flex-col items-center justify-center relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-white/[0.12] text-white/20 transition-all hover:bg-white/[0.04] hover:border-white/25 hover:text-white/50"
      >
        <Plus className="size-5" />
      </button>
      {open && (
        <PickerMenu
          anchorRef={btnRef}
          onSelect={(id) => {
            onPick(id);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/* ── Component ────────────────────────────────── */

export function Workspace() {
  const { contractsDocked } = usePair();
  const dragRef = useRef<DragState | null>(null);
  const [sizes, setSizes] = useState(loadSizes);
  const [tools, setTools] = useState<Record<SlotId, ToolId>>(loadTools);
  const [isDragging, setIsDragging] = useState(false);

  const updateSlot = useCallback((slot: SlotId, toolId: string | null) => {
    setTools((prev) => {
      const next = { ...prev, [slot]: toolId };
      saveTools(next);
      return next;
    });
  }, []);

  /* ── drag ── */

  const onGripDown = useCallback(
    (edge: Edge, e: React.MouseEvent) => {
      e.preventDefault();
      const startValue =
        edge === "sidebar"
          ? sizes.sidebarW
          : edge === "sidepanel"
            ? sizes.sidepanelW
            : edge === "orderbook"
              ? sizes.orderbookW
              : edge === "execution"
                ? sizes.executionW
                : sizes.bottomH;

      dragRef.current = { edge, startX: e.clientX, startY: e.clientY, startValue };
      setIsDragging(true);
    },
    [sizes],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      setSizes((prev: typeof DEFAULT_SIZES) => {
        const next = { ...prev };
        switch (d.edge) {
          case "sidebar":
            next.sidebarW = clamp(d.startValue + dx, LIMITS.sidebarW.min, LIMITS.sidebarW.max);
            break;
          case "sidepanel":
            next.sidepanelW = clamp(d.startValue + dx, LIMITS.sidepanelW.min, LIMITS.sidepanelW.max);
            break;
          case "orderbook":
            next.orderbookW = clamp(d.startValue - dx, LIMITS.orderbookW.min, LIMITS.orderbookW.max);
            break;
          case "execution":
            next.executionW = clamp(d.startValue - dx, LIMITS.executionW.min, LIMITS.executionW.max);
            break;
          case "bottom":
            next.bottomH = clamp(
              d.startValue - dy,
              LIMITS.bottomH.min,
              /* jaga baris atas (chart) tetap ≥ ~280px */
              Math.max(LIMITS.bottomH.min, window.innerHeight - 350),
            );
            break;
        }
        return next;
      });
    };

    const onUp = () => {
      dragRef.current = null;
      setIsDragging(false);
      setSizes((s: typeof DEFAULT_SIZES) => {
        saveSizes(s);
        return s;
      });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  /* ── grid layout ─────────────────────────────────────────────────────────
     sidepanel is taken OUT of grid flow and positioned absolutely.
     We use a 3-column grid when docked, 4-column when not:
       non-docked: sidebarW | 1fr | orderbookW | executionW
       docked:            1fr | orderbookW | executionW
     The bottom grid-area spans all columns; sidepanel overlays the
     bottom-left corner via absolute positioning.
  ── */
  const gridStyle: React.CSSProperties = contractsDocked
    ? {
        gridTemplateColumns: `1fr ${sizes.orderbookW}px ${sizes.executionW}px`,
        gridTemplateRows: `1fr ${sizes.bottomH}px`,
        gridTemplateAreas: `"chart orderbook execution" "bottom bottom bottom"`,
      }
    : {
        gridTemplateColumns: `${sizes.sidebarW}px 1fr ${sizes.orderbookW}px ${sizes.executionW}px`,
        gridTemplateRows: `1fr ${sizes.bottomH}px`,
        gridTemplateAreas: `"sidebar chart orderbook execution" "bottom bottom bottom bottom"`,
      };

  const topRowHeight = `calc(100% - ${sizes.bottomH}px - 16px)`;

  const renderZone = (slot: SlotId) => {
    /* sidepanel (account card) is always pinned — no close button, falls back to AccountSummary */
    if (slot === "sidepanel") {
      const toolId = tools[slot] ?? "account";
      const Comp = COMPONENTS[toolId] ?? AccountSummary;
      const label = getTool(toolId)?.label ?? toolId;
      return (
        <PanelFrame
          title={label}
          onToolSelect={(id) => updateSlot(slot, id)}
        >
          <Comp />
        </PanelFrame>
      );
    }

    const toolId = tools[slot];
    if (!toolId) {
      return <EmptySlot onPick={(id) => updateSlot(slot, id)} />;
    }

    const Comp = COMPONENTS[toolId];
    const label = getTool(toolId)?.label ?? toolId;

    return (
      <PanelFrame
        title={label}
        onClose={() => updateSlot(slot, null)}
        onToolSelect={(id) => updateSlot(slot, id)}
      >
        {Comp ? <Comp /> : <EmptySlot onPick={(id) => updateSlot(slot, id)} />}
      </PanelFrame>
    );
  };

  return (
    <div className="kt-workspace" style={gridStyle}>
      {/* Sidebar — pairs panel */}
      {!contractsDocked && (
        <div className="kt-zone kt-zone-sidebar">
          <LeftSidebar />
        </div>
      )}

      {/* Side panel — account card, absolutely positioned bottom-left, independent of grid */}
      <div
        className="kt-zone kt-zone-sidepanel"
        style={{
          position: "absolute",
          left: 6,
          bottom: 6,
          width: sizes.sidepanelW,
          /* bottomH equals the grid row height; the card sits in the same
             bottom row as Positions, pinned 6 px from the workspace edge */
          height: sizes.bottomH,
          zIndex: 10,
        }}
      >
        {renderZone("sidepanel")}
      </div>

      {/* Swapable zones */}
      <div className="kt-zone kt-zone-chart">{renderZone("chart")}</div>
      <div className="kt-zone kt-zone-orderbook">{renderZone("orderbook")}</div>
      <div className="kt-zone kt-zone-execution">{renderZone("execution")}</div>
      {/* bottom panel gets margin-left to avoid overlapping sidepanel */}
      <div
        className="kt-zone kt-zone-bottom"
        style={{ marginLeft: sizes.sidepanelW + 6 }}
      >
        {renderZone("bottom")}
      </div>

      {/* ── Resize grips ── */}

      {/* Sidebar right edge — non-docked, top row only */}
      {!contractsDocked && (
        <div
          className="kt-grip kt-grip-v"
          style={{ left: sizes.sidebarW + 1, top: 4, height: topRowHeight }}
          onMouseDown={(e) => onGripDown("sidebar", e)}
        />
      )}

      {/* Sidepanel right edge — always visible, bottom row, controls sidepanelW independently */}
      <div
        className="kt-grip kt-grip-v"
        style={{
          left: sizes.sidepanelW + 1,
          bottom: 6,
          height: `${sizes.bottomH - 6}px`,
        }}
        onMouseDown={(e) => onGripDown("sidepanel", e)}
      />

      {/* Orderbook left edge (width) */}
      <div
        className="kt-grip kt-grip-v"
        style={{ right: sizes.executionW + sizes.orderbookW + 1, top: 4, height: topRowHeight }}
        onMouseDown={(e) => onGripDown("orderbook", e)}
      />

      {/* Execution left edge (width) */}
      <div
        className="kt-grip kt-grip-v"
        style={{ right: sizes.executionW + 1, top: 4, height: topRowHeight }}
        onMouseDown={(e) => onGripDown("execution", e)}
      />

      {/* Bottom panel top edge (height) — starts after sidepanel */}
      <div
        className="kt-grip kt-grip-h"
        style={{ bottom: sizes.bottomH + 1, left: sizes.sidepanelW + 12, right: 6 }}
        onMouseDown={(e) => onGripDown("bottom", e)}
      />

      {/* Corner: chart/orderbook + bottom */}
      <div
        className="kt-grip kt-grip-corner"
        style={{ right: sizes.executionW + sizes.orderbookW - 2, bottom: sizes.bottomH - 2 }}
        onMouseDown={(e) => {
          onGripDown("orderbook", e);
          onGripDown("bottom", e);
        }}
      />

      {/* Corner: chart/execution + bottom */}
      <div
        className="kt-grip kt-grip-corner"
        style={{ right: sizes.executionW - 2, bottom: sizes.bottomH - 2 }}
        onMouseDown={(e) => {
          onGripDown("execution", e);
          onGripDown("bottom", e);
        }}
      />

      {/* Drag overlay */}
      {isDragging && <div className="kt-drag-overlay" />}
    </div>
  );
}