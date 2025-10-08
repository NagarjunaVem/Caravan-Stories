// src/components/employee/EmployeeTabNavigation.jsx

const EmployeeTabNavigation = ({ 
  activeTab, 
  onTabChange, 
  isEmployee, 
  assignedCount, 
  myTicketsCount 
}) => {
  return (
    <div className="mb-8 border-b border-gray-200 dark:border-zinc-800">
      <nav className="flex gap-8">
        <button
          onClick={() => onTabChange('overview')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Overview
        </button>
        
        {isEmployee && (
          <button
            onClick={() => onTabChange('assigned')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'assigned'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Assigned to Me ({assignedCount})
            </span>
          </button>
        )}
        
        <button
          onClick={() => onTabChange('my-tickets')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'my-tickets'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          My Submitted Tickets ({myTicketsCount})
        </button>
      </nav>
    </div>
  );
};

export default EmployeeTabNavigation;