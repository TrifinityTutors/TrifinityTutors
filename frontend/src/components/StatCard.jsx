import React from "react";

export function StatCard({ label, value, delta, icon: Icon, accent = "primary" }) {
  const accentColors = {
    primary: "text-blue-600 bg-blue-50",
    success: "text-green-600 bg-green-50",
    warning: "text-amber-600 bg-amber-50",
    danger: "text-red-600 bg-red-50"
  };

  const deltaColors = {
    primary: "text-blue-600",
    success: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600"
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <p className={`text-xs font-medium ${deltaColors[accent]}`}>{delta}</p>
        </div>
        {Icon && (
          <div className={`rounded-lg p-3 flex-shrink-0 ${accentColors[accent]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
