// src/components/citizen/FilterButtons.jsx

const FilterButtons = ({ filterStatus, onFilterChange, stats, totalTickets }) => {
  const filters = [
    { id: 'all', label: 'All', count: totalTickets },
    { 
      id: 'active', 
      label: 'Active', 
      count: stats.pending + stats.open + stats.inProgress + stats.reopened 
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      count: stats.resolved + stats.closed 
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === filter.id
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          {filter.label} ({filter.count})
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;