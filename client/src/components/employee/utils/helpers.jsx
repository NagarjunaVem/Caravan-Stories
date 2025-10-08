// src/components/employee/utils/helpers.js

export const CATEGORIES = [
  "IT", "HR", "Finance", "Facilities", "Management", "Support",
  "Operations", "Safety", "Electrical", "Mechanical", "Civil",
  "Maintenance", "Logistics", "Procurement", "Other"
];

export const PRIORITY_LEVELS = ["Low", "Medium", "High", "Urgent"];

export const STATUS_OPTIONS = ["Pending", "Open", "In Progress", "Resolved", "Closed", "Reopened"];

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
    'Low': 'text-gray-600 dark:text-gray-400',
    'Medium': 'text-yellow-600 dark:text-yellow-400',
    'High': 'text-orange-600 dark:text-orange-400',
    'Urgent': 'text-red-600 dark:text-red-400'
  };
  return colors[priority] || 'text-gray-600';
};

export const getCategoryIcon = (category) => {
  const icons = {
    'IT': '💻',
    'HR': '👥',
    'Finance': '💰',
    'Facilities': '🏢',
    'Management': '📊',
    'Support': '🤝',
    'Operations': '⚙️',
    'Safety': '🛡️',
    'Electrical': '⚡',
    'Mechanical': '🔧',
    'Civil': '🏗️',
    'Maintenance': '🔨',
    'Logistics': '📦',
    'Procurement': '🛒',
    'Other': '📋'
  };
  return icons[category] || '📋';
};

export const filterAndSortTickets = (tickets, filterStatus, sortBy) => {
  let filtered = [...tickets];
  
  // Filter by status
  if (filterStatus !== 'all') {
    filtered = filtered.filter(t => t.status === filterStatus);
  }
  
  // Sort tickets
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'priority':
        const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'dueDate':
        return new Date(a.dueDate) - new Date(b.dueDate);
      default:
        return 0;
    }
  });
  
  return filtered;
};

export const exportTicketsToCSV = (tickets, filename = 'tickets_export') => {
  const csvHeaders = [
    'Ticket ID', 'Title', 'Description', 'Category', 'Priority',
    'Status', 'Location', 'Created Date', 'Due Date'
  ];

  const csvData = tickets.map(ticket => [
    ticket.ticketId,
    `"${ticket.title.replace(/"/g, '""')}"`,
    `"${ticket.description.replace(/"/g, '""')}"`,
    ticket.category,
    ticket.priority,
    ticket.status,
    `"${(ticket.location || '').replace(/"/g, '""')}"`,
    new Date(ticket.createdAt).toLocaleDateString(),
    new Date(ticket.dueDate).toLocaleDateString()
  ]);

  const csvContent = [
    csvHeaders.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};