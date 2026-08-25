import { LiveMarketWidget } from "@/components/dashboard/live-market-widget";
import { NewsWidget } from "@/components/dashboard/news-widget";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-white mb-8">Dashboard Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--k-panel-bg)]/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
          <div className="text-xs uppercase tracking-wider text-white/60 mb-2">Total Balance</div>
          <div className="text-2xl font-bold text-white">$0.00</div>
          <div className="text-xs text-white/40 mt-1">USDT</div>
        </div>

        <div className="bg-[var(--k-panel-bg)]/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
          <div className="text-xs uppercase tracking-wider text-white/60 mb-2">Daily P&L</div>
          <div className="text-2xl font-bold text-[var(--k-up)]">+$0.00</div>
          <div className="text-xs text-white/40 mt-1">+0.00%</div>
        </div>

        <div className="bg-[var(--k-panel-bg)]/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
          <div className="text-xs uppercase tracking-wider text-white/60 mb-2">Win Rate</div>
          <div className="text-2xl font-bold text-white">0%</div>
          <div className="text-xs text-white/40 mt-1">0/0 trades</div>
        </div>

        <div className="bg-[var(--k-panel-bg)]/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
          <div className="text-xs uppercase tracking-wider text-white/60 mb-2">Open Trades</div>
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-xs text-white/40 mt-1">Active positions</div>
        </div>
      </div>

      {/* Live market + news */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 mb-8">
        <LiveMarketWidget />
        <NewsWidget />
      </div>

      {/* Bot Status */}
      <div className="bg-[var(--k-panel-bg)]/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif text-white">Bot Status</h2>
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs uppercase tracking-wider rounded-full">
            Stopped
          </span>
        </div>
        <p className="text-sm text-white/60">
          Connect your Freqtrade bot to start automated trading. Configure your bot settings in the Bot section.
        </p>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-[var(--k-panel-bg)]/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
        <h2 className="text-xl font-serif text-white mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-white/40 text-sm">
          No trading activity yet. Start your bot to see trades here.
        </div>
      </div>
    </div>
  );
}
