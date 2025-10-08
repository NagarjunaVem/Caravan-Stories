// src/components/citizen/CitizenStatsCards.jsx

const CitizenStatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      subtitle: null
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: (
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      subtitle: 'Awaiting review'
    },
    {
      title: 'In Progress',
      value: stats.open + stats.inProgress + stats.reopened,
      icon: (
        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      subtitle: 'Being worked on'
    },
    {
      title: 'Resolved',
      value: stats.resolved + stats.closed,
      icon: (
        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      subtitle: 'Successfully completed'
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
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {card.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
          {card.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {card.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CitizenStatsCards;