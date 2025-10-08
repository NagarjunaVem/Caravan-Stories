// src/components/admin/utils/constants.js

export const DEPARTMENTS = [
  "IT", "HR", "Finance", "Facilities", "Management", "Support",
  "Operations", "Safety", "Electrical", "Mechanical", "Civil",
  "Maintenance", "Logistics", "Procurement"
];

export const CATEGORIES = [
  "IT", "HR", "Finance", "Facilities", "Management", "Support",
  "Operations", "Safety", "Electrical", "Mechanical", "Civil",
  "Maintenance", "Logistics", "Procurement", "Other"
];

export const PRIORITY_LEVELS = ["Low", "Medium", "High", "Urgent"];

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

export const getCategoryColor = (category) => {
  const colors = {
    'IT': 'text-blue-600',
    'HR': 'text-purple-600',
    'Finance': 'text-green-600',
    'Facilities': 'text-orange-600',
    'Management': 'text-red-600',
    'Support': 'text-indigo-600',
  };
  return colors[category] || 'text-gray-600';
};