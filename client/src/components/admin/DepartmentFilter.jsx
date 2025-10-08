// src/components/admin/DepartmentFilter.jsx
import { DEPARTMENTS } from './utils/constants';

const DepartmentFilter = ({ selectedDepartment, onDepartmentChange, employees }) => {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <button
        onClick={() => onDepartmentChange('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedDepartment === 'all'
            ? 'bg-indigo-600 text-white'
            : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
        }`}
      >
        All Departments ({employees.length})
      </button>
      {DEPARTMENTS.map((dept) => {
        const count = employees.filter(e => e.department === dept).length;
        return (
          <button
            key={dept}
            onClick={() => onDepartmentChange(dept)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDepartment === dept
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
            }`}
          >
            {dept} ({count})
          </button>
        );
      })}
    </div>
  );
};

export default DepartmentFilter;