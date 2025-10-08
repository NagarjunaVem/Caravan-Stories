// src/components/citizen/utils/helpers.js

export const getStatusColor = (status) => {
  const colors = {
    'Pending': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    'Open': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    'Reopened': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority) => {
  const colors = {
    'Low': 'text-green-600 dark:text-green-400',
    'Medium': 'text-yellow-600 dark:text-yellow-400',
    'High': 'text-orange-600 dark:text-orange-400',
    'Urgent': 'text-red-600 dark:text-red-400'
  };
  return colors[priority] || 'text-gray-600';
};

export const getStatusSteps = (currentStatus) => {
  const steps = [
    { name: 'Submitted', status: 'Pending', icon: '📝' },
    { name: 'Acknowledged', status: 'Open', icon: '👁️' },
    { name: 'In Progress', status: 'In Progress', icon: '🔧' },
    { name: 'Resolved', status: 'Resolved', icon: '✅' },
    { name: 'Closed', status: 'Closed', icon: '🔒' }
  ];

  const statusOrder = ['Pending', 'Open', 'In Progress', 'Resolved', 'Closed'];
  let currentIndex = statusOrder.indexOf(currentStatus);
  
  // Handle Reopened status
  if (currentStatus === 'Reopened') {
    currentIndex = 2; // Show as In Progress
  }
  
  return steps.map((step, index) => ({
    ...step,
    completed: index <= currentIndex,
    current: index === currentIndex
  }));
};