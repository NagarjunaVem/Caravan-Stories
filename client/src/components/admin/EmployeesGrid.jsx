// src/components/admin/EmployeesGrid.jsx

const EmployeesGrid = ({ employees, selectedDepartment, onEmployeeClick }) => {
  // Group employees by department
  const employeesByDepartment = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(emp);
    return acc;
  }, {});

  // Filter employees by selected department
  const filteredEmployees = selectedDepartment === 'all' 
    ? employees 
    : employees.filter(emp => emp.department === selectedDepartment);

  const EmployeeCard = ({ employee }) => (
    <div 
      onClick={() => onEmployeeClick(employee)}
      className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
          {employee.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {employee.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {employee.email}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Joined {new Date(employee.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );

  if (selectedDepartment === 'all') {
    return (
      <div className="space-y-6">
        {Object.entries(employeesByDepartment)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([dept, emps]) => (
            <div key={dept} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
              <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dept}
                  </h3>
                  <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm font-medium">
                    {emps.length} {emps.length === 1 ? 'employee' : 'employees'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emps.map((employee) => (
                    <EmployeeCard key={employee._id} employee={employee} />
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedDepartment} Department ({filteredEmployees.length})
        </h3>
      </div>
      <div className="p-6">
        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => (
              <EmployeeCard key={employee._id} employee={employee} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No employees in this department
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesGrid;