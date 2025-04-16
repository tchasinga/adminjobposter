// StatCard Component
const StatCard = ({ 
    title, 
    value, 
    icon, 
    trend, 
    percentage 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    trend: "up" | "down"; 
    percentage: string; 
  }) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-3 rounded-full bg-gray-100 dark:bg-neutral-700">
            {icon}
          </div>
        </div>
        <div className={`mt-3 flex items-center text-sm ${
          trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        }`}>
          {trend === "up" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
          <span className="ml-1">{percentage} {trend === "up" ? "increase" : "decrease"}</span>
        </div>
      </div>
    );
  };

  export default StatCard;  // Exporting the StatCard component