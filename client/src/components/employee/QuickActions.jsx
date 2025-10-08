// src/components/employee/QuickActions.jsx

const QuickActions = ({ 
  isEmployee, 
  onViewAssigned, 
  onCreateTicket, 
  onViewMyTickets, 
  onExport 
}) => {
  const actions = [
    ...(isEmployee ? [{
      title: 'View Assigned Tickets',
      description: 'Manage tickets assigned to you',
      icon: (
        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      onClick: onViewAssigned
    }] : []),
    {
      title: 'Create New Ticket',
      description: 'Report an issue or request',
      icon: (
        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      onClick: onCreateTicket
    },
    {
      title: 'My Submitted Tickets',
      description: 'Track tickets you\'ve created',
      icon: (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      onClick: onViewMyTickets
    },
    {
      title: 'Export Tickets',
      description: 'Download tickets as CSV',
      icon: (
        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      onClick: onExport
    }
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
      </div>
      <div className="p-6 space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="w-full p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left flex items-center gap-3"
          >
            <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center`}>
              {action.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{action.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;