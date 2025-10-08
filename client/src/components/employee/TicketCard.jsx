// src/components/employee/TicketCard.jsx
import { getCategoryIcon, getStatusColor, getPriorityColor } from './utils/helpers';

const TicketCard = ({ ticket, onViewDetails, onReopen, backendUrl }) => {
  const isOverdue = new Date(ticket.dueDate) < new Date() && 
                   !['Resolved', 'Closed'].includes(ticket.status);
  const canReopen = ['Resolved', 'Closed'].includes(ticket.status);

  return (
    <div 
      className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm border ${
        isOverdue ? 'border-red-300 dark:border-red-900' : 'border-gray-200 dark:border-zinc-800'
      } hover:shadow-md transition-shadow`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {ticket.ticketId}
              </p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {ticket.category}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {ticket.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {ticket.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority} Priority
          </span>
          <span>
            Due: {new Date(ticket.dueDate).toLocaleDateString()}
          </span>
        </div>

        {isOverdue && (
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              ⚠️ This ticket is overdue
            </p>
          </div>
        )}

        {ticket.assignedTo && (
          <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
            Assigned to: <span className="font-medium">{ticket.assignedTo.name}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(ticket.ticketId)}
            className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
          >
            View Details
          </button>
          {canReopen && (
            <button
              onClick={() => {
                const reason = prompt('Please provide a reason for reopening:');
                if (reason) {
                  onReopen(ticket.ticketId, reason);
                }
              }}
              className="px-3 py-2 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm rounded-lg transition-colors"
            >
              Reopen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;