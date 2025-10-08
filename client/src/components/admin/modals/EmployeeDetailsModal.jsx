// src/components/admin/modals/EmployeeDetailsModal.jsx
import { DEPARTMENTS } from '../utils/constants';

const EmployeeDetailsModal = ({ isOpen, onClose, employee, onUpdateDepartment }) => {
  if (!isOpen || !employee) return null;

  const handleDepartmentChange = (e) => {
    const newDepartment = e.target.value;
    if (window.confirm(`Change department to ${newDepartment}?`)) {
      onUpdateDepartment(employee._id, newDepartment);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Employee Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-2xl">
              {employee.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {employee.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {employee.email}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-zinc-800 pt-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Department
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {employee.department || 'Unassigned'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Joined Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(employee.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Change Department
              </label>
              <select
                defaultValue={employee.department}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;