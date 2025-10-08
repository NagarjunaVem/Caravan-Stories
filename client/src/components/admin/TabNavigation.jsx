// src/components/admin/TabNavigation.jsx

const TabNavigation = ({ activeTab, onTabChange, ticketsCount, employeesCount }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tickets', label: `Tickets (${ticketsCount})` },
    { id: 'employees', label: `Employees (${employeesCount})` }
  ];

  return (
    <div className="mb-8 border-b border-gray-200 dark:border-zinc-800">
      <nav className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;