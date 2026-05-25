export function Badge({ className = "", children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200 ${className}`}>
      {children}
    </span>
  );
}
