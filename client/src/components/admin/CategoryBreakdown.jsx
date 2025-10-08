// src/components/admin/CategoryBreakdown.jsx
import { getCategoryColor } from './utils/constants';
import { toast } from 'react-toastify';

const CategoryBreakdown = ({ stats, allTickets }) => {
  const exportToCSV = () => {
    const csvHeaders = [
      'Ticket ID', 'Title', 'Description', 'Category', 'Priority',
      'Status', 'Submitted By', 'Assigned To', 'Location',
      'Created Date', 'Due Date', 'Is Overdue'
    ];

    const csvData = allTickets.map(ticket => {
      const isOverdue = new Date(ticket.dueDate) < new Date() && 
                     !['Resolved', 'Closed'].includes(ticket.status);
      
      return [
        ticket.ticketId,
        `"${ticket.title.replace(/"/g, '""')}"`,
        `"${ticket.description.replace(/"/g, '""')}"`,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.submittedBy?.name || 'Unknown',
        ticket.assignedTo?.name || ticket.assignedTo?.department || 'Unassigned',
        `"${(ticket.location || '').replace(/"/g, '""')}"`,
        new Date(ticket.createdAt).toLocaleDateString(),
        new Date(ticket.dueDate).toLocaleDateString(),
        isOverdue ? 'Yes' : 'No'
      ];
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tickets_summary_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Tickets exported successfully!');
  };

  if (!stats.byCategory || stats.byCategory.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tickets by Category
        </h2>
        <button
          onClick={exportToCSV}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to CSV
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.byCategory.map((cat, index) => (
          <div key={index} className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
            <p className={`text-sm font-medium ${getCategoryColor(cat.category)}`}>
              {cat.category}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {cat.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdown;