"use client";

import { useState } from "react";
import { Terminal, Send, Sparkles, Play, RefreshCw, BarChart2 } from "lucide-react";

export default function StrategyLabPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Welcome to Strategy Lab. Describe a trading strategy or ask me to backtest a rule (e.g. 'Backtest RSI crossover strategy on BTC/USDT with 14 period')."
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMsg = prompt;
    setPrompt("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    // Simulate AI response / backtest generation
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Analyzing strategy request: "${userMsg}"...\n\n- Universe: BTC/USDT (1H candles)\n- Rule: RSI(14) < 30 buy, RSI(14) > 70 sell\n- Backtest Results (Dry-run simulation):\n  • Total Return: +24.8%\n  • Win Rate: 62.4%\n  • Max Drawdown: -8.1%\n  • Sharpe Ratio: 1.84\n\nGenerated Python strategy template ready for deployment.`
        }
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-white">Strategy Lab</h1>
          <p className="mt-1 font-mono text-xs text-white/40">
            Natural-language strategy research, backtesting, and factor discovery via AI agent.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-mono text-indigo-300">
            <Sparkles className="size-3 text-indigo-400" />
            AI Enabled
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Chat / Prompt interface */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
            <span className="font-mono text-xs text-white/60 flex items-center gap-2">
              <Terminal className="size-3.5 text-indigo-400" />
              Strategy Research Chat
            </span>
            <span className="font-mono text-[10px] text-white/30">Vibe-Trading Engine v0.1.14</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[450px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono text-xs ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/10 text-indigo-300 border border-white/10"
                  }`}
                >
                  {m.role === "user" ? "U" : "AI"}
                </div>
                <div
                  className={`rounded-lg p-3.5 text-sm whitespace-pre-line font-mono ${
                    m.role === "user"
                      ? "bg-indigo-600/20 text-indigo-100 border border-indigo-500/30"
                      : "bg-white/5 text-white/80 border border-white/10"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-white/10 text-indigo-300 border border-white/10 flex items-center justify-center font-mono text-xs">
                  AI
                </div>
                <div className="rounded-lg p-3.5 text-sm font-mono bg-white/5 text-white/60 border border-white/10 flex items-center gap-2">
                  <RefreshCw className="size-4 animate-spin text-indigo-400" />
                  Running strategy backtest & factor scan...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/[0.01] flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI to backtest a strategy (e.g. Moving Average crossover)..."
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="size-4" />
              Run
            </button>
          </form>
        </div>

        {/* Quick templates & stats */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
            <h3 className="font-serif text-base text-white mb-3 flex items-center gap-2">
              <BarChart2 className="size-4 text-indigo-400" />
              Strategy Templates
            </h3>
            <div className="space-y-2">
              {[
                "RSI Reversal (14-period)",
                "EMA Crossover (10/50)",
                "Bollinger Band Breakout",
                "MACD Momentum Scan"
              ].map((template) => (
                <button
                  key={template}
                  onClick={() => setPrompt(`Backtest ${template} strategy on BTC/USDT`)}
                  className="w-full text-left rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs font-mono text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>{template}</span>
                  <Play className="size-3 text-indigo-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md flex-1">
            <h3 className="font-serif text-base text-white mb-3">Engine Status</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/40">Vibe-Trading Core</span>
                <span className="text-emerald-400">Connected</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/40">Alpha Zoo Factors</span>
                <span className="text-white/80">460 Available</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/40">Market Data Sources</span>
                <span className="text-white/80">18 Connected</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-white/40">Sandboxed Execution</span>
                <span className="text-emerald-400">Secured (AST)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
