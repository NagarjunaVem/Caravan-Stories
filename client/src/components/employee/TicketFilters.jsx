// src/components/employee/TicketFilters.jsx
import { STATUS_OPTIONS } from './utils/helpers';

const TicketFilters = ({ filterStatus, onFilterChange, sortBy, onSortChange, onExport }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1 flex flex-wrap gap-2">
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="priority">Priority</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="dueDate">Due Date</option>
        </select>
      </div>

      {onExport && (
        <button
          onClick={onExport}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      )}
    </div>
  );
};

export default TicketFilters;