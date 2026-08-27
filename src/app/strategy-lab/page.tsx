'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface BacktestResult {
  win_rate: number;
  max_drawdown: number;
  profitability_ratio: number;
}

export default function StrategyLabPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya siap membantu Anda meracik strategi trading. Ceritakan ide strategi Anda.' }
  ]);
  const [input, setInput] = useState('');
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: 'Baik, saya mengerti. Strategi MA crossover menggunakan EMA 20 dan EMA 50. Entry saat fast EMA cross di atas slow EMA, exit saat cross ke bawah.'
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);
  };

  const handleRunBacktest = () => {
    setIsLoading(true);
    setTimeout(() => {
      setBacktestResult({
        win_rate: 65.4,
        max_drawdown: 12.8,
        profitability_ratio: 2.3
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="kairos-web min-h-screen bg-[var(--k-bg)] text-[var(--k-fg)] p-[calc(24*var(--u))]">
      <div className="max-w-[calc(1200*var(--u))] mx-auto">
        <h1 className="text-[length:calc(48*var(--u))] font-[family-name:var(--font-serif)] mb-[calc(32*var(--u))]">
          Vibe-Trading AI Strategy Lab
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[calc(24*var(--u))]">
          <div className="lg:col-span-2 flex flex-col h-[calc(600*var(--u))]">
            <div className="flex-1 bg-[var(--k-panel-bg)] border border-[var(--k-panel-border)] rounded-[calc(12*var(--u))] p-[calc(16*var(--u))] overflow-y-auto mb-[calc(16*var(--u))]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-[calc(16*var(--u))] ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] p-[calc(12*var(--u))] rounded-[calc(8*var(--u))] ${
                      msg.role === 'user'
                        ? 'bg-[var(--k-accent)] text-[var(--k-bg)]'
                        : 'bg-[var(--k-panel-border)] text-[var(--k-fg)]'
                    }`}
                  >
                    <p className="text-[length:calc(14*var(--u))]">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-[calc(8*var(--u))]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ketik strategi Anda..."
                className="flex-1 bg-[var(--k-panel-bg)] border border-[var(--k-panel-border)] rounded-[calc(8*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-[length:calc(14*var(--u))] text-[var(--k-fg)] placeholder:text-[var(--k-fg)]/50"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[var(--k-accent)] text-[var(--k-bg)] px-[calc(24*var(--u))] py-[calc(12*var(--u))] rounded-[calc(8*var(--u))] text-[length:calc(14*var(--u))] font-medium hover:opacity-90 transition-opacity"
              >
                Kirim
              </button>
            </div>
          </div>

          <div className="space-y-[calc(16*var(--u))]">
            <button
              onClick={handleRunBacktest}
              disabled={isLoading}
              className="w-full bg-[var(--k-up)] text-white px-[calc(24*var(--u))] py-[calc(16*var(--u))] rounded-[calc(8*var(--u))] text-[length:calc(16*var(--u))] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Running Backtest...' : 'Run Backtest'}
            </button>

            {backtestResult && (
              <div className="bg-[var(--k-panel-bg)] border border-[var(--k-panel-border)] rounded-[calc(12*var(--u))] p-[calc(16*var(--u))]">
                <h3 className="text-[length:calc(20*var(--u))] font-medium mb-[calc(16*var(--u))]">
                  Backtest Results
                </h3>
                <div className="space-y-[calc(12*var(--u))]">
                  <div>
                    <p className="text-[length:calc(12*var(--u))] text-[var(--k-fg)]/70 mb-[calc(4*var(--u))]">
                      Win Rate
                    </p>
                    <p className="text-[length:calc(24*var(--u))] font-medium text-[var(--k-up)]">
                      {backtestResult.win_rate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[length:calc(12*var(--u))] text-[var(--k-fg)]/70 mb-[calc(4*var(--u))]">
                      Max Drawdown
                    </p>
                    <p className="text-[length:calc(24*var(--u))] font-medium text-[var(--k-down)]">
                      {backtestResult.max_drawdown}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[length:calc(12*var(--u))] text-[var(--k-fg)]/70 mb-[calc(4*var(--u))]">
                      Profitability Ratio
                    </p>
                    <p className="text-[length:calc(24*var(--u))] font-medium text-[var(--k-accent)]">
                      {backtestResult.profitability_ratio}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
