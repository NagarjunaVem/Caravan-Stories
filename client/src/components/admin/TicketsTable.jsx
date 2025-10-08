// src/components/admin/TicketsTable.jsx
import { getStatusColor, getCategoryColor } from './utils/constants';
import { toast } from 'react-toastify';

const TicketsTable = ({ tickets, onAssignTicket }) => {
  const exportToCSV = () => {
    const csvHeaders = [
      'Ticket ID', 'Title', 'Description', 'Category', 'Priority',
      'Status', 'Submitted By', 'Assigned To', 'Location',
      'Created Date', 'Due Date', 'Is Overdue'
    ];

    const csvData = tickets.map(ticket => {
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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Tickets ({tickets.length})
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
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ticket ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Submitted By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
            {tickets.length > 0 ? (
              tickets.map((ticket) => {
                const isOverdue = new Date(ticket.dueDate) < new Date() && 
                                 !['Resolved', 'Closed'].includes(ticket.status);
                
                return (
                  <tr 
                    key={ticket._id}
                    className={`hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      isOverdue ? 'bg-red-50 dark:bg-red-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {ticket.ticketId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate" title={ticket.title}>
                        {ticket.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getCategoryColor(ticket.category)}`}>
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {ticket.submittedBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {ticket.assignedTo?.name || (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                        {new Date(ticket.dueDate).toLocaleDateString()}
                        {isOverdue && (
                          <div className="text-xs">Overdue</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => onAssignTicket(ticket)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                      >
                        {ticket.assignedTo ? 'Reassign' : 'Assign'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No tickets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketsTable;