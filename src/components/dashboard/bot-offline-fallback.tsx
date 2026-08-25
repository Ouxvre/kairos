export function BotOfflineFallback({ error }: { error?: string }) {
  return (
    <section className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center backdrop-blur-md">
      <span className="relative flex size-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
        <span className="relative inline-flex size-3 rounded-full bg-red-500" />
      </span>
      <h2 className="mt-4 font-serif text-xl text-white">
        Bot unreachable, waiting to reconnect...
      </h2>
      <p className="mt-2 max-w-sm text-sm text-white/50">
        Kairos retries every 5 seconds, up to 5 attempts. Make sure your
        Freqtrade container is running.
      </p>
      {error && (
        <p className="mt-3 break-all font-mono text-xs text-red-300">{error}</p>
      )}
    </section>
  );
}
