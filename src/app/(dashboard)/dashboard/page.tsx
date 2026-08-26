import { PairProvider } from "@/components/terminal/pair-context";
import { DockBar } from "@/components/terminal/dock-bar";
import { Workspace } from "@/components/terminal/workspace";

export default function DashboardPage() {
  return (
    <PairProvider>
      <div className="flex h-full w-full flex-col overflow-hidden bg-[#0a0a0a]">
        <DockBar />
        <div className="flex min-h-0 flex-1">
          <Workspace />
        </div>
      </div>
    </PairProvider>
  );
}
