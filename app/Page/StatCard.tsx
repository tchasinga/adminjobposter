// StatCard Component
const StatCard = ({ 
    title, 
    value, 
    icon, 
    
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
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
        <div>

        </div>
      </div>
    );
  };
  export default StatCard;  // Exporting the StatCard component