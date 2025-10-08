// src/components/employee/RecentTicketsList.jsx
import { getCategoryIcon, getStatusColor, getPriorityColor } from './utils/helpers';

const RecentTicketsList = ({ tickets, onTicketClick, isEmployee }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEmployee ? 'Recent Assigned Tickets' : 'Recent Tickets'}
        </h2>
      </div>
      <div className="p-6 space-y-4">
        {tickets.slice(0, 5).map((ticket) => (
          <div 
            key={ticket.ticketId}
            onClick={() => onTicketClick(ticket.ticketId)}
            className="flex items-start gap-4 p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <div className="text-2xl">{getCategoryIcon(ticket.category)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {ticket.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {ticket.ticketId}
                    {isEmployee && ticket.submittedBy && (
                      <span className="ml-2 text-xs">
                        by {ticket.submittedBy.name}
                      </span>
                    )}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority} Priority
                </span>
                <span>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {isEmployee ? 'No tickets assigned to you yet.' : 'No tickets yet. Create your first ticket!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTicketsList;