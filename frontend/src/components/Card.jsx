export function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
}
