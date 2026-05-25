export function Button({ 
  size = "md", 
  variant = "primary", 
  className = "", 
  children, 
  ...props 
}) {
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-sm hover:shadow-md",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
  };

  return (
    <button
      className={`rounded-lg font-medium transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
