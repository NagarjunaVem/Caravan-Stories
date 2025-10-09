// src/components/employee/EmployeeStatsCards.jsx

const EmployeeStatsCards = ({ stats, isEmployee }) => {
  const cards = [
    {
      title: isEmployee ? 'Assigned Tickets' : 'Total Tickets',
      value: stats.total,
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      subtitle: 'All tickets'
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      subtitle: 'Awaiting assignment'
    },
    {
      title: 'Active Work',
      value: stats.open + stats.inProgress + stats.reopened,
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      subtitle: (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-medium">{stats.open} open</span>
            <span className="text-gray-400">•</span>
            <span className="text-yellow-600 dark:text-yellow-400">{stats.inProgress} in progress</span>
          </div>
          {stats.reopened > 0 && (
            <span className="text-orange-600 dark:text-orange-400 text-xs">
              {stats.reopened} reopened
            </span>
          )}
        </div>
      )
    },
    {
      title: 'Completed',
      value: stats.completed || (stats.resolved + stats.closed),
      icon: (
        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      subtitle: (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400 font-medium">
              {stats.resolved} resolved
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              {stats.closed} closed
            </span>
          </div>
          <span className="text-green-600 dark:text-green-400 text-xs font-medium">
            {((stats.completed || (stats.resolved + stats.closed)) / (stats.total || 1) * 100).toFixed(0)}% completion rate
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {card.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-4 text-sm">
            {typeof card.subtitle === 'string' ? (
              <span className="text-gray-600 dark:text-gray-400">{card.subtitle}</span>
            ) : (
              card.subtitle
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeStatsCards;