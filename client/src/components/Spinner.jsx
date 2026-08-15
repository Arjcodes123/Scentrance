export default function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-silver-500">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-silver-300" />
      <span className="text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}
